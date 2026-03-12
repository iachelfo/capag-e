import { describe, it, expect } from "vitest";
import { classificarCapag } from "@/server/capag/classification";

describe("classificarCapag", () => {
  describe("Classificacao A (CAPAG >= 2x divida)", () => {
    it("classifica A quando CAPAG = 2x divida", () => {
      const result = classificarCapag(200_000, 100_000);
      expect(result.classificacao).toBe("A");
      expect(result.descontoMaximo).toBe(0);
      expect(result.prazoMaximoMeses).toBe(60);
      expect(result.ratio).toBe(2);
    });

    it("classifica A quando CAPAG > 2x divida", () => {
      const result = classificarCapag(500_000, 100_000);
      expect(result.classificacao).toBe("A");
      expect(result.ratio).toBe(5);
    });
  });

  describe("Classificacao B (CAPAG entre 1x e 2x)", () => {
    it("classifica B quando CAPAG = 1x divida", () => {
      const result = classificarCapag(100_000, 100_000);
      expect(result.classificacao).toBe("B");
      expect(result.descontoMaximo).toBe(0);
      expect(result.prazoMaximoMeses).toBe(60);
      expect(result.ratio).toBe(1);
    });

    it("classifica B quando CAPAG = 1.5x divida", () => {
      const result = classificarCapag(150_000, 100_000);
      expect(result.classificacao).toBe("B");
      expect(result.ratio).toBe(1.5);
    });

    it("classifica B no limite inferior (exatamente 1x)", () => {
      const result = classificarCapag(100_000, 100_000);
      expect(result.classificacao).toBe("B");
    });

    it("classifica B no limite quase-superior (1.999x)", () => {
      const result = classificarCapag(199_900, 100_000);
      expect(result.classificacao).toBe("B");
    });
  });

  describe("Classificacao C (CAPAG < divida, positivo)", () => {
    it("classifica C quando CAPAG positiva < divida", () => {
      const result = classificarCapag(50_000, 100_000);
      expect(result.classificacao).toBe("C");
      expect(result.descontoMaximo).toBe(0.65);
      expect(result.prazoMaximoMeses).toBe(114);
      expect(result.ratio).toBe(0.5);
    });

    it("classifica C quando CAPAG muito pequena mas positiva", () => {
      const result = classificarCapag(1, 1_000_000);
      expect(result.classificacao).toBe("C");
    });
  });

  describe("Classificacao D (CAPAG <= 0)", () => {
    it("classifica D quando CAPAG = 0", () => {
      const result = classificarCapag(0, 100_000);
      expect(result.classificacao).toBe("D");
      expect(result.descontoMaximo).toBe(0.70);
      expect(result.prazoMaximoMeses).toBe(133);
    });

    it("classifica D quando CAPAG negativa", () => {
      const result = classificarCapag(-100_000, 200_000);
      expect(result.classificacao).toBe("D");
      expect(result.ratio).toBe(-0.5);
    });
  });

  describe("Casos especiais", () => {
    it("classifica A quando divida <= 0", () => {
      const result = classificarCapag(100_000, 0);
      expect(result.classificacao).toBe("A");
      expect(result.ratio).toBe(Infinity);
    });

    it("classifica A quando divida negativa", () => {
      const result = classificarCapag(100_000, -50_000);
      expect(result.classificacao).toBe("A");
    });

    it("retorna fundamentacao legal em todas as classificacoes", () => {
      const classes = [
        classificarCapag(300_000, 100_000), // A
        classificarCapag(150_000, 100_000), // B
        classificarCapag(50_000, 100_000),  // C
        classificarCapag(0, 100_000),       // D
      ];

      for (const c of classes) {
        expect(c.fundamentacao).toContain("Portaria PGFN");
        expect(c.descricao.length).toBeGreaterThan(10);
      }
    });
  });
});
