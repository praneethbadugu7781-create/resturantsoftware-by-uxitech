import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { requireRoles } from "../middleware/rbac.js";
import { generateQrDataUrl } from "../utils/qrGenerator.js";
import { billPdfBuffer } from "../utils/pdfGenerator.js";
import { customerTag, movingAverage } from "../utils/aiInsights.js";
import authRoutes from "./auth/routes.js";
import type { Server } from "socket.io";

// Multer storage setup for menu image uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed (jpeg, jpg, png, webp, gif)"));
  }
});

const router = Router();
const createPagination = (req: any) => ({ take: Math.min(Number(req.query.take ?? 50), 100), skip: Number(req.query.skip ?? 0) });

function restaurantWhere(req: any) {
  return { restaurantId: req.user!.restaurantId };
}

async function activeSession(tableId: string, customerCount = 1) {
  return prisma.tableSession.upsert({
    where: { id: (await prisma.tableSession.findFirst({ where: { tableId, status: "ACTIVE" } }))?.id ?? "new-session" },
    update: {},
    create: { tableId, customerCount }
  });
}

export function apiRoutes(io: Server) {
  router.use("/auth", authRoutes);

  router.get("/health", (_req, res) => res.json({ ok: true, service: "uxitech-api" }));

  router.get(
    "/qr/:tableToken",
    asyncHandler(async (req, res) => {
      const table = await prisma.table.findUnique({ where: { qrToken: req.params.tableToken }, include: { restaurant: true } });
      if (!table) throw new HttpError(404, "Invalid table QR token");
      const session = await activeSession(table.id);
      if (table.status === "AVAILABLE") {
        await prisma.table.update({ where: { id: table.id }, data: { status: "OCCUPIED" } });
        io.to(`restaurant:${table.restaurantId}`).emit("table:statusChange", { tableId: table.id, status: "OCCUPIED" });
      }
      const [categories, menu] = await Promise.all([
        prisma.category.findMany({ where: { restaurantId: table.restaurantId, isActive: true }, orderBy: { sortOrder: "asc" } }),
        prisma.menuItem.findMany({ where: { restaurantId: table.restaurantId, isAvailable: true }, orderBy: { name: "asc" } })
      ]);
      res.json({ table, session, categories, menu });
    })
  );

  router.post(
    "/qr/:tableToken/order",
    asyncHandler(async (req, res) => {
      const schema = z.object({
        items: z.array(z.object({ menuItemId: z.string(), quantity: z.number().int().positive(), specialInstructions: z.string().optional() }))
      });
      const body = schema.parse(req.body);
      const table = await prisma.table.findUniqueOrThrow({ where: { qrToken: req.params.tableToken } });
      const session = await activeSession(table.id);
      const menuItems = await prisma.menuItem.findMany({ where: { id: { in: body.items.map((item) => item.menuItemId) } } });
      const totalAmount = body.items.reduce((sum, item) => {
        const menuItem = menuItems.find((candidate) => candidate.id === item.menuItemId);
        return sum + (menuItem?.price ?? 0) * item.quantity;
      }, 0);
      const order = await prisma.order.create({
        data: {
          restaurantId: table.restaurantId,
          tableId: table.id,
          sessionId: session.id,
          orderType: "QR_SELF",
          totalAmount,
          items: {
            create: body.items.map((item) => {
              const menuItem = menuItems.find((candidate) => candidate.id === item.menuItemId);
              return { menuItemId: item.menuItemId, quantity: item.quantity, unitPrice: menuItem?.price ?? 0, specialInstructions: item.specialInstructions };
            })
          }
        },
        include: { items: { include: { menuItem: true } }, table: true }
      });
      io.to(`kitchen:${table.restaurantId}`).emit("order:new", order);
      io.to(`restaurant:${table.restaurantId}`).emit("order:new", order);
      res.status(201).json(order);
    })
  );

  router.get(
    "/qr/:tableToken/track",
    asyncHandler(async (req, res) => {
      const table = await prisma.table.findUniqueOrThrow({ where: { qrToken: req.params.tableToken } });
      const session = await prisma.tableSession.findFirst({ where: { tableId: table.id, status: "ACTIVE" } });
      const orders = session
        ? await prisma.order.findMany({ where: { sessionId: session.id }, include: { items: { include: { menuItem: true } } }, orderBy: { createdAt: "desc" } })
        : [];
      res.json({ session, orders });
    })
  );

  router.post(
    "/qr/:tableToken/bill-request",
    asyncHandler(async (req, res) => {
      const table = await prisma.table.findUniqueOrThrow({ where: { qrToken: req.params.tableToken } });
      io.to(`cashier:${table.restaurantId}`).emit("bill:requested", { tableId: table.id, tableNumber: table.tableNumber });
      res.json({ ok: true });
    })
  );

  router.use(authenticate);

  router.post(
    "/upload",
    upload.single("image"),
    asyncHandler(async (req: any, res) => {
      if (!req.file) throw new HttpError(400, "No file uploaded");
      
      // If Cloudinary URL is configured, upload to Cloudinary
      if (process.env.CLOUDINARY_URL) {
        try {
          const { cloudinary } = await import("../config/cloudinary.js");
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "uxitech-menu-items"
          });
          // Remove local file
          fs.unlinkSync(req.file.path);
          return res.json({ url: result.secure_url });
        } catch (err) {
          console.error("Cloudinary upload failed, falling back to local storage:", err);
        }
      }

      // Fallback: Local storage url
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    })
  );

  router.get("/tables", asyncHandler(async (req, res) => res.json(await prisma.table.findMany({ where: restaurantWhere(req), ...createPagination(req) }))));
  router.post(
    "/tables",
    requireRoles("MANAGER", "WAITER"),
    asyncHandler(async (req, res) => {
      const body = z.object({ tableNumber: z.string(), capacity: z.number().int().positive(), area: z.string(), x: z.number().optional(), y: z.number().optional() }).parse(req.body);
      const qrToken = randomUUID();
      const table = await prisma.table.create({ data: { ...body, restaurantId: req.user!.restaurantId, qrToken } });
      const qrImageUrl = await generateQrDataUrl(`${env.frontendUrl}/order/${qrToken}`);
      res.status(201).json(await prisma.table.update({ where: { id: table.id }, data: { qrImageUrl } }));
    })
  );
  router.patch("/tables/:id", requireRoles("MANAGER", "WAITER"), asyncHandler(async (req, res) => {
    const table = await prisma.table.update({ where: { id: req.params.id }, data: req.body });
    io.to(`restaurant:${table.restaurantId}`).emit("table:statusChange", table);
    res.json(table);
  }));
  router.delete("/tables/:id", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.table.delete({ where: { id: req.params.id } }))));
  router.post("/tables/:id/generate-qr", requireRoles("MANAGER"), asyncHandler(async (req, res) => {
    const qrToken = randomUUID();
    const qrImageUrl = await generateQrDataUrl(`${env.frontendUrl}/order/${qrToken}`);
    res.json(await prisma.table.update({ where: { id: req.params.id }, data: { qrToken, qrImageUrl } }));
  }));
  router.get("/tables/:id/session", asyncHandler(async (req, res) => {
    res.json(await prisma.tableSession.findFirst({ where: { tableId: req.params.id, status: "ACTIVE" }, include: { orders: { include: { items: true } } } }));
  }));

  router.get("/menu", asyncHandler(async (req, res) => res.json(await prisma.menuItem.findMany({ where: restaurantWhere(req), ...createPagination(req) }))));
  router.get("/menu/categories", asyncHandler(async (req, res) => res.json(await prisma.category.findMany({ where: restaurantWhere(req), orderBy: { sortOrder: "asc" } }))));
  router.post("/menu/categories", requireRoles("MANAGER"), asyncHandler(async (req, res) => {
    const body = z.object({ name: z.string().min(1), sortOrder: z.number().int().optional() }).parse(req.body);
    const count = await prisma.category.count({ where: { restaurantId: req.user!.restaurantId } });
    const category = await prisma.category.create({
      data: {
        restaurantId: req.user!.restaurantId,
        name: body.name,
        sortOrder: body.sortOrder ?? (count + 1)
      }
    });
    res.status(201).json(category);
  }));
  router.patch("/menu/categories/:id", requireRoles("MANAGER"), asyncHandler(async (req, res) => {
    const body = z.object({ name: z.string().min(1).optional(), sortOrder: z.number().int().optional(), isActive: z.boolean().optional() }).parse(req.body);
    res.json(await prisma.category.update({ where: { id: req.params.id }, data: body }));
  }));
  router.delete("/menu/categories/:id", requireRoles("MANAGER"), asyncHandler(async (req, res) => {
    res.json(await prisma.category.delete({ where: { id: req.params.id } }));
  }));
  router.post("/menu/items", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.status(201).json(await prisma.menuItem.create({ data: { ...req.body, restaurantId: req.user!.restaurantId } }))));
  router.patch("/menu/items/:id", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.menuItem.update({ where: { id: req.params.id }, data: req.body }))));
  router.delete("/menu/items/:id", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.menuItem.delete({ where: { id: req.params.id } }))));
  router.patch("/menu/items/:id/toggle-availability", requireRoles("MANAGER", "KITCHEN"), asyncHandler(async (req, res) => {
    const item = await prisma.menuItem.findUniqueOrThrow({ where: { id: req.params.id } });
    res.json(await prisma.menuItem.update({ where: { id: item.id }, data: { isAvailable: !item.isAvailable } }));
  }));

  router.get("/orders", asyncHandler(async (req, res) => res.json(await prisma.order.findMany({ where: restaurantWhere(req), include: { table: true, items: { include: { menuItem: true } } }, orderBy: { createdAt: "desc" }, ...createPagination(req) }))));
  router.post("/orders", requireRoles("MANAGER", "WAITER"), asyncHandler(async (req, res) => {
    const body = z.object({ tableId: z.string(), items: z.array(z.object({ menuItemId: z.string(), quantity: z.number().int().positive(), specialInstructions: z.string().optional() })) }).parse(req.body);
    const session = await activeSession(body.tableId);
    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: body.items.map((item) => item.menuItemId) } } });
    const totalAmount = body.items.reduce((sum, item) => sum + (menuItems.find((menuItem) => menuItem.id === item.menuItemId)?.price ?? 0) * item.quantity, 0);
    const order = await prisma.order.create({ data: { restaurantId: req.user!.restaurantId, tableId: body.tableId, sessionId: session.id, orderType: "WAITER", totalAmount, items: { create: body.items.map((item) => ({ ...item, unitPrice: menuItems.find((menuItem) => menuItem.id === item.menuItemId)?.price ?? 0 })) } }, include: { items: true, table: true } });
    io.to(`kitchen:${req.user!.restaurantId}`).emit("order:new", order);
    res.status(201).json(order);
  }));
  router.patch("/orders/:id/status", requireRoles("MANAGER", "WAITER", "KITCHEN"), asyncHandler(async (req, res) => {
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status: req.body.status }, include: { table: true } });
    io.to(`restaurant:${order.restaurantId}`).emit("order:statusUpdate", order);
    io.to(`table:${order.tableId}`).emit("order:statusUpdate", order);
    res.json(order);
  }));
  router.get("/orders/table/:tableId", asyncHandler(async (req, res) => res.json(await prisma.order.findMany({ where: { tableId: req.params.tableId }, include: { items: true } }))));

  router.get("/reservations", asyncHandler(async (req, res) => res.json(await prisma.reservation.findMany({ where: restaurantWhere(req), include: { customer: true, table: true }, orderBy: { date: "asc" } }))));
  router.post("/reservations", asyncHandler(async (req, res) => {
    const reservation = await prisma.reservation.create({ data: { ...req.body, restaurantId: req.user!.restaurantId } });
    io.to(`restaurant:${req.user!.restaurantId}`).emit("reservation:new", reservation);
    res.status(201).json(reservation);
  }));
  router.patch("/reservations/:id", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.reservation.update({ where: { id: req.params.id }, data: req.body }))));
  router.delete("/reservations/:id", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.reservation.delete({ where: { id: req.params.id } }))));
  router.post("/reservations/:id/approve", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.reservation.update({ where: { id: req.params.id }, data: { status: "CONFIRMED" } }))));
  router.post("/reservations/:id/reject", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.reservation.update({ where: { id: req.params.id }, data: { status: "CANCELLED" } }))));

  router.get("/bills", requireRoles("CASHIER", "MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.bill.findMany({ where: restaurantWhere(req), include: { table: true }, orderBy: { createdAt: "desc" } }))));
  router.get("/bills/table/:tableId", requireRoles("CASHIER", "MANAGER"), asyncHandler(async (req, res) => {
    const session = await prisma.tableSession.findFirst({ where: { tableId: req.params.tableId, status: "ACTIVE" } });
    const orders = session ? await prisma.order.findMany({ where: { sessionId: session.id }, include: { items: { include: { menuItem: true } } } }) : [];
    res.json({ session, orders });
  }));
  router.post("/bills/generate", requireRoles("CASHIER", "MANAGER"), asyncHandler(async (req, res) => {
    const body = z.object({ tableId: z.string(), gstPercent: z.number().default(5), serviceCharge: z.number().default(0), discount: z.number().default(0) }).parse(req.body);
    const session = await prisma.tableSession.findFirstOrThrow({ where: { tableId: body.tableId, status: "ACTIVE" } });
    const orders = await prisma.order.findMany({ where: { sessionId: session.id } });
    const subtotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const gstAmount = subtotal * (body.gstPercent / 100);
    const totalAmount = subtotal + gstAmount + body.serviceCharge - body.discount;
    const bill = await prisma.bill.create({ data: { restaurantId: req.user!.restaurantId, tableId: body.tableId, sessionId: session.id, orderIds: orders.map((order) => order.id), subtotal, gstAmount, gstPercent: body.gstPercent, serviceCharge: body.serviceCharge, discount: body.discount, totalAmount }, include: { table: true } });
    res.status(201).json(bill);
  }));
  router.patch("/bills/:id/payment", requireRoles("CASHIER"), asyncHandler(async (req, res) => {
    const bill = await prisma.bill.update({ where: { id: req.params.id }, data: { paymentMethod: req.body.paymentMethod, paymentStatus: "PAID" }, include: { table: true } });
    await prisma.tableSession.update({ where: { id: bill.sessionId }, data: { status: "CLOSED", endTime: new Date(), totalBilled: bill.totalAmount } });
    await prisma.table.update({ where: { id: bill.tableId }, data: { status: "AVAILABLE" } });
    io.to(`restaurant:${bill.restaurantId}`).emit("bill:paid", bill);
    io.to(`restaurant:${bill.restaurantId}`).emit("table:statusChange", { tableId: bill.tableId, status: "AVAILABLE" });
    res.json(bill);
  }));
  router.get("/bills/:id/pdf", requireRoles("CASHIER", "MANAGER"), asyncHandler(async (req, res) => {
    const bill = await prisma.bill.findUniqueOrThrow({ where: { id: req.params.id } });
    const pdf = await billPdfBuffer(bill);
    res.setHeader("content-type", "application/pdf");
    res.send(pdf);
  }));
  router.post("/bills/:id/refund", requireRoles("CASHIER", "MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.bill.update({ where: { id: req.params.id }, data: { paymentStatus: "REFUNDED" } }))));

  router.get("/inventory", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.inventoryItem.findMany({ where: restaurantWhere(req) }))));
  router.post("/inventory", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.status(201).json(await prisma.inventoryItem.create({ data: { ...req.body, restaurantId: req.user!.restaurantId } }))));
  router.patch("/inventory/:id", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.inventoryItem.update({ where: { id: req.params.id }, data: req.body }))));
  router.post("/inventory/:id/adjust", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.inventoryItem.update({ where: { id: req.params.id }, data: { currentStock: { increment: Number(req.body.delta ?? 0) } } }))));
  router.get("/inventory/low-stock", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json((await prisma.inventoryItem.findMany({ where: restaurantWhere(req) })).filter((item) => item.currentStock <= item.minStock))));
  router.get("/inventory/suppliers", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.supplier.findMany({ where: restaurantWhere(req) }))));
  router.post("/inventory/purchase-orders", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.status(201).json(await prisma.purchaseOrder.create({ data: { ...req.body, restaurantId: req.user!.restaurantId } }))));

  router.get("/staff", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.user.findMany({ where: restaurantWhere(req), select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true } }))));
  router.post("/staff", requireRoles("MANAGER"), asyncHandler(async (req, res) => {
    const password = await import("bcryptjs").then((bcrypt) => bcrypt.hash(req.body.password ?? "Admin@123", 12));
    res.status(201).json(await prisma.user.create({ data: { ...req.body, password, restaurantId: req.user!.restaurantId } }));
  }));
  router.patch("/staff/:id", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.user.update({ where: { id: req.params.id }, data: req.body }))));
  router.post("/staff/:id/attendance", asyncHandler(async (req, res) => res.status(201).json(await prisma.staffAttendance.create({ data: { userId: req.params.id, date: new Date(), checkIn: new Date(), status: "PRESENT" } }))));
  router.get("/staff/:id/attendance", requireRoles("MANAGER"), asyncHandler(async (req, res) => res.json(await prisma.staffAttendance.findMany({ where: { userId: req.params.id } }))));
  router.get("/staff/attendance/today", requireRoles("MANAGER"), asyncHandler(async (_req, res) => res.json(await prisma.staffAttendance.findMany({ where: { date: { gte: new Date(new Date().toDateString()) } }, include: { user: true } }))));

  router.get("/customers", asyncHandler(async (req, res) => res.json(await prisma.customer.findMany({ where: restaurantWhere(req) }))));
  router.get("/customers/:id", asyncHandler(async (req, res) => res.json(await prisma.customer.findUniqueOrThrow({ where: { id: req.params.id } }))));
  router.patch("/customers/:id", asyncHandler(async (req, res) => res.json(await prisma.customer.update({ where: { id: req.params.id }, data: req.body }))));
  router.get("/customers/:id/history", asyncHandler(async (req, res) => res.json(await prisma.order.findMany({ where: { customerId: req.params.id }, include: { table: true, items: true } }))));

  router.get("/reports/sales", asyncHandler(async (req, res) => {
    const bills = await prisma.bill.findMany({ where: restaurantWhere(req) });
    res.json({ revenue: bills.reduce((sum, bill) => sum + bill.totalAmount, 0), count: bills.length, averageBill: bills.length ? movingAverage(bills.map((bill) => bill.totalAmount)) : 0 });
  }));
  router.get("/reports/food", asyncHandler(async (req, res) => {
    const items = await prisma.orderItem.findMany({ include: { menuItem: true } });
    res.json(items.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.menuItem.name]: (acc[item.menuItem.name] ?? 0) + item.quantity }), {}));
  }));
  router.get("/reports/inventory", asyncHandler(async (req, res) => res.json(await prisma.inventoryItem.groupBy({ by: ["category"], where: restaurantWhere(req), _sum: { currentStock: true } }))));
  router.get("/reports/reservations", asyncHandler(async (req, res) => res.json(await prisma.reservation.groupBy({ by: ["status"], where: restaurantWhere(req), _count: true }))));
  router.get("/reports/staff", requireRoles("MANAGER"), asyncHandler(async (_req, res) => res.json(await prisma.staffAttendance.groupBy({ by: ["status"], _count: true }))));
  router.get("/reports/export/:type", asyncHandler(async (req, res) => res.type("text/csv").send(`type,total\n${req.params.type},0\n`)));

  router.get("/ai/insights", asyncHandler(async (req, res) => {
    const [items, bills, inventory, customers] = await Promise.all([
      prisma.orderItem.findMany({ include: { menuItem: true } }),
      prisma.bill.findMany({ where: restaurantWhere(req), orderBy: { createdAt: "desc" }, take: 56 }),
      prisma.inventoryItem.findMany({ where: restaurantWhere(req) }),
      prisma.customer.findMany({ where: restaurantWhere(req) })
    ]);
    const bestSellers = Object.entries(items.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.menuItem.name]: (acc[item.menuItem.name] ?? 0) + item.quantity }), {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
    res.json({
      bestSellers,
      revenueForecast: movingAverage(bills.map((bill) => bill.totalAmount)),
      stockout: inventory.map((item) => ({ name: item.name, daysLeft: Math.max(1, Math.floor(item.currentStock / Math.max(item.minStock / 7, 1))) })),
      customerSegments: customers.map((customer) => ({ id: customer.id, name: customer.name, tag: customerTag(customer.totalVisits, customer.lastVisit) })),
      recommendations: ["Stock fast-moving biryani ingredients before weekend.", "Review low-utilization sections and reservation slots.", "Prep high-margin starters before peak dinner hours."]
    });
  }));
  router.get("/ai/predictions/bestsellers", asyncHandler(async (_req, res) => res.redirect(307, "/api/v1/ai/insights")));
  router.get("/ai/predictions/inventory", asyncHandler(async (_req, res) => res.redirect(307, "/api/v1/ai/insights")));
  router.get("/ai/predictions/revenue", asyncHandler(async (_req, res) => res.redirect(307, "/api/v1/ai/insights")));
  router.get("/ai/peak-hours", asyncHandler(async (_req, res) => res.json(Array.from({ length: 24 }, (_, hour) => ({ hour, orders: Math.round(Math.random() * 20) })))));

  router.get("/settings", asyncHandler(async (req, res) => res.json(await prisma.restaurant.findUnique({ where: { id: req.user!.restaurantId } }))));
  router.patch("/settings", requireRoles("OWNER"), asyncHandler(async (req, res) => res.json(await prisma.restaurant.update({ where: { id: req.user!.restaurantId }, data: req.body }))));

  return router;
}
