import { useState, useCallback } from "react";

export interface WizardData {
  // Step 1: Contribuinte
  contribuinteId?: number;
  contribuinte?: {
    cpfCnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    tipo: string;
    regimeTributario?: string;
    atividadePrincipal?: string;
    cnae?: string;
    endereco?: string;
    municipio?: string;
    uf?: string;
    telefone?: string;
    email?: string;
  };
  isNewContribuinte?: boolean;

  // Laudo context
  laudoId?: number;
  valorDivida?: number;
  processoAdmin?: string;
  exercicioInicio?: number;
  exercicioFim?: number;

  // Step 2: Contábil
  balancos: BalancoData[];
  dres: DreData[];

  // Step 3: DFC
  dfcs: DfcData[];

  // Step 4: Indicadores (computed - read only)

  // Step 5: Documentos
  documentos: DocumentoData[];

  // Step 6: Revisão
  metodologia?: "ROA_PLR" | "FCO_PLR";
  bensEssenciais?: number;
}

export interface BalancoData {
  exercicio: number;
  ativoCirculante: number;
  ativoNaoCirculante: number;
  ativoTotal: number;
  passivoCirculante: number;
  passivoNaoCirculante: number;
  passivoTotal: number;
  patrimonioLiquido: number;
  caixaEquivalentes?: number;
  estoques?: number;
  contasReceber?: number;
  imobilizado?: number;
  intangivel?: number;
  contasPagar?: number;
  emprestimos?: number;
}

export interface DreData {
  exercicio: number;
  receitaBruta: number;
  deducoes: number;
  receitaLiquida: number;
  custosMercadorias: number;
  lucroBruto: number;
  despesasOperacionais: number;
  despesasAdministrativas?: number;
  despesasVendas?: number;
  resultadoFinanceiro?: number;
  resultadoOperacional: number;
  resultadoAntesIR?: number;
  provisaoIRCSLL?: number;
  lucroLiquido: number;
}

export interface DfcData {
  exercicio: number;
  metodo: "DIRETO" | "INDIRETO";
  recebimentosClientes?: number;
  pagamentosFornecedores?: number;
  pagamentosSalarios?: number;
  pagamentosImpostos?: number;
  outrosRecebimentos?: number;
  outrosPagamentos?: number;
  caixaLiquidoOperacional: number;
  lucroLiquidoBase?: number;
  depreciacaoAmortizacao?: number;
  variacaoCapitalGiro?: number;
  atividadesInvestimento?: number;
  atividadesFinanciamento?: number;
  variacaoLiquidaCaixa?: number;
  saldoInicialCaixa?: number;
  saldoFinalCaixa?: number;
}

export interface DocumentoData {
  tipo: string;
  nomeArquivo: string;
  caminhoArquivo: string;
  tamanhoBytes?: number;
  mimeType?: string;
}

const INITIAL_DATA: WizardData = {
  balancos: [],
  dres: [],
  dfcs: [],
  documentos: [],
};

export function useWizard() {
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [currentStep, setCurrentStep] = useState(0);

  const updateData = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, 5)));
  }, []);

  const reset = useCallback(() => {
    setData(INITIAL_DATA);
    setCurrentStep(0);
  }, []);

  return {
    data,
    currentStep,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    reset,
  };
}
