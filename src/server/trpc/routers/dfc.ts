import { z } from "zod/v4";
import { createTRPCRouter, baseProcedure } from "../init";
import { dfcUpsertSchema } from "@/lib/validators";

export const dfcRouter = createTRPCRouter({
  listByLaudo: baseProcedure
    .input(z.object({ laudoId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.dFC.findMany({
        where: { laudoId: input.laudoId },
        orderBy: { exercicio: "asc" },
      });
    }),

  upsert: baseProcedure
    .input(dfcUpsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { laudoId, exercicio, ...data } = input;
      return ctx.db.dFC.upsert({
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
      return ctx.db.dFC.delete({
        where: {
          laudoId_exercicio: {
            laudoId: input.laudoId,
            exercicio: input.exercicio,
          },
        },
      });
    }),
});
