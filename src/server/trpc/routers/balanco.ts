import { z } from "zod/v4";
import { createTRPCRouter, baseProcedure } from "../init";
import { balancoUpsertSchema } from "@/lib/validators";

export const balancoRouter = createTRPCRouter({
  listByLaudo: baseProcedure
    .input(z.object({ laudoId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.balancoPatrimonial.findMany({
        where: { laudoId: input.laudoId },
        orderBy: { exercicio: "asc" },
      });
    }),

  upsert: baseProcedure
    .input(balancoUpsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { laudoId, exercicio, ...data } = input;
      return ctx.db.balancoPatrimonial.upsert({
        where: { laudoId_exercicio: { laudoId, exercicio } },
        create: { laudoId, exercicio, ...data },
        update: data,
      });
    }),

  delete: baseProcedure
    .input(
      z.object({
        laudoId: z.number().int().positive(),
        exercicio: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.balancoPatrimonial.delete({
        where: {
          laudoId_exercicio: {
            laudoId: input.laudoId,
            exercicio: input.exercicio,
          },
        },
      });
    }),
});
