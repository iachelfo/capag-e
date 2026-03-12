// ─── Classificação CAPAG ───────────────────────────────────────
// Conforme Art. 22 da Portaria PGFN 6.757/2022

export type ClassificacaoCapag = "A" | "B" | "C" | "D";

export interface ClassificacaoResult {
  classificacao: ClassificacaoCapag;
  descontoMaximo: number; // 0 a 1 (percentual)
  prazoMaximoMeses: number;
  fundamentacao: string;
  descricao: string;
  ratio: number; // CAPAG-e / Dívida
}

/**
 * Classifica a CAPAG de acordo com a relação entre
 * o valor da CAPAG-e calculada e o valor da dívida.
 *
 * A: CAPAG >= 2× dívida → SEM desconto, até 60 meses
 * B: CAPAG entre 1× e 2× → SEM desconto, até 60 meses
 * C: CAPAG < dívida total → ATÉ 65% desconto, até 114 meses
 * D: Crédito irrecuperável → ATÉ 70% desconto, até 133 meses
 */
export function classificarCapag(
  valorCapagE: number,
  valorDivida: number
): ClassificacaoResult {
  // Se a dívida é zero ou negativa, não há o que classificar
  if (valorDivida <= 0) {
    return {
      classificacao: "A",
      descontoMaximo: 0,
      prazoMaximoMeses: 60,
      fundamentacao: "Art. 22, I, Portaria PGFN 6.757/2022",
      descricao: "Sem dívida ativa para transação.",
      ratio: Infinity,
    };
  }

  const ratio = valorCapagE / valorDivida;

  if (ratio >= 2) {
    return {
      classificacao: "A",
      descontoMaximo: 0,
      prazoMaximoMeses: 60,
      fundamentacao: "Art. 22, I, Portaria PGFN 6.757/2022",
      descricao:
        "Capacidade de pagamento suficiente (>= 2× a dívida). Pagamento integral, sem desconto, em até 60 meses.",
      ratio,
    };
  }

  if (ratio >= 1) {
    return {
      classificacao: "B",
      descontoMaximo: 0,
      prazoMaximoMeses: 60,
      fundamentacao: "Art. 22, II, Portaria PGFN 6.757/2022",
      descricao:
        "Capacidade de pagamento entre 1× e 2× a dívida. Pagamento integral, sem desconto, em até 60 meses.",
      ratio,
    };
  }

  if (valorCapagE > 0) {
    return {
      classificacao: "C",
      descontoMaximo: 0.65,
      prazoMaximoMeses: 114,
      fundamentacao: "Art. 22, III, Portaria PGFN 6.757/2022",
      descricao:
        "Capacidade de pagamento inferior à dívida. Possibilidade de até 65% de desconto, em até 114 meses.",
      ratio,
    };
  }

  return {
    classificacao: "D",
    descontoMaximo: 0.70,
    prazoMaximoMeses: 133,
    fundamentacao: "Art. 22, IV e Art. 25, Portaria PGFN 6.757/2022",
    descricao:
      "Crédito irrecuperável ou de difícil recuperação. Possibilidade de até 70% de desconto, em até 133 meses.",
    ratio,
  };
}

/**
 * Hipóteses de classificação automática D (Art. 25)
 */
export const HIPOTESES_CLASSIFICACAO_D = [
  "Empresa em recuperação judicial ou extrajudicial",
  "Empresa em falência ou liquidação judicial",
  "Situação econômica que comprometa a existência da empresa",
  "Devedor pessoa física em situação de insolvência",
  "Contribuinte com CAPAG-e negativa ou igual a zero",
] as const;
