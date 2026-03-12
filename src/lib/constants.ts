// ─── Classificação CAPAG - Limites por Rating ─────────────────

export const CAPAG_LIMITES = {
  A: {
    descontoMaximo: 0,
    prazoMaximoMeses: 60,
    descricao: "Capacidade de pagamento >= 2x a dívida. Sem desconto.",
    fundamentacao: "Art. 22, I, Portaria PGFN 6.757/2022",
  },
  B: {
    descontoMaximo: 0,
    prazoMaximoMeses: 60,
    descricao: "Capacidade de pagamento entre 1x e 2x a dívida. Sem desconto.",
    fundamentacao: "Art. 22, II, Portaria PGFN 6.757/2022",
  },
  C: {
    descontoMaximo: 0.65,
    prazoMaximoMeses: 114,
    descricao: "Capacidade de pagamento inferior à dívida. Até 65% de desconto.",
    fundamentacao: "Art. 22, III, Portaria PGFN 6.757/2022",
  },
  D: {
    descontoMaximo: 0.70,
    prazoMaximoMeses: 133,
    descricao: "Crédito irrecuperável. Até 70% de desconto.",
    fundamentacao: "Art. 22, IV e Art. 25, Portaria PGFN 6.757/2022",
  },
} as const;

// ─── Status do Laudo ───────────────────────────────────────────

export const STATUS_LAUDO = {
  rascunho: { label: "Rascunho", color: "bg-gray-100 text-gray-700" },
  em_analise: { label: "Em Análise", color: "bg-blue-100 text-blue-700" },
  finalizado: { label: "Finalizado", color: "bg-green-100 text-green-700" },
} as const;

// ─── Cores por Classificação CAPAG ─────────────────────────────

export const CAPAG_CORES = {
  A: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", hex: "#16a34a" },
  B: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", hex: "#2563eb" },
  C: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", hex: "#d97706" },
  D: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300", hex: "#dc2626" },
} as const;

// ─── Tipos de Contribuinte ─────────────────────────────────────

export const TIPOS_CONTRIBUINTE = [
  { value: "PF", label: "Pessoa Física" },
  { value: "PJ", label: "Pessoa Jurídica" },
  { value: "MEI", label: "Microempreendedor Individual" },
  { value: "SIMPLES", label: "Simples Nacional" },
] as const;

export const REGIMES_TRIBUTARIOS = [
  { value: "LUCRO_REAL", label: "Lucro Real" },
  { value: "LUCRO_PRESUMIDO", label: "Lucro Presumido" },
  { value: "SIMPLES_NACIONAL", label: "Simples Nacional" },
  { value: "MEI", label: "MEI" },
] as const;

// ─── Tipos de Documento ────────────────────────────────────────

export const TIPOS_DOCUMENTO = [
  { value: "BALANCO", label: "Balanço Patrimonial" },
  { value: "DRE", label: "Demonstração do Resultado (DRE)" },
  { value: "DFC", label: "Demonstração de Fluxo de Caixa (DFC)" },
  { value: "DCTF", label: "DCTF" },
  { value: "PGDAS", label: "PGDAS-D" },
  { value: "CONTRATO_SOCIAL", label: "Contrato Social" },
  { value: "ECAC", label: "e-CAC / Situação Fiscal" },
  { value: "IRPJ", label: "IRPJ / ECF" },
  { value: "OUTROS", label: "Outros" },
] as const;

// ─── Checklist de Documentos Obrigatórios (Art. 30) ────────────

export const CHECKLIST_DOCUMENTOS = [
  {
    id: "dre_2_exercicios",
    label: "DRE dos 2 últimos exercícios + parcial do exercício atual",
    obrigatorio: true,
    critico: false,
  },
  {
    id: "balanco_2_exercicios",
    label: "Balanço Patrimonial dos 2 últimos exercícios + parcial do exercício atual",
    obrigatorio: true,
    critico: false,
  },
  {
    id: "dfc_metodo_direto",
    label: "DFC pelo Método Direto (OBRIGATÓRIO - Portaria 1.457/2024)",
    obrigatorio: true,
    critico: true,
  },
  {
    id: "relacao_imoveis",
    label: "Relação de imóveis com matrícula + IPTU/ITR",
    obrigatorio: true,
    critico: false,
  },
  {
    id: "relacao_veiculos",
    label: "Relação de veículos com CRLV + IPVA",
    obrigatorio: true,
    critico: false,
  },
  {
    id: "relacao_credores",
    label: "Relação de credores com classificação e valores",
    obrigatorio: true,
    critico: false,
  },
  {
    id: "extratos_bancarios",
    label: "Extratos bancários atualizados",
    obrigatorio: true,
    critico: false,
  },
  {
    id: "aplicacoes_financeiras",
    label: "Posição de aplicações financeiras",
    obrigatorio: true,
    critico: false,
  },
  {
    id: "contratos_emprestimos",
    label: "Contratos de empréstimos e financiamentos",
    obrigatorio: true,
    critico: false,
  },
  {
    id: "contrato_social",
    label: "Contrato Social ou Estatuto atualizado",
    obrigatorio: false,
    critico: false,
  },
  {
    id: "ecad_situacao_fiscal",
    label: "Relatório de Situação Fiscal (e-CAC)",
    obrigatorio: false,
    critico: false,
  },
] as const;

