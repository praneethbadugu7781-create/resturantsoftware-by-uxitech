import { Router, Request, Response } from "express";
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
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req: any, file: any, cb: any) => {
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

  router.get("/health", (_req: Request, res: Response) => res.json({ ok: true, service: "uxitech-api" }));

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
        prisma.menuItem.findMany({ where: { restaurantId: table.restaurantId, isAvailable: true }, include: { options: { include: { options: true } } }, orderBy: { name: "asc" } })
      ]);
      res.json({ table, session, categories, menu });
    })
  );

  router.post(
    "/qr/:tableToken/order",
    asyncHandler(async (req, res) => {
      const schema = z.object({
        items: z.array(z.object({
          menuItemId: z.string(),
          quantity: z.number().int().positive(),
          specialInstructions: z.string().optional(),
          selectedOptions: z.array(z.object({
            groupName: z.string(),
            optionName: z.string(),
            price: z.number()
          })).optional()
        }))
      });
      const body = schema.parse(req.body);
      const table = await prisma.table.findUniqueOrThrow({ where: { qrToken: req.params.tableToken } });
      const session = await activeSession(table.id);
      const menuItems = await prisma.menuItem.findMany({ where: { id: { in: body.items.map((item) => item.menuItemId) } } });
      
      let totalAmount = 0;
      const itemsData = body.items.map((item) => {
        const menuItem = menuItems.find((candidate) => candidate.id === item.menuItemId);
        const basePrice = menuItem?.price ?? 0;
        const optionsPrice = (item.selectedOptions ?? []).reduce((sum, opt) => sum + opt.price, 0);
        const unitPrice = basePrice + optionsPrice;
        totalAmount += unitPrice * item.quantity;
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice,
          specialInstructions: item.specialInstructions,
          selectedOptions: item.selectedOptions || undefined
        };
      });

      const order = await prisma.order.create({
        data: {
          restaurantId: table.restaurantId,
          tableId: table.id,
          sessionId: session.id,
          orderType: "QR_SELF",
          totalAmount,
          items: {
            create: itemsData
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
    const body = z.object({
      tableId: z.string(),
      items: z.array(z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive(),
        specialInstructions: z.string().optional(),
        selectedOptions: z.array(z.object({
          groupName: z.string(),
          optionName: z.string(),
          price: z.number()
        })).optional()
      }))
    }).parse(req.body);
    const session = await activeSession(body.tableId);
    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: body.items.map((item) => item.menuItemId) } } });
    
    let totalAmount = 0;
    const itemsData = body.items.map((item) => {
      const menuItem = menuItems.find((candidate) => candidate.id === item.menuItemId);
      const basePrice = menuItem?.price ?? 0;
      const optionsPrice = (item.selectedOptions ?? []).reduce((sum, opt) => sum + opt.price, 0);
      const unitPrice = basePrice + optionsPrice;
      totalAmount += unitPrice * item.quantity;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice,
        specialInstructions: item.specialInstructions,
        selectedOptions: item.selectedOptions || undefined
      };
    });

    const order = await prisma.order.create({
      data: {
        restaurantId: req.user!.restaurantId,
        tableId: body.tableId,
        sessionId: session.id,
        orderType: "WAITER",
        totalAmount,
        items: {
          create: itemsData
        }
      },
      include: { items: { include: { menuItem: true } }, table: true }
    });
    io.to(`kitchen:${req.user!.restaurantId}`).emit("order:new", order);
    res.status(201).json(order);
  }));

  router.patch("/orders/:id/status", requireRoles("MANAGER", "WAITER", "KITCHEN"), asyncHandler(async (req, res) => {
    const currentOrder = await prisma.order.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { items: true }
    });
    const newStatus = req.body.status;
    const shouldDeductStock = (newStatus === "PREPARING" || newStatus === "COMPLETED") && 
                              (currentOrder.status !== "PREPARING" && currentOrder.status !== "COMPLETED");

    if (shouldDeductStock) {
      for (const item of currentOrder.items) {
        const recipeIngredients = await prisma.recipeIngredient.findMany({
          where: { menuItemId: item.menuItemId }
        });
        for (const ingredient of recipeIngredients) {
          await prisma.inventoryItem.updateMany({
            where: { id: ingredient.inventoryItemId },
            data: {
              currentStock: {
                decrement: ingredient.quantity * item.quantity
              }
            }
          });
        }
      }
    }

    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status: newStatus }, include: { table: true } });
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
  router.post("/bills/:id/split", requireRoles("CASHIER", "MANAGER"), asyncHandler(async (req, res) => {
    const body = z.object({
      splitType: z.enum(["EQUAL", "ITEMIZED"]),
      parts: z.number().int().min(2).optional(),
      itemSplits: z.array(z.object({
        guestName: z.string(),
        itemIds: z.array(z.string())
      })).optional()
    }).parse(req.body);

    const bill = await prisma.bill.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { table: true }
    });

    if (body.splitType === "EQUAL") {
      const parts = body.parts || 2;
      const amountPerPart = bill.totalAmount / parts;
      const subtotalPerPart = bill.subtotal / parts;
      const gstPerPart = bill.gstAmount / parts;
      const servicePerPart = bill.serviceCharge / parts;
      const discountPerPart = bill.discount / parts;

      const splits = Array.from({ length: parts }, (_, i) => ({
        id: `${bill.id}-split-${i + 1}`,
        partNumber: i + 1,
        subtotal: subtotalPerPart,
        gstAmount: gstPerPart,
        serviceCharge: servicePerPart,
        discount: discountPerPart,
        totalAmount: amountPerPart,
        paymentStatus: "PENDING",
        paymentMethod: "CASH"
      }));

      const updatedBill = await prisma.bill.update({
        where: { id: bill.id },
        data: {
          splitBills: splits
        },
        include: { table: true }
      });
      return res.json(updatedBill);
    }

    if (body.splitType === "ITEMIZED" && body.itemSplits) {
      const session = await prisma.tableSession.findUniqueOrThrow({
        where: { id: bill.sessionId },
        include: { orders: { include: { items: { include: { menuItem: true } } } } }
      });

      const allItems = session.orders.flatMap(o => o.items);

      const splits = body.itemSplits.map((split, index) => {
        const assignedItems = allItems.filter(item => split.itemIds.includes(item.id));
        const subtotal = assignedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const ratio = bill.subtotal > 0 ? subtotal / bill.subtotal : 0;
        const gstAmount = bill.gstAmount * ratio;
        const serviceCharge = bill.serviceCharge * ratio;
        const discount = bill.discount * ratio;
        const totalAmount = subtotal + gstAmount + serviceCharge - discount;

        return {
          id: `${bill.id}-split-${index + 1}`,
          guestName: split.guestName,
          items: assignedItems.map(item => ({
            id: item.id,
            name: item.menuItem.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })),
          subtotal,
          gstAmount,
          serviceCharge,
          discount,
          totalAmount,
          paymentStatus: "PENDING",
          paymentMethod: "CASH"
        };
      });

      const updatedBill = await prisma.bill.update({
        where: { id: bill.id },
        data: {
          splitBills: splits
        },
        include: { table: true }
      });
      return res.json(updatedBill);
    }

    throw new HttpError(400, "Invalid split parameters");
  }));

  router.patch("/bills/:id/payment", requireRoles("CASHIER"), asyncHandler(async (req, res) => {
    const { paymentMethod, splitPartId } = req.body;
    const bill = await prisma.bill.findUniqueOrThrow({ where: { id: req.params.id }, include: { table: true } });
    
    if (splitPartId && bill.splitBills) {
      const splits = bill.splitBills as any[];
      const updatedSplits = splits.map(part => {
        if (part.id === splitPartId) {
          return { ...part, paymentStatus: "PAID", paymentMethod };
        }
        return part;
      });

      const allPaid = updatedSplits.every(part => part.paymentStatus === "PAID");

      const updatedBill = await prisma.bill.update({
        where: { id: bill.id },
        data: {
          splitBills: updatedSplits,
          paymentStatus: allPaid ? "PAID" : "PENDING",
          paymentMethod: allPaid ? "SPLIT" : bill.paymentMethod
        },
        include: { table: true }
      });

      if (allPaid) {
        await prisma.tableSession.update({ where: { id: bill.sessionId }, data: { status: "CLOSED", endTime: new Date(), totalBilled: bill.totalAmount } });
        await prisma.table.update({ where: { id: bill.tableId }, data: { status: "AVAILABLE" } });
        io.to(`restaurant:${bill.restaurantId}`).emit("bill:paid", updatedBill);
        io.to(`restaurant:${bill.restaurantId}`).emit("table:statusChange", { tableId: bill.tableId, status: "AVAILABLE" });
      }

      return res.json(updatedBill);
    } else {
      const updatedBill = await prisma.bill.update({ where: { id: req.params.id }, data: { paymentMethod: req.body.paymentMethod, paymentStatus: "PAID" }, include: { table: true } });
      await prisma.tableSession.update({ where: { id: updatedBill.sessionId }, data: { status: "CLOSED", endTime: new Date(), totalBilled: updatedBill.totalAmount } });
      await prisma.table.update({ where: { id: updatedBill.tableId }, data: { status: "AVAILABLE" } });
      io.to(`restaurant:${updatedBill.restaurantId}`).emit("bill:paid", updatedBill);
      io.to(`restaurant:${updatedBill.restaurantId}`).emit("table:statusChange", { tableId: updatedBill.tableId, status: "AVAILABLE" });
      return res.json(updatedBill);
    }
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

  // Modifiers API
  router.get("/menu/items/:id/options", asyncHandler(async (req, res) => {
    const groups = await prisma.menuItemOptionGroup.findMany({
      where: { menuItemId: req.params.id },
      include: { options: true }
    });
    res.json(groups);
  }));

  router.post("/menu/items/:id/options", requireRoles("MANAGER"), asyncHandler(async (req, res) => {
    const body = z.object({
      groups: z.array(z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        minSelect: z.number().int().default(0),
        maxSelect: z.number().int().default(1),
        isRequired: z.boolean().default(false),
        options: z.array(z.object({
          id: z.string().optional(),
          name: z.string().min(1),
          price: z.number().default(0),
          isAvailable: z.boolean().default(true)
        }))
      }))
    }).parse(req.body);

    const menuItemId = req.params.id;

    // Delete existing options & groups to overwrite
    await prisma.menuItemOptionGroup.deleteMany({ where: { menuItemId } });

    // Re-create them
    for (const group of body.groups) {
      await prisma.menuItemOptionGroup.create({
        data: {
          menuItemId,
          name: group.name,
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          isRequired: group.isRequired,
          options: {
            create: group.options.map(opt => ({
              name: opt.name,
              price: opt.price,
              isAvailable: opt.isAvailable
            }))
          }
        }
      });
    }

    const updatedGroups = await prisma.menuItemOptionGroup.findMany({
      where: { menuItemId },
      include: { options: true }
    });
    res.json(updatedGroups);
  }));

  // Recipes API
  router.get("/menu/items/:id/recipe", asyncHandler(async (req, res) => {
    const recipe = await prisma.recipeIngredient.findMany({
      where: { menuItemId: req.params.id },
      include: { inventoryItem: true }
    });
    res.json(recipe);
  }));

  router.post("/menu/items/:id/recipe", requireRoles("MANAGER"), asyncHandler(async (req, res) => {
    const body = z.object({
      ingredients: z.array(z.object({
        inventoryItemId: z.string(),
        quantity: z.number().positive()
      }))
    }).parse(req.body);

    const menuItemId = req.params.id;

    // Delete existing recipe mapping to overwrite
    await prisma.recipeIngredient.deleteMany({ where: { menuItemId } });

    // Create new ones
    if (body.ingredients.length > 0) {
      await prisma.recipeIngredient.createMany({
        data: body.ingredients.map(ing => ({
          menuItemId,
          inventoryItemId: ing.inventoryItemId,
          quantity: ing.quantity
        }))
      });
    }

    const updatedRecipe = await prisma.recipeIngredient.findMany({
      where: { menuItemId },
      include: { inventoryItem: true }
    });
    res.json(updatedRecipe);
  }));

  router.get("/settings", asyncHandler(async (req, res) => res.json(await prisma.restaurant.findUnique({ where: { id: req.user!.restaurantId } }))));
  router.patch("/settings", requireRoles("OWNER"), asyncHandler(async (req, res) => res.json(await prisma.restaurant.update({ where: { id: req.user!.restaurantId }, data: req.body }))));

  return router;
}
