import { z } from "zod/v4";
import { createTRPCRouter, baseProcedure } from "../init";
import { documentoCreateSchema } from "@/lib/validators";

export const documentoRouter = createTRPCRouter({
  listByLaudo: baseProcedure
    .input(z.object({ laudoId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.documento.findMany({
        where: { laudoId: input.laudoId },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: baseProcedure
    .input(documentoCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.documento.create({ data: input });
    }),

  delete: baseProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.documento.delete({ where: { id: input.id } });
    }),
});
