// ─── Motor de Cálculo CAPAG-e ──────────────────────────────────
// Duas metodologias oficiais conforme Portaria PGFN 6.757/2022

export interface CapagInput {
  metodologia: "ROA_PLR" | "FCO_PLR";
  resultadosOperacionais: number[]; // Array de Resultado Operacional por exercício
  fluxosCaixaOperacional: number[]; // Array de FCO por exercício (DFC)
  patrimonioLiquido: number;
  bensEssenciais: number; // Bens essenciais à atividade (deduzidos do PL)
}

export interface CapagResult {
  valorCapagE: number;
  componente1: number; // ROA médio ou FCO médio
  plr: number; // Patrimônio Líquido Realizável
  metodologia: "ROA_PLR" | "FCO_PLR";
  detalhamento: {
    mediaMultiplicada: number; // componente1 * 5
    valores: number[]; // valores usados no cálculo da média
  };
}

function media(valores: number[]): number {
  if (valores.length === 0) return 0;
  return valores.reduce((acc, v) => acc + v, 0) / valores.length;
}

/**
 * Calcula a CAPAG-e (Capacidade de Pagamento Extraordinária)
 *
 * Metodologia 1 (ROA + PLR):
 *   CAPAG-e = (ROA médio × 5) + PLR
 *   ROA = Resultado Operacional Ajustado (média dos exercícios)
 *   PLR = Patrimônio Líquido - Bens Essenciais
 *
 * Metodologia 2 (FCO + PLR):
 *   CAPAG-e = (FCO médio × 5) + PLR
 *   FCO = Fluxo de Caixa Operacional (média dos exercícios, do DFC)
 *   PLR = Patrimônio Líquido - Bens Essenciais
 */
export function calcularCapagE(input: CapagInput): CapagResult {
  const plr = Math.max(0, input.patrimonioLiquido - input.bensEssenciais);

  if (input.metodologia === "ROA_PLR") {
    const valores = input.resultadosOperacionais;
    if (valores.length === 0) {
      throw new Error(
        "É necessário ao menos um exercício com Resultado Operacional para a metodologia ROA+PLR."
      );
    }

    const roaMedio = media(valores);
    const mediaMultiplicada = roaMedio * 5;
    const valorCapagE = mediaMultiplicada + plr;

    return {
      valorCapagE,
      componente1: roaMedio,
      plr,
      metodologia: "ROA_PLR",
      detalhamento: { mediaMultiplicada, valores },
    };
  }

  // FCO_PLR
  const valores = input.fluxosCaixaOperacional;
  if (valores.length === 0) {
    throw new Error(
      "É necessário ao menos um exercício com Fluxo de Caixa Operacional para a metodologia FCO+PLR."
    );
  }

  const fcoMedio = media(valores);
  const mediaMultiplicada = fcoMedio * 5;
  const valorCapagE = mediaMultiplicada + plr;

  return {
    valorCapagE,
    componente1: fcoMedio,
    plr,
    metodologia: "FCO_PLR",
    detalhamento: { mediaMultiplicada, valores },
  };
}
