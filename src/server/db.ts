import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null;
};

function createPrismaClient(): PrismaClient | null {
  try {
    // Dynamic require to handle environments where the native
    // better-sqlite3 binary might not be available (e.g. wrong platform)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL!,
    });
    return new PrismaClient({ adapter });
  } catch (e) {
    console.warn(
      "⚠️ SQLite adapter not available — running in demo mode.",
      (e as Error).message?.slice(0, 80)
    );
    return null;
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
