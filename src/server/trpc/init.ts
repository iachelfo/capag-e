import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { db } from "../db";
import type { PrismaClient } from "@/generated/prisma/client";

export const createTRPCContext = cache(async () => {
  return { db };
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Middleware that ensures the database is available.
 * Throws SERVICE_UNAVAILABLE if SQLite is not loaded (demo mode).
 */
const requireDb = t.middleware(({ ctx, next }) => {
  if (!ctx.db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available in demo mode",
    });
  }
  return next({
    ctx: {
      ...ctx,
      db: ctx.db as PrismaClient,
    },
  });
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
// baseProcedure ensures db is available before any query/mutation
export const baseProcedure = t.procedure.use(requireDb);