// ─── Legislação ────────────────────────────────────────────────

export const LEGISLACAO = [
  {
    nome: "Lei 14.375/2022",
    descricao: "Dispõe sobre a transação tributária",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14375.htm",
  },
  {
    nome: "Portaria PGFN 6.757/2022",
    descricao: "Regulamenta a transação na cobrança de créditos da União",
    url: "https://www.gov.br/pgfn/pt-br/servicos/orientacoes-procedimentos-e-normas/transacao",
  },
  {
    nome: "Portaria PGFN 1.241/2023",
    descricao: "Altera a Portaria 6.757/2022",
    url: "https://www.in.gov.br/web/dou",
  },
  {
    nome: "Portaria PGFN 1.457/2024",
    descricao: "Exige DFC pelo método direto para CAPAG-e",
    url: "https://www.gov.br/pgfn",
  },
] as const;

// ─── 10 Erros Comuns que Levam ao Indeferimento ────────────────

export const ERROS_COMUNS_INDEFERIMENTO = [
  "Ausência de DFC pelo método direto (causa mais frequente de indeferimento)",
  "Laudo sem valor numérico específico da CAPAG-e pretendida",
  "Utilização de DFC pelo método indireto ao invés do direto",
  "Falta de documentos obrigatórios do Art. 30",
  "Metodologia não explicitada ou inadequada",
  "Balanço patrimonial desatualizado ou incompleto",
  "Ausência de assinatura do contador responsável",
  "DRE sem os 2 últimos exercícios completos",
  "Desconsideração dos bens essenciais no cálculo do PLR",
  "Protocolo fora do prazo fatal de 30 dias",
] as const;

// ─── Interpretação de Indicadores ──────────────────────────────

export const INTERPRETACAO_INDICADORES = {
  liquidezCorrente: {
    label: "Liquidez Corrente",
    formula: "Ativo Circulante / Passivo Circulante",
    bom: ">= 1.5",
    regular: ">= 1.0",
    ruim: "< 1.0",
    descricao: "Capacidade de honrar obrigações de curto prazo",
  },
  liquidezSeca: {
    label: "Liquidez Seca",
    formula: "(AC - Estoques) / PC",
    bom: ">= 1.0",
    regular: ">= 0.7",
    ruim: "< 0.7",
    descricao: "Liquidez excluindo estoques",
  },
  liquidezImediata: {
    label: "Liquidez Imediata",
    formula: "Disponível / PC",
    bom: ">= 0.5",
    regular: ">= 0.2",
    ruim: "< 0.2",
    descricao: "Disponibilidade imediata de caixa",
  },
  liquidezGeral: {
    label: "Liquidez Geral",
    formula: "(AC + RLP) / (PC + PNC)",
    bom: ">= 1.0",
    regular: ">= 0.7",
    ruim: "< 0.7",
    descricao: "Capacidade de pagamento total",
  },
  endividamentoGeral: {
    label: "Endividamento Geral",
    formula: "(PC + PNC) / AT",
    bom: "<= 0.5",
    regular: "<= 0.7",
    ruim: "> 0.7",
    descricao: "Proporção de capital de terceiros",
  },
  margemLiquida: {
    label: "Margem Líquida",
    formula: "LL / RL",
    bom: ">= 10%",
    regular: ">= 5%",
    ruim: "< 5%",
    descricao: "Rentabilidade sobre vendas",
  },
  roe: {
    label: "ROE",
    formula: "LL / PL",
    bom: ">= 15%",
    regular: ">= 8%",
    ruim: "< 8%",
    descricao: "Retorno sobre o patrimônio líquido",
  },
} as const;
