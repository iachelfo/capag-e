import { z } from "zod/v4";

// ─── Contribuinte ──────────────────────────────────────────────
export const contribuinteCreateSchema = z.object({
  cpfCnpj: z.string().min(11).max(18),
  razaoSocial: z.string().min(2),
  nomeFantasia: z.string().optional(),
  tipo: z.enum(["PF", "PJ", "MEI", "SIMPLES"]),
  regimeTributario: z
    .enum(["LUCRO_REAL", "LUCRO_PRESUMIDO", "SIMPLES_NACIONAL", "MEI"])
    .optional(),
  atividadePrincipal: z.string().optional(),
  cnae: z.string().optional(),
  endereco: z.string().optional(),
  municipio: z.string().optional(),
  uf: z.string().max(2).optional(),
  telefone: z.string().optional(),
  email: z.email().optional(),
});

export const contribuinteUpdateSchema = contribuinteCreateSchema.partial();

// ─── Laudo ─────────────────────────────────────────────────────
export const laudoCreateSchema = z.object({
  contribuinteId: z.number().int().positive(),
  valorDivida: z.number().positive().optional(),
  processoAdmin: z.string().optional(),
  exercicioInicio: z.number().int().min(2000).max(2030).optional(),
  exercicioFim: z.number().int().min(2000).max(2030).optional(),
});

export const laudoUpdateSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["rascunho", "em_analise", "finalizado"]).optional(),
  metodologia: z.enum(["ROA_PLR", "FCO_PLR"]).optional(),
  parecerTecnico: z.string().optional(),
  recomendacoes: z.string().optional(),
  conclusao: z.enum(["favoravel", "desfavoravel", "parcial"]).optional(),
  conclusaoTexto: z.string().optional(),
  limitacoes: z.string().optional(),
  valorDivida: z.number().optional(),
  bensEssenciais: z.number().min(0).optional(),
});

// ─── Balanço Patrimonial ───────────────────────────────────────
export const balancoUpsertSchema = z.object({
  laudoId: z.number().int().positive(),
  exercicio: z.number().int().min(2000).max(2030),
  ativoCirculante: z.number(),
  ativoNaoCirculante: z.number(),
  ativoTotal: z.number(),
  passivoCirculante: z.number(),
  passivoNaoCirculante: z.number(),
  passivoTotal: z.number(),
  patrimonioLiquido: z.number(),
  caixaEquivalentes: z.number().optional(),
  estoques: z.number().optional(),
  contasReceber: z.number().optional(),
  imobilizado: z.number().optional(),
  intangivel: z.number().optional(),
  contasPagar: z.number().optional(),
  emprestimos: z.number().optional(),
});

// ─── DRE ───────────────────────────────────────────────────────
export const dreUpsertSchema = z.object({
  laudoId: z.number().int().positive(),
  exercicio: z.number().int().min(2000).max(2030),
  receitaBruta: z.number(),
  deducoes: z.number().default(0),
  receitaLiquida: z.number(),
  custosMercadorias: z.number(),
  lucroBruto: z.number(),
  despesasOperacionais: z.number(),
  despesasAdministrativas: z.number().optional(),
  despesasVendas: z.number().optional(),
  resultadoFinanceiro: z.number().optional(),
  resultadoOperacional: z.number(),
  resultadoAntesIR: z.number().optional(),
  provisaoIRCSLL: z.number().optional(),
  lucroLiquido: z.number(),
});

// ─── DFC ───────────────────────────────────────────────────────
export const dfcUpsertSchema = z.object({
  laudoId: z.number().int().positive(),
  exercicio: z.number().int().min(2000).max(2030),
  metodo: z.enum(["DIRETO", "INDIRETO"]),
  recebimentosClientes: z.number().optional(),
  pagamentosFornecedores: z.number().optional(),
  pagamentosSalarios: z.number().optional(),
  pagamentosImpostos: z.number().optional(),
  outrosRecebimentos: z.number().optional(),
  outrosPagamentos: z.number().optional(),
  caixaLiquidoOperacional: z.number(),
  lucroLiquidoBase: z.number().optional(),
  depreciacaoAmortizacao: z.number().optional(),
  variacaoCapitalGiro: z.number().optional(),
  atividadesInvestimento: z.number().optional(),
  atividadesFinanciamento: z.number().optional(),
  variacaoLiquidaCaixa: z.number().optional(),
  saldoInicialCaixa: z.number().optional(),
  saldoFinalCaixa: z.number().optional(),
});

// ─── Simulação ─────────────────────────────────────────────────
export const simulacaoCreateSchema = z.object({
  laudoId: z.number().int().positive().optional(),
  valorDivida: z.number().positive(),
  classificacaoCapag: z.enum(["A", "B", "C", "D"]),
  modalidade: z.enum(["INDIVIDUAL", "ADESAO", "EXCEPCIONAL"]),
  prazoMeses: z.number().int().positive().max(145),
});

// ─── Documento ─────────────────────────────────────────────────
export const documentoCreateSchema = z.object({
  laudoId: z.number().int().positive(),
  tipo: z.enum([
    "BALANCO",
    "DRE",
    "DFC",
    "DCTF",
    "PGDAS",
    "CONTRATO_SOCIAL",
    "ECAC",
    "IRPJ",
    "OUTROS",
  ]),
  nomeArquivo: z.string(),
  caminhoArquivo: z.string(),
  tamanhoBytes: z.number().int().nullable().optional(),
  mimeType: z.string().nullable().optional(),
});
