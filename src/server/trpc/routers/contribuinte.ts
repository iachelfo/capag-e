import { z } from "zod/v4";
import { createTRPCRouter, baseProcedure } from "../init";
import {
  contribuinteCreateSchema,
  contribuinteUpdateSchema,
} from "@/lib/validators";

export const contribuinteRouter = createTRPCRouter({
  list: baseProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          take: z.number().int().min(1).max(100).default(20),
          skip: z.number().int().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { search, take = 20, skip = 0 } = input ?? {};
      const where = search
        ? {
            OR: [
              { razaoSocial: { contains: search } },
              { cpfCnpj: { contains: search } },
              { nomeFantasia: { contains: search } },
            ],
          }
        : {};

      const [items, total] = await Promise.all([
        ctx.db.contribuinte.findMany({ where, take, skip, orderBy: { updatedAt: "desc" } }),
        ctx.db.contribuinte.count({ where }),
      ]);
      return { items, total };
    }),

  getById: baseProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.contribuinte.findUniqueOrThrow({
        where: { id: input.id },
        include: { laudos: { orderBy: { createdAt: "desc" } } },
      });
    }),

  create: baseProcedure
    .input(contribuinteCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contribuinte.create({ data: input });
    }),

  update: baseProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        data: contribuinteUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contribuinte.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: baseProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contribuinte.delete({ where: { id: input.id } });
    }),
});
