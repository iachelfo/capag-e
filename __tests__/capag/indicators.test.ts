import { describe, it, expect } from "vitest";
import { calcularIndicadores, interpretarIndicador } from "@/server/capag/indicators";

// Helper to create a minimal BalancoPatrimonial-like object
function makeBalanco(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    laudoId: 1,
    exercicio: 2023,
    ativoCirculante: 300_000,
    ativoNaoCirculante: 700_000,
    ativoTotal: 1_000_000,
    passivoCirculante: 200_000,
    passivoNaoCirculante: 300_000,
    passivoTotal: 500_000,
    patrimonioLiquido: 500_000,
    caixaEquivalentes: 50_000,
    estoques: 80_000,
    contasReceber: null,
    imobilizado: 400_000,
    intangivel: null,
    contasPagar: null,
    emprestimos: null,
    createdAt: new Date(),
    ...overrides,
  } as any;
}

function makeDre(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    laudoId: 1,
    exercicio: 2023,
    receitaBruta: 1_200_000,
    deducoes: 200_000,
    receitaLiquida: 1_000_000,
    custosMercadorias: 600_000,
    lucroBruto: 400_000,
    despesasOperacionais: 250_000,
    despesasAdministrativas: null,
    despesasVendas: null,
    resultadoFinanceiro: -20_000,
    resultadoOperacional: 150_000,
    resultadoAntesIR: null,
    provisaoIRCSLL: null,
    lucroLiquido: 100_000,
    createdAt: new Date(),
    ...overrides,
  } as any;
}

describe("calcularIndicadores", () => {
  it("calcula liquidez corrente corretamente", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    // LC = AC / PC = 300k / 200k = 1.5
    expect(result.liquidezCorrente).toBe(1.5);
  });

  it("calcula liquidez seca (exclui estoques)", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    // LS = (AC - Estoques) / PC = (300k - 80k) / 200k = 1.1
    expect(result.liquidezSeca).toBe(1.1);
  });

  it("calcula liquidez imediata (so caixa)", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    // LI = Caixa / PC = 50k / 200k = 0.25
    expect(result.liquidezImediata).toBe(0.25);
  });

  it("calcula liquidez geral", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    // LG = (AC + ANC) / (PC + PNC) = 1M / 500k = 2.0
    expect(result.liquidezGeral).toBe(2);
  });

  it("calcula endividamento geral", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    // EG = (PC + PNC) / AT = 500k / 1M = 0.5
    expect(result.endividamentoGeral).toBe(0.5);
  });

  it("calcula composicao de endividamento", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    // CE = PC / (PC + PNC) = 200k / 500k = 0.4
    expect(result.composicaoEndividamento).toBe(0.4);
  });

  it("calcula imobilizacao do PL", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    // IPL = Imobilizado / PL = 400k / 500k = 0.8
    expect(result.imobilizacaoPL).toBe(0.8);
  });

  it("calcula margens (bruta, operacional, liquida)", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    // MB = LB / RL = 400k / 1M = 0.4
    expect(result.margemBruta).toBe(0.4);
    // MO = RO / RL = 150k / 1M = 0.15
    expect(result.margemOperacional).toBe(0.15);
    // ML = LL / RL = 100k / 1M = 0.1
    expect(result.margemLiquida).toBe(0.1);
  });

  it("calcula ROE e ROA", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    // ROE = LL / PL = 100k / 500k = 0.2
    expect(result.roe).toBe(0.2);
    // ROA = LL / AT = 100k / 1M = 0.1
    expect(result.roa).toBe(0.1);
  });

  it("calcula giro do ativo", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    // GA = RL / AT = 1M / 1M = 1.0
    expect(result.giroAtivo).toBe(1);
  });

  it("retorna null para divisao por zero", () => {
    const balanco = makeBalanco({ passivoCirculante: 0 });
    const result = calcularIndicadores(balanco, makeDre());
    expect(result.liquidezCorrente).toBeNull();
    expect(result.liquidezSeca).toBeNull();
    expect(result.liquidezImediata).toBeNull();
  });

  it("calcula variacao de receita com DRE anterior", () => {
    const dreAnterior = makeDre({ receitaLiquida: 800_000 });
    const result = calcularIndicadores(makeBalanco(), makeDre(), dreAnterior);
    // VR = (1M - 800k) / 800k = 0.25
    expect(result.variacaoReceita).toBe(0.25);
  });

  it("variacao de receita null sem DRE anterior", () => {
    const result = calcularIndicadores(makeBalanco(), makeDre());
    expect(result.variacaoReceita).toBeNull();
  });

  it("trata estoques null como 0", () => {
    const balanco = makeBalanco({ estoques: null });
    const result = calcularIndicadores(balanco, makeDre());
    // LS = (AC - 0) / PC = 300k / 200k = 1.5
    expect(result.liquidezSeca).toBe(1.5);
  });
});

describe("interpretarIndicador", () => {
  it("classifica liquidez corrente como bom (>= 1.5)", () => {
    expect(interpretarIndicador("liquidezCorrente", 1.5)).toBe("bom");
    expect(interpretarIndicador("liquidezCorrente", 2.0)).toBe("bom");
  });

  it("classifica liquidez corrente como regular (>= 1.0, < 1.5)", () => {
    expect(interpretarIndicador("liquidezCorrente", 1.0)).toBe("regular");
    expect(interpretarIndicador("liquidezCorrente", 1.2)).toBe("regular");
  });

  it("classifica liquidez corrente como ruim (< 1.0)", () => {
    expect(interpretarIndicador("liquidezCorrente", 0.5)).toBe("ruim");
  });

  it("endividamento geral invertido: menor = melhor", () => {
    expect(interpretarIndicador("endividamentoGeral", 0.3)).toBe("bom");
    expect(interpretarIndicador("endividamentoGeral", 0.6)).toBe("regular");
    expect(interpretarIndicador("endividamentoGeral", 0.9)).toBe("ruim");
  });

  it("retorna indisponivel para null", () => {
    expect(interpretarIndicador("liquidezCorrente", null)).toBe("indisponivel");
  });

  it("retorna regular para indicador desconhecido", () => {
    expect(interpretarIndicador("indicadorDesconhecido", 0.5)).toBe("regular");
  });
});
