import { z } from "zod/v4";
import { createTRPCRouter, baseProcedure } from "../init";
import { calcularIndicadores } from "@/server/capag/indicators";

export const indicadorRouter = createTRPCRouter({
  listByLaudo: baseProcedure
    .input(z.object({ laudoId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.indicadorFinanceiro.findMany({
        where: { laudoId: input.laudoId },
        orderBy: { exercicio: "asc" },
      });
    }),

  calcular: baseProcedure
    .input(z.object({ laudoId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const balancos = await ctx.db.balancoPatrimonial.findMany({
        where: { laudoId: input.laudoId },
        orderBy: { exercicio: "asc" },
      });
      const dres = await ctx.db.dRE.findMany({
        where: { laudoId: input.laudoId },
        orderBy: { exercicio: "asc" },
      });

      const resultados = [];

      for (const balanco of balancos) {
        const dre = dres.find((d) => d.exercicio === balanco.exercicio);
        if (!dre) continue;

        // Buscar DRE do exercício anterior para variação de receita
        const dreAnterior = dres.find(
          (d) => d.exercicio === balanco.exercicio - 1
        );

        const indicadores = calcularIndicadores(balanco, dre, dreAnterior);

        const result = await ctx.db.indicadorFinanceiro.upsert({
          where: {
            laudoId_exercicio: {
              laudoId: input.laudoId,
              exercicio: balanco.exercicio,
            },
          },
          create: {
            laudoId: input.laudoId,
            exercicio: balanco.exercicio,
            ...indicadores,
          },
          update: indicadores,
        });

        resultados.push(result);
      }

      return resultados;
    }),
});
