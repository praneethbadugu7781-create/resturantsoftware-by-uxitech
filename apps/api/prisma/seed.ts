import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import QRCode from "qrcode";

const prisma = new PrismaClient();
const password = await bcrypt.hash("Admin@123", 12);

const categories = ["Starters", "Soups", "Biryani", "Main Course", "Breads", "Rice", "Desserts", "Beverages"];
const menuNames = [
  "Paneer Tikka", "Chicken Tikka", "Veg Manchurian", "Masala Papad", "Tomato Soup",
  "Sweet Corn Soup", "Chicken Biryani", "Veg Biryani", "Mutton Biryani", "Butter Chicken",
  "Paneer Butter Masala", "Dal Makhani", "Chole Masala", "Fish Curry", "Tandoori Roti",
  "Butter Naan", "Garlic Naan", "Jeera Rice", "Steamed Rice", "Gulab Jamun",
  "Rasmalai", "Brownie Sizzler", "Masala Chai", "Fresh Lime Soda", "Lassi",
  "Hara Bhara Kebab", "Chicken 65", "Malai Kofta", "Kadhai Paneer", "Egg Curry",
  "Veg Pulao", "Tandoori Prawns", "Schezwan Noodles", "Spring Rolls", "Cold Coffee",
  "Mango Kulfi", "Chicken Lollipop", "Paneer Lababdar", "Hyderabadi Dum Aloo", "Jal Jeera"
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.staffAttendance.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.restaurant.deleteMany();

  const restaurant = await prisma.restaurant.create({
    data: {
      name: "UXITECH Restaurant Software",
      address: "MG Road, Bengaluru, Karnataka",
      phone: "+91 98765 43210",
      email: "hello@uxitech.com",
      gstNumber: "29ABCDE1234F1Z5",
      gstPercent: 5
    }
  });

  await prisma.user.createMany({
    data: [
      ["Owner", "owner@uxitech.com", "OWNER"],
      ["Manager", "manager@uxitech.com", "MANAGER"],
      ["Cashier", "cashier@uxitech.com", "CASHIER"],
      ["Waiter", "waiter@uxitech.com", "WAITER"],
      ["Kitchen", "kitchen@uxitech.com", "KITCHEN"]
    ].map(([name, email, role]) => ({
      restaurantId: restaurant.id,
      name: `${name}`,
      email: `${email}`,
      role: `${role}`,
      password,
      phone: "+91 90000 00000"
    }))
  });

  const categoryRows = await Promise.all(
    categories.map((name, index) =>
      prisma.category.create({ data: { restaurantId: restaurant.id, name, sortOrder: index + 1 } })
    )
  );

  await Promise.all(
    menuNames.map((name, index) => {
      const category = categoryRows[index % categoryRows.length];
      const price = 90 + (index % 10) * 35;
      return prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: category.id,
          category: category.name,
          name,
          description: `${name} prepared fresh with house spices and balanced Indian flavours.`,
          price,
          image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&sig=${index}`,
          isVeg: !/Chicken|Mutton|Fish|Prawns|Egg/i.test(name),
          preparationTime: 10 + (index % 4) * 5
        }
      });
    })
  );

  const areas = ["Family Zone", "AC Dining", "Outdoor"];
  const tables = await Promise.all(
    Array.from({ length: 15 }, async (_, index) => {
      const qrToken = randomUUID();
      const tableNumber = `${index + 1}`;
      return prisma.table.create({
        data: {
          restaurantId: restaurant.id,
          tableNumber,
          capacity: [2, 4, 6, 8][index % 4],
          area: areas[index % areas.length],
          status: index % 5 === 0 ? "RESERVED" : "AVAILABLE",
          x: 70 + (index % 5) * 120,
          y: 80 + Math.floor(index / 5) * 110,
          qrToken,
          qrImageUrl: await QRCode.toDataURL(`http://localhost:3000/order/${qrToken}`)
        }
      });
    })
  );

  console.log("Seed complete");
  console.log("owner@uxitech.com / Admin@123");
}

main().finally(async () => prisma.$disconnect());
