import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Contribuinte 1: Empresa PJ ────────────────────────────
  const empresa1 = await db.contribuinte.upsert({
    where: { cpfCnpj: "12.345.678/0001-90" },
    update: {},
    create: {
      cpfCnpj: "12.345.678/0001-90",
      razaoSocial: "Tech Solutions Ltda",
      nomeFantasia: "TechSol",
      tipo: "PJ",
      regimeTributario: "LUCRO_REAL",
      atividadePrincipal: "Desenvolvimento de software",
      cnae: "6201-5/01",
      endereco: "Rua da Inovação, 500, Sala 301",
      municipio: "São Paulo",
      uf: "SP",
      telefone: "(11) 3456-7890",
      email: "contato@techsol.com.br",
    },
  });

  // ─── Contribuinte 2: Empresa MEI ──────────────────────────
  const empresa2 = await db.contribuinte.upsert({
    where: { cpfCnpj: "98.765.432/0001-10" },
    update: {},
    create: {
      cpfCnpj: "98.765.432/0001-10",
      razaoSocial: "Maria Silva Confecções ME",
      nomeFantasia: "Ateliê da Maria",
      tipo: "SIMPLES",
      regimeTributario: "SIMPLES_NACIONAL",
      atividadePrincipal: "Confecção de peças do vestuário",
      cnae: "1412-6/01",
      endereco: "Av. Brasil, 1200",
      municipio: "Belo Horizonte",
      uf: "MG",
      telefone: "(31) 9876-5432",
      email: "maria@ateliedamaria.com.br",
    },
  });

  // ─── Contribuinte 3: Pessoa Física ────────────────────────
  const pf = await db.contribuinte.upsert({
    where: { cpfCnpj: "123.456.789-00" },
    update: {},
    create: {
      cpfCnpj: "123.456.789-00",
      razaoSocial: "João Carlos Pereira",
      tipo: "PF",
      endereco: "Rua das Flores, 42",
      municipio: "Curitiba",
      uf: "PR",
      email: "joao.pereira@email.com",
    },
  });

  // ─── Laudo 1: Finalizado, Classificação C ──────────────────
  const laudo1 = await db.laudo.create({
    data: {
      contribuinteId: empresa1.id,
      status: "finalizado",
      classificacaoCapag: "C",
      valorCapagE: 850_000,
      valorDivida: 1_500_000,
      metodologia: "ROA_PLR",
      resultadoOperacionalAjustado: 110_000,
      patrimonioLiquidoRealizavel: 300_000,
      bensEssenciais: 200_000,
      parecerTecnico:
        "A análise dos demonstrativos contábeis dos exercícios de 2021 a 2023 revela que a empresa possui capacidade de pagamento parcial. O resultado operacional apresenta tendência positiva, embora insuficiente para cobertura integral da dívida. O patrimônio líquido realizável, após dedução dos bens essenciais à atividade, complementa a CAPAG-e mas não atinge o valor total do débito.",
      conclusao: "parcial",
      conclusaoTexto:
        "Diante da análise, a empresa se enquadra na classificação C, podendo pleitear descontos de até 65% e parcelamento em até 114 meses.",
      limitacoes:
        "A análise baseou-se exclusivamente nos demonstrativos fornecidos pela empresa. Não foram realizadas verificações in loco.",
      recomendacoes:
        "Recomenda-se a modalidade de transação individual com desconto, considerando a classificação C obtida.",
      processoAdmin: "10166.123456/2023-01",
      exercicioInicio: 2021,
      exercicioFim: 2023,
      dataEmissao: new Date("2024-06-15"),
    },
  });

  // Balanços para Laudo 1
  for (const ex of [2021, 2022, 2023]) {
    const mult = 1 + (ex - 2021) * 0.08;
    await db.balancoPatrimonial.create({
      data: {
        laudoId: laudo1.id,
        exercicio: ex,
        ativoCirculante: 450_000 * mult,
        ativoNaoCirculante: 1_050_000 * mult,
        ativoTotal: 1_500_000 * mult,
        passivoCirculante: 380_000 * mult,
        passivoNaoCirculante: 620_000 * mult,
        passivoTotal: 1_000_000 * mult,
        patrimonioLiquido: 500_000 * mult,
        caixaEquivalentes: 80_000 * mult,
        estoques: 120_000 * mult,
        imobilizado: 700_000 * mult,
      },
    });
  }

  // DREs para Laudo 1
  for (const ex of [2021, 2022, 2023]) {
    const mult = 1 + (ex - 2021) * 0.1;
    await db.dRE.create({
      data: {
        laudoId: laudo1.id,
        exercicio: ex,
        receitaBruta: 2_000_000 * mult,
        deducoes: 300_000 * mult,
        receitaLiquida: 1_700_000 * mult,
        custosMercadorias: 1_000_000 * mult,
        lucroBruto: 700_000 * mult,
        despesasOperacionais: 580_000 * mult,
        resultadoFinanceiro: -30_000,
        resultadoOperacional: 120_000 * mult,
        lucroLiquido: 80_000 * mult,
      },
    });
  }

  // DFCs para Laudo 1
  for (const ex of [2021, 2022, 2023]) {
    await db.dFC.create({
      data: {
        laudoId: laudo1.id,
        exercicio: ex,
        metodo: "DIRETO",
        recebimentosClientes: 1_600_000 + (ex - 2021) * 100_000,
        pagamentosFornecedores: -900_000 - (ex - 2021) * 50_000,
        pagamentosSalarios: -350_000 - (ex - 2021) * 20_000,
        pagamentosImpostos: -180_000 - (ex - 2021) * 10_000,
        caixaLiquidoOperacional: 170_000 + (ex - 2021) * 20_000,
        atividadesInvestimento: -80_000,
        atividadesFinanciamento: -50_000,
      },
    });
  }

  // Indicadores para Laudo 1
  for (const ex of [2021, 2022, 2023]) {
    const mult = 1 + (ex - 2021) * 0.08;
    await db.indicadorFinanceiro.create({
      data: {
        laudoId: laudo1.id,
        exercicio: ex,
        liquidezCorrente: Number((1.18 * mult).toFixed(4)),
        liquidezSeca: Number((0.87 * mult).toFixed(4)),
        liquidezImediata: Number((0.21 * mult).toFixed(4)),
        endividamentoGeral: 0.6667,
        margemBruta: 0.4118,
        margemOperacional: Number((0.07 * mult).toFixed(4)),
        margemLiquida: Number((0.047 * mult).toFixed(4)),
        roe: Number((0.16 * mult).toFixed(4)),
        roa: Number((0.053 * mult).toFixed(4)),
      },
    });
  }

  // ─── Laudo 2: Em análise, Classificação B ──────────────────
  const laudo2 = await db.laudo.create({
    data: {
      contribuinteId: empresa2.id,
      status: "em_analise",
      classificacaoCapag: "B",
      valorCapagE: 320_000,
      valorDivida: 250_000,
      metodologia: "FCO_PLR",
      caixaLiquidoOperacional: 44_000,
      patrimonioLiquidoRealizavel: 100_000,
      bensEssenciais: 50_000,
      processoAdmin: "10166.789012/2024-55",
      exercicioInicio: 2022,
      exercicioFim: 2023,
    },
  });

  // Dados mínimos para Laudo 2
  for (const ex of [2022, 2023]) {
    await db.balancoPatrimonial.create({
      data: {
        laudoId: laudo2.id,
        exercicio: ex,
        ativoCirculante: 180_000,
        ativoNaoCirculante: 120_000,
        ativoTotal: 300_000,
        passivoCirculante: 100_000,
        passivoNaoCirculante: 50_000,
        passivoTotal: 150_000,
        patrimonioLiquido: 150_000,
      },
    });
    await db.dRE.create({
      data: {
        laudoId: laudo2.id,
        exercicio: ex,
        receitaBruta: 500_000,
        receitaLiquida: 450_000,
        custosMercadorias: 250_000,
        lucroBruto: 200_000,
        despesasOperacionais: 160_000,
        resultadoOperacional: 40_000,
        lucroLiquido: 30_000,
      },
    });
    await db.dFC.create({
      data: {
        laudoId: laudo2.id,
        exercicio: ex,
        metodo: "DIRETO",
        recebimentosClientes: 420_000,
        pagamentosFornecedores: -230_000,
        pagamentosSalarios: -100_000,
        pagamentosImpostos: -46_000,
        caixaLiquidoOperacional: 44_000,
      },
    });
  }

  // ─── Laudo 3: Rascunho ────────────────────────────────────
  await db.laudo.create({
    data: {
      contribuinteId: pf.id,
      status: "rascunho",
      valorDivida: 85_000,
      processoAdmin: "10166.345678/2024-99",
    },
  });

  // ─── Laudo 4: Finalizado, Classificação D ──────────────────
  const laudo4 = await db.laudo.create({
    data: {
      contribuinteId: empresa1.id,
      status: "finalizado",
      classificacaoCapag: "D",
      valorCapagE: -120_000,
      valorDivida: 3_200_000,
      metodologia: "ROA_PLR",
      resultadoOperacionalAjustado: -24_000,
      patrimonioLiquidoRealizavel: 0,
      bensEssenciais: 500_000,
      parecerTecnico:
        "A empresa apresenta resultados operacionais negativos nos exercícios analisados, evidenciando grave deterioração financeira. O patrimônio líquido realizável é zero, considerando os bens essenciais à atividade empresarial.",
      conclusao: "desfavoravel",
      conclusaoTexto:
        "O contribuinte se enquadra na classificação D (crédito irrecuperável), podendo pleitear descontos de até 70% e parcelamento em até 133 meses.",
      processoAdmin: "10166.999888/2022-77",
      exercicioInicio: 2020,
      exercicioFim: 2022,
      dataEmissao: new Date("2023-11-20"),
    },
  });

  // Balanço simplificado Laudo 4
  await db.balancoPatrimonial.create({
    data: {
      laudoId: laudo4.id,
      exercicio: 2022,
      ativoCirculante: 100_000,
      ativoNaoCirculante: 600_000,
      ativoTotal: 700_000,
      passivoCirculante: 500_000,
      passivoNaoCirculante: 350_000,
      passivoTotal: 850_000,
      patrimonioLiquido: -150_000,
    },
  });

  // ─── Simulações ───────────────────────────────────────────
  await db.simulacaoTransacao.create({
    data: {
      laudoId: laudo1.id,
      valorDivida: 1_500_000,
      classificacaoCapag: "C",
      modalidade: "INDIVIDUAL",
      prazoMeses: 114,
      descontoPercentual: 0.50,
      valorComDesconto: 750_000,
      valorParcela: 6_578.95,
      valorEntrada: 75_000,
      observacoes: "Simulação com desconto de 50% sobre o valor da dívida",
    },
  });

  console.log("✅ Seed completed!");
  console.log(`   ${3} contribuintes`);
  console.log(`   ${4} laudos (1 finalizado C, 1 em_analise B, 1 rascunho, 1 finalizado D)`);
  console.log(`   Balanços, DREs, DFCs e indicadores criados`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
