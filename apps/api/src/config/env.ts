import dotenv from "dotenv";

dotenv.config();

const defaultMongoUrl = "mongodb+srv://badugupraneeth0_db_user:oS89myR4RBbTpTHL@cluster0.qos5v9x.mongodb.net/uxitech_restaurant?retryWrites=true&w=majority&appName=Cluster0";

export const env = {
  databaseUrl: (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("mongodb"))
    ? process.env.DATABASE_URL
    : defaultMongoUrl,
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET || "dev-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  port: Number(process.env.PORT ?? 4000)
};
