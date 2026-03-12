import { describe, it, expect } from "vitest";
import {
  gerarParecerTemplate,
  buildAIPrompt,
  type ParecerInput,
} from "../../src/server/capag/parecer";

const baseInput: ParecerInput = {
  razaoSocial: "Empresa Teste LTDA",
  cpfCnpj: "12.345.678/0001-90",
  tipo: "PJ",
  valorDivida: 500000,
  metodologia: "ROA_PLR",
  valorCapagE: 350000,
  classificacao: "C",
  plr: 200000,
  bensEssenciais: 50000,
  indicadores: {
    liquidezCorrente: 1.2,
    liquidezSeca: 0.85,
    liquidezImediata: 0.3,
    endividamentoGeral: 0.65,
    margemBruta: 0.25,
    margemOperacional: 0.1,
    margemLiquida: 0.06,
    roe: 0.12,
    roa: 0.05,
  },
  exercicioRef: 2024,
  temDfcDireto: true,
  exerciciosDfc: [2023, 2024],
  patrimonioLiquido: 250000,
  ativoTotal: 800000,
  passivoTotal: 550000,
};

describe("gerarParecerTemplate", () => {
  it("deve gerar parecer completo com todas as seções", () => {
    const result = gerarParecerTemplate(baseInput);

    expect(result.parecerTecnico).toContain("PARECER TÉCNICO");
    expect(result.parecerTecnico).toContain("1. IDENTIFICAÇÃO");
    expect(result.parecerTecnico).toContain("2. OBJETO");
    expect(result.parecerTecnico).toContain("3. METODOLOGIA APLICADA");
    expect(result.parecerTecnico).toContain("4. ANÁLISE CONTÁBIL");
    expect(result.parecerTecnico).toContain("5. DEMONSTRAÇÃO DE FLUXO DE CAIXA");
    expect(result.parecerTecnico).toContain("6. RESULTADO");
    expect(result.parecerTecnico).toContain("7. FUNDAMENTAÇÃO LEGAL");
    expect(result.parecerTecnico).toContain("8. CONCLUSÃO");
  });

  it("deve incluir dados do contribuinte", () => {
    const result = gerarParecerTemplate(baseInput);

    expect(result.parecerTecnico).toContain("Empresa Teste LTDA");
    expect(result.parecerTecnico).toContain("12.345.678/0001-90");
  });

  it("deve identificar a metodologia corretamente", () => {
    const result = gerarParecerTemplate(baseInput);
    expect(result.parecerTecnico).toContain("ROA + PLR");

    const fcoInput = { ...baseInput, metodologia: "FCO_PLR" as const };
    const fcoResult = gerarParecerTemplate(fcoInput);
    expect(fcoResult.parecerTecnico).toContain("FCO + PLR");
  });

  it("deve retornar conclusão parcial para classificação C", () => {
    const result = gerarParecerTemplate(baseInput);

    expect(result.conclusao).toBe("parcial");
    expect(result.conclusaoTexto).toContain("65%");
    expect(result.conclusaoTexto).toContain("114 meses");
  });

  it("deve retornar conclusão favorável para classificação A", () => {
    const inputA = { ...baseInput, classificacao: "A" as const };
    const result = gerarParecerTemplate(inputA);

    expect(result.conclusao).toBe("favoravel");
    expect(result.conclusaoTexto).toContain("favoráveis");
  });

  it("deve retornar conclusão favorável para classificação B", () => {
    const inputB = { ...baseInput, classificacao: "B" as const };
    const result = gerarParecerTemplate(inputB);

    expect(result.conclusao).toBe("favoravel");
  });

  it("deve retornar conclusão parcial para classificação D", () => {
    const inputD = {
      ...baseInput,
      classificacao: "D" as const,
      valorCapagE: 0,
    };
    const result = gerarParecerTemplate(inputD);

    expect(result.conclusao).toBe("parcial");
    expect(result.conclusaoTexto).toContain("70%");
    expect(result.conclusaoTexto).toContain("133 meses");
  });

  it("deve retornar desfavorável sem DFC direto", () => {
    const inputSemDfc = { ...baseInput, temDfcDireto: false };
    const result = gerarParecerTemplate(inputSemDfc);

    expect(result.conclusao).toBe("desfavoravel");
    expect(result.conclusaoTexto).toContain("Portaria PGFN 1.457/2024");
    expect(result.parecerTecnico).toContain("⚠️ ATENÇÃO");
  });

  it("deve gerar recomendações", () => {
    const result = gerarParecerTemplate(baseInput);

    expect(result.recomendacoes).toBeTruthy();
    expect(result.recomendacoes).toContain("1.");
    expect(result.recomendacoes).toContain("30 dias");
  });

  it("deve gerar limitações", () => {
    const result = gerarParecerTemplate(baseInput);

    expect(result.limitacoes).toBeTruthy();
    expect(result.limitacoes).toContain("PGFN");
    expect(result.limitacoes).toContain("30 dias");
  });

  it("não deve ser marcado como gerado por IA", () => {
    const result = gerarParecerTemplate(baseInput);
    expect(result.geradoPorIA).toBe(false);
  });

  it("deve alertar sobre liquidez baixa nas recomendações", () => {
    const inputLiqBaixa = {
      ...baseInput,
      indicadores: { ...baseInput.indicadores, liquidezCorrente: 0.7 },
    };
    const result = gerarParecerTemplate(inputLiqBaixa);

    expect(result.recomendacoes).toContain("liquidez corrente");
  });

  it("deve alertar sobre endividamento alto nas recomendações", () => {
    const inputEndAlto = {
      ...baseInput,
      indicadores: { ...baseInput.indicadores, endividamentoGeral: 0.85 },
    };
    const result = gerarParecerTemplate(inputEndAlto);

    expect(result.recomendacoes).toContain("endividamento geral");
  });

  it("deve incluir indicadores no parecer", () => {
    const result = gerarParecerTemplate(baseInput);

    expect(result.parecerTecnico).toContain("Liquidez Corrente");
    expect(result.parecerTecnico).toContain("ROE");
  });
});

describe("buildAIPrompt", () => {
  it("deve gerar prompt com dados completos", () => {
    const prompt = buildAIPrompt(baseInput);

    expect(prompt).toContain("perito contábil");
    expect(prompt).toContain("Empresa Teste LTDA");
    expect(prompt).toContain("ROA + PLR");
    expect(prompt).toContain("Portaria PGFN 6.757/2022");
    expect(prompt).toContain("2000 palavras");
  });

  it("deve incluir legislação aplicável", () => {
    const prompt = buildAIPrompt(baseInput);

    expect(prompt).toContain("Lei 14.375/2022");
    expect(prompt).toContain("Portaria PGFN 1.457/2024");
    expect(prompt).toContain("CPC 03");
  });
});
