// ─── Cálculo Automático de Indicadores Financeiros ─────────────

import type { BalancoPatrimonial, DRE } from "@/generated/prisma/client";

export interface IndicadoresCalculados {
  liquidezCorrente: number | null;
  liquidezSeca: number | null;
  liquidezImediata: number | null;
  liquidezGeral: number | null;
  endividamentoGeral: number | null;
  composicaoEndividamento: number | null;
  imobilizacaoPL: number | null;
  margemBruta: number | null;
  margemOperacional: number | null;
  margemLiquida: number | null;
  roe: number | null;
  roa: number | null;
  giroAtivo: number | null;
  coberturaDivida: number | null;
  variacaoReceita: number | null;
}

function safeDivide(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return Number((numerator / denominator).toFixed(4));
}

/**
 * Calcula todos os indicadores financeiros a partir
 * do Balanço Patrimonial e DRE de um exercício.
 */
export function calcularIndicadores(
  balanco: BalancoPatrimonial,
  dre: DRE,
  dreAnterior?: DRE | null
): IndicadoresCalculados {
  const ac = balanco.ativoCirculante;
  const anc = balanco.ativoNaoCirculante;
  const at = balanco.ativoTotal;
  const pc = balanco.passivoCirculante;
  const pnc = balanco.passivoNaoCirculante;
  const pl = balanco.patrimonioLiquido;
  const estoques = balanco.estoques ?? 0;
  const caixa = balanco.caixaEquivalentes ?? 0;
  const imobilizado = balanco.imobilizado ?? 0;

  const rl = dre.receitaLiquida;
  const lb = dre.lucroBruto;
  const ro = dre.resultadoOperacional;
  const ll = dre.lucroLiquido;

  // Variação de Receita
  let variacaoReceita: number | null = null;
  if (dreAnterior && dreAnterior.receitaLiquida !== 0) {
    variacaoReceita = safeDivide(
      rl - dreAnterior.receitaLiquida,
      dreAnterior.receitaLiquida
    );
  }

  return {
    // Liquidez
    liquidezCorrente: safeDivide(ac, pc),
    liquidezSeca: safeDivide(ac - estoques, pc),
    liquidezImediata: safeDivide(caixa, pc),
    liquidezGeral: safeDivide(ac + anc, pc + pnc),

    // Estrutura / Endividamento
    endividamentoGeral: safeDivide(pc + pnc, at),
    composicaoEndividamento: safeDivide(pc, pc + pnc),
    imobilizacaoPL: safeDivide(imobilizado, pl),

    // Rentabilidade
    margemBruta: safeDivide(lb, rl),
    margemOperacional: safeDivide(ro, rl),
    margemLiquida: safeDivide(ll, rl),
    roe: safeDivide(ll, pl),
    roa: safeDivide(ll, at),

    // Atividade
    giroAtivo: safeDivide(rl, at),

    // Cobertura
    coberturaDivida: safeDivide(ll + (dre.resultadoFinanceiro ?? 0), pc),

    // Variação
    variacaoReceita,
  };
}

/**
 * Interpreta o valor de um indicador e retorna a classificação
 */
export function interpretarIndicador(
  nome: string,
  valor: number | null
): "bom" | "regular" | "ruim" | "indisponivel" {
  if (valor === null) return "indisponivel";

  const regras: Record<string, { bom: number; regular: number; invertido?: boolean }> = {
    liquidezCorrente: { bom: 1.5, regular: 1.0 },
    liquidezSeca: { bom: 1.0, regular: 0.7 },
    liquidezImediata: { bom: 0.5, regular: 0.2 },
    liquidezGeral: { bom: 1.0, regular: 0.7 },
    endividamentoGeral: { bom: 0.5, regular: 0.7, invertido: true },
    composicaoEndividamento: { bom: 0.5, regular: 0.7, invertido: true },
    margemBruta: { bom: 0.3, regular: 0.15 },
    margemOperacional: { bom: 0.15, regular: 0.05 },
    margemLiquida: { bom: 0.1, regular: 0.05 },
    roe: { bom: 0.15, regular: 0.08 },
    roa: { bom: 0.08, regular: 0.03 },
  };

  const regra = regras[nome];
  if (!regra) return "regular";

  if (regra.invertido) {
    if (valor <= regra.bom) return "bom";
    if (valor <= regra.regular) return "regular";
    return "ruim";
  }

  if (valor >= regra.bom) return "bom";
  if (valor >= regra.regular) return "regular";
  return "ruim";
}
