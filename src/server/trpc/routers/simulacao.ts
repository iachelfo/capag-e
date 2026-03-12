import { z } from "zod/v4";
import { createTRPCRouter, baseProcedure } from "../init";
import { simulacaoCreateSchema } from "@/lib/validators";
import { CAPAG_LIMITES } from "@/lib/constants";

export const simulacaoRouter = createTRPCRouter({
  simular: baseProcedure
    .input(simulacaoCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const limites = CAPAG_LIMITES[input.classificacaoCapag];
      const descontoEfetivo = Math.min(
        limites.descontoMaximo,
        limites.descontoMaximo
      );
      const prazoEfetivo = Math.min(input.prazoMeses, limites.prazoMaximoMeses);

      const valorComDesconto =
        input.valorDivida * (1 - descontoEfetivo);
      const valorParcela = prazoEfetivo > 0 ? valorComDesconto / prazoEfetivo : valorComDesconto;
      const valorEntrada = valorComDesconto * 0.05; // 5% de entrada

      const simulacao = await ctx.db.simulacaoTransacao.create({
        data: {
          ...input,
          prazoMeses: prazoEfetivo,
          descontoPercentual: descontoEfetivo * 100,
          valorComDesconto,
          valorParcela,
          valorEntrada,
        },
      });

      return {
        ...simulacao,
        economia: input.valorDivida - valorComDesconto,
        economiaPercentual: descontoEfetivo * 100,
        limites,
      };
    }),

  compararModalidades: baseProcedure
    .input(z.object({ valorDivida: z.number().positive() }))
    .query(({ input }) => {
      const classificacoes = ["A", "B", "C", "D"] as const;
      return classificacoes.map((cls) => {
        const limites = CAPAG_LIMITES[cls];
        const valorComDesconto =
          input.valorDivida * (1 - limites.descontoMaximo);
        const valorParcela =
          limites.prazoMaximoMeses > 0
            ? valorComDesconto / limites.prazoMaximoMeses
            : valorComDesconto;

        return {
          classificacao: cls,
          descontoMaximo: limites.descontoMaximo * 100,
          prazoMaximo: limites.prazoMaximoMeses,
          valorOriginal: input.valorDivida,
          valorComDesconto,
          valorParcela,
          economia: input.valorDivida - valorComDesconto,
          descricao: limites.descricao,
        };
      });
    }),

  listByLaudo: baseProcedure
    .input(z.object({ laudoId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.simulacaoTransacao.findMany({
        where: { laudoId: input.laudoId },
        orderBy: { createdAt: "desc" },
      });
    }),

  delete: baseProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.simulacaoTransacao.delete({ where: { id: input.id } });
    }),
});
