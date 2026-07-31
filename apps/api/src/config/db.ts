import { PrismaClient } from "@prisma/client";

const defaultDbUrl = "mongodb+srv://badugupraneeth0_db_user:oS89myR4RBbTpTHL@cluster0.qos5v9x.mongodb.net/uxitech_restaurant?retryWrites=true&w=majority&appName=Cluster0";

const databaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("mongodb")
  ? process.env.DATABASE_URL
  : defaultDbUrl;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});
