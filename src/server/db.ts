import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null;
};

function createPrismaClient(): PrismaClient | null {
  const url = process.env.DATABASE_URL;

  if (!url || url.startsWith("file:")) {
    console.warn(
      "⚠️ DATABASE_URL not set or points to SQLite — running in demo mode."
    );
    return null;
  }

  try {
    const adapter = new PrismaNeonHttp(url, {});
    return new PrismaClient({ adapter });
  } catch (e) {
    console.warn(
      "⚠️ Neon adapter not available — running in demo mode.",
      (e as Error).message?.slice(0, 80)
    );
    return null;
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
