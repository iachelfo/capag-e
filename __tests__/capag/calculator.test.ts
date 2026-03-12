import { describe, it, expect } from "vitest";
import { calcularCapagE } from "@/server/capag/calculator";

describe("calcularCapagE", () => {
  describe("Metodologia ROA_PLR", () => {
    it("calcula CAPAG-e com ROA e PLR corretos", () => {
      const result = calcularCapagE({
        metodologia: "ROA_PLR",
        resultadosOperacionais: [100_000, 200_000],
        fluxosCaixaOperacional: [],
        patrimonioLiquido: 500_000,
        bensEssenciais: 100_000,
      });

      // ROA medio = (100k + 200k) / 2 = 150k
      // CAPAG-e = 150k * 5 + (500k - 100k) = 750k + 400k = 1_150_000
      expect(result.valorCapagE).toBe(1_150_000);
      expect(result.componente1).toBe(150_000);
      expect(result.plr).toBe(400_000);
      expect(result.metodologia).toBe("ROA_PLR");
      expect(result.detalhamento.mediaMultiplicada).toBe(750_000);
    });

    it("PLR nunca fica negativo (bens essenciais > PL)", () => {
      const result = calcularCapagE({
        metodologia: "ROA_PLR",
        resultadosOperacionais: [50_000],
        fluxosCaixaOperacional: [],
        patrimonioLiquido: 100_000,
        bensEssenciais: 200_000,
      });

      // PLR = max(0, 100k - 200k) = 0
      expect(result.plr).toBe(0);
      expect(result.valorCapagE).toBe(250_000); // 50k * 5 + 0
    });

    it("funciona com um unico exercicio", () => {
      const result = calcularCapagE({
        metodologia: "ROA_PLR",
        resultadosOperacionais: [80_000],
        fluxosCaixaOperacional: [],
        patrimonioLiquido: 300_000,
        bensEssenciais: 0,
      });

      expect(result.valorCapagE).toBe(700_000); // 80k * 5 + 300k
    });

    it("funciona com resultados negativos", () => {
      const result = calcularCapagE({
        metodologia: "ROA_PLR",
        resultadosOperacionais: [-50_000, -30_000],
        fluxosCaixaOperacional: [],
        patrimonioLiquido: 200_000,
        bensEssenciais: 0,
      });

      // ROA medio = -40k, CAPAG-e = -40k * 5 + 200k = -200k + 200k = 0
      expect(result.valorCapagE).toBe(0);
      expect(result.componente1).toBe(-40_000);
    });

    it("lanca erro sem resultados operacionais", () => {
      expect(() =>
        calcularCapagE({
          metodologia: "ROA_PLR",
          resultadosOperacionais: [],
          fluxosCaixaOperacional: [],
          patrimonioLiquido: 100_000,
          bensEssenciais: 0,
        })
      ).toThrow("ao menos um exercício");
    });
  });

  describe("Metodologia FCO_PLR", () => {
    it("calcula CAPAG-e com FCO e PLR corretos", () => {
      const result = calcularCapagE({
        metodologia: "FCO_PLR",
        resultadosOperacionais: [],
        fluxosCaixaOperacional: [120_000, 180_000],
        patrimonioLiquido: 400_000,
        bensEssenciais: 50_000,
      });

      // FCO medio = 150k, PLR = 350k
      // CAPAG-e = 150k * 5 + 350k = 750k + 350k = 1_100_000
      expect(result.valorCapagE).toBe(1_100_000);
      expect(result.componente1).toBe(150_000);
      expect(result.plr).toBe(350_000);
      expect(result.metodologia).toBe("FCO_PLR");
    });

    it("lanca erro sem fluxos de caixa", () => {
      expect(() =>
        calcularCapagE({
          metodologia: "FCO_PLR",
          resultadosOperacionais: [],
          fluxosCaixaOperacional: [],
          patrimonioLiquido: 100_000,
          bensEssenciais: 0,
        })
      ).toThrow("ao menos um exercício");
    });

    it("funciona com FCO negativo", () => {
      const result = calcularCapagE({
        metodologia: "FCO_PLR",
        resultadosOperacionais: [],
        fluxosCaixaOperacional: [-100_000],
        patrimonioLiquido: 300_000,
        bensEssenciais: 0,
      });

      // FCO medio = -100k, CAPAG-e = -100k * 5 + 300k = -500k + 300k = -200k
      expect(result.valorCapagE).toBe(-200_000);
    });
  });

  describe("Calculo PLR", () => {
    it("PLR = PL - bens essenciais quando PL > bens", () => {
      const result = calcularCapagE({
        metodologia: "ROA_PLR",
        resultadosOperacionais: [10_000],
        fluxosCaixaOperacional: [],
        patrimonioLiquido: 500_000,
        bensEssenciais: 200_000,
      });

      expect(result.plr).toBe(300_000);
    });

    it("PLR = 0 quando PL < bens essenciais", () => {
      const result = calcularCapagE({
        metodologia: "ROA_PLR",
        resultadosOperacionais: [10_000],
        fluxosCaixaOperacional: [],
        patrimonioLiquido: 100_000,
        bensEssenciais: 300_000,
      });

      expect(result.plr).toBe(0);
    });

    it("PLR = PL quando bens essenciais = 0", () => {
      const result = calcularCapagE({
        metodologia: "ROA_PLR",
        resultadosOperacionais: [10_000],
        fluxosCaixaOperacional: [],
        patrimonioLiquido: 500_000,
        bensEssenciais: 0,
      });

      expect(result.plr).toBe(500_000);
    });
  });
});
