import { z } from "zod/v4";
import { createTRPCRouter, baseProcedure } from "../init";
import { laudoCreateSchema, laudoUpdateSchema } from "@/lib/validators";
import { calcularCapagE } from "@/server/capag/calculator";
import { classificarCapag } from "@/server/capag/classification";

export const laudoRouter = createTRPCRouter({
  list: baseProcedure
    .input(
      z
        .object({
          status: z.enum(["rascunho", "em_analise", "finalizado"]).optional(),
          classificacao: z.enum(["A", "B", "C", "D"]).optional(),
          take: z.number().int().min(1).max(100).default(20),
          skip: z.number().int().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { status, classificacao, take = 20, skip = 0 } = input ?? {};
      const where = {
        ...(status ? { status } : {}),
        ...(classificacao ? { classificacaoCapag: classificacao } : {}),
      };

      const [items, total] = await Promise.all([
        ctx.db.laudo.findMany({
          where,
          take,
          skip,
          orderBy: { updatedAt: "desc" },
          include: { contribuinte: true },
        }),
        ctx.db.laudo.count({ where }),
      ]);
      return { items, total };
    }),

  getById: baseProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.laudo.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          contribuinte: true,
          balancos: { orderBy: { exercicio: "asc" } },
          dres: { orderBy: { exercicio: "asc" } },
          dfcs: { orderBy: { exercicio: "asc" } },
          indicadores: { orderBy: { exercicio: "asc" } },
          documentos: { orderBy: { createdAt: "desc" } },
          simulacoes: { orderBy: { createdAt: "desc" } },
          historico: { orderBy: { dataAlteracao: "desc" }, take: 50 },
        },
      });
    }),

  getStats: baseProcedure.query(async ({ ctx }) => {
    const [total, rascunho, emAnalise, finalizado, classA, classB, classC, classD] =
      await Promise.all([
        ctx.db.laudo.count(),
        ctx.db.laudo.count({ where: { status: "rascunho" } }),
        ctx.db.laudo.count({ where: { status: "em_analise" } }),
        ctx.db.laudo.count({ where: { status: "finalizado" } }),
        ctx.db.laudo.count({ where: { classificacaoCapag: "A" } }),
        ctx.db.laudo.count({ where: { classificacaoCapag: "B" } }),
        ctx.db.laudo.count({ where: { classificacaoCapag: "C" } }),
        ctx.db.laudo.count({ where: { classificacaoCapag: "D" } }),
      ]);

    return {
      total,
      porStatus: { rascunho, emAnalise, finalizado },
      porClassificacao: { A: classA, B: classB, C: classC, D: classD },
    };
  }),

  create: baseProcedure
    .input(laudoCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.laudo.create({ data: input });
    }),

  update: baseProcedure
    .input(laudoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Registrar histórico de alterações
      const current = await ctx.db.laudo.findUniqueOrThrow({ where: { id } });
      const changes: { campoAlterado: string; valorAnterior: string | null; valorNovo: string | null }[] = [];

      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          const oldVal = (current as Record<string, unknown>)[key];
          if (String(oldVal) !== String(value)) {
            changes.push({
              campoAlterado: key,
              valorAnterior: oldVal != null ? String(oldVal) : null,
              valorNovo: value != null ? String(value) : null,
            });
          }
        }
      }

      const [laudo] = await Promise.all([
        ctx.db.laudo.update({ where: { id }, data }),
        ...changes.map((c) =>
          ctx.db.historicoAlteracao.create({ data: { laudoId: id, ...c } })
        ),
      ]);

      return laudo;
    }),

  updateStatus: baseProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["rascunho", "em_analise", "finalizado"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const laudo = await ctx.db.laudo.findUniqueOrThrow({ where: { id: input.id } });

      // Validar transições de status
      const validTransitions: Record<string, string[]> = {
        rascunho: ["em_analise"],
        em_analise: ["rascunho", "finalizado"],
        finalizado: ["em_analise"],
      };

      if (!validTransitions[laudo.status]?.includes(input.status)) {
        throw new Error(
          `Transição inválida: ${laudo.status} → ${input.status}`
        );
      }

      return ctx.db.laudo.update({
        where: { id: input.id },
        data: {
          status: input.status,
          ...(input.status === "finalizado" ? { dataEmissao: new Date() } : {}),
        },
      });
    }),

  calcularCapag: baseProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        metodologia: z.enum(["ROA_PLR", "FCO_PLR"]),
        bensEssenciais: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const laudo = await ctx.db.laudo.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          balancos: { orderBy: { exercicio: "asc" } },
          dres: { orderBy: { exercicio: "asc" } },
          dfcs: { orderBy: { exercicio: "asc" } },
        },
      });

      if (laudo.balancos.length === 0 || laudo.dres.length === 0) {
        throw new Error("É necessário informar Balanço Patrimonial e DRE para calcular a CAPAG-e.");
      }

      const ultimoBalanco = laudo.balancos[laudo.balancos.length - 1];
      const patrimonioLiquido = ultimoBalanco.patrimonioLiquido;

      const resultado = calcularCapagE({
        metodologia: input.metodologia,
        resultadosOperacionais: laudo.dres.map((d) => d.resultadoOperacional),
        fluxosCaixaOperacional: laudo.dfcs.map((d) => d.caixaLiquidoOperacional),
        patrimonioLiquido,
        bensEssenciais: input.bensEssenciais,
      });

      const classificacao = classificarCapag(
        resultado.valorCapagE,
        laudo.valorDivida ?? 0
      );

      return ctx.db.laudo.update({
        where: { id: input.id },
        data: {
          metodologia: input.metodologia,
          valorCapagE: resultado.valorCapagE,
          classificacaoCapag: classificacao.classificacao,
          resultadoOperacionalAjustado:
            input.metodologia === "ROA_PLR" ? resultado.componente1 : null,
          caixaLiquidoOperacional:
            input.metodologia === "FCO_PLR" ? resultado.componente1 : null,
          patrimonioLiquidoRealizavel: resultado.plr,
          bensEssenciais: input.bensEssenciais,
          status: "em_analise",
        },
      });
    }),

  delete: baseProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.laudo.delete({ where: { id: input.id } });
    }),
});
