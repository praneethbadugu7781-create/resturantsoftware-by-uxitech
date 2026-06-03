import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { asyncHandler, HttpError } from "../../middleware/errorHandler.js";
import { authenticate, signAccessToken, signRefreshToken } from "../../middleware/auth.js";
import { generateQrDataUrl } from "../../utils/qrGenerator.js";

const router = Router();
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  restaurantName: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  gstNumber: z.string().optional(),
  restaurantType: z.string().optional()
});

function tokens(user: { id: string; restaurantId: string; role: string; email: string }) {
  const payload = { sub: user.id, restaurantId: user.restaurantId, role: user.role, email: user.email };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) };
}

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new HttpError(401, "Invalid email or password");
    }
    const issued = tokens(user);
    res.cookie("refreshToken", issued.refreshToken, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ ...issued, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken ?? req.body.refreshToken;
    if (!token) throw new HttpError(401, "Refresh token required");
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as { sub: string };
    const user = await prisma.user.findUniqueOrThrow({ where: { id: decoded.sub } });
    res.json(tokens(user));
  })
);

router.post("/logout", (_req, res) => {
  res.clearCookie("refreshToken");
  res.json({ ok: true });
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      throw new HttpError(400, "Email already registered");
    }

    // 1. Create Restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        name: body.restaurantName,
        address: body.address,
        phone: body.phone,
        email: body.email,
        gstNumber: body.gstNumber || null,
        restaurantType: body.restaurantType || "Cafe",
        gstPercent: 5
      }
    });

    // 2. Create Owner User
    const hashedPassword = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        restaurantId: restaurant.id,
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: "OWNER",
        phone: body.phone
      }
    });

    // 3. Seed Default Tables (For scanning & testing workspace immediately)
    const tablesData = [
      { num: "1", cap: 2, area: "Main Zone" },
      { num: "2", cap: 4, area: "Main Zone" },
      { num: "3", cap: 4, area: "Main Zone" },
      { num: "4", cap: 6, area: "AC Cabin" }
    ];

    for (const t of tablesData) {
      const qrToken = randomUUID();
      const qrImageUrl = await generateQrDataUrl(`${env.frontendUrl}/order/${qrToken}`);
      await prisma.table.create({
        data: {
          restaurantId: restaurant.id,
          tableNumber: t.num,
          capacity: t.cap,
          area: t.area,
          status: "AVAILABLE",
          qrToken,
          qrImageUrl
        }
      });
    }

    // Note: Seeding categories and menu items has been removed.
    // Owners will add their own categories and menu items via the custom dashboard page.

    res.status(201).json({ ok: true, message: "Restaurant registered and tables seeded successfully" });
  })
);

router.post("/forgot-password", (_req, res) => res.json({ ok: true, message: "Password reset email queued when SMTP is configured." }));
router.post("/reset-password", (_req, res) => res.json({ ok: true }));
router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));

export default router;
