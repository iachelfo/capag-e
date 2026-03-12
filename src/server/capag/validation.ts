// ─── Validações de Negócio CAPAG-e ─────────────────────────────

export interface ValidacaoResult {
  valido: boolean;
  erros: string[];
  alertas: string[];
}

export interface DadosLaudo {
  balancos: { exercicio: number }[];
  dres: { exercicio: number }[];
  dfcs: { exercicio: number; metodo: string }[];
  valorDivida: number | null;
  metodologia: string | null;
  valorCapagE: number | null;
  parecerTecnico: string | null;
  dataProtocolo?: Date;
}

/**
 * Valida os dados do laudo antes da finalização
 */
export function validarLaudo(dados: DadosLaudo): ValidacaoResult {
  const erros: string[] = [];
  const alertas: string[] = [];

  // Balanço Patrimonial - mínimo 2 exercícios
  if (dados.balancos.length < 2) {
    erros.push(
      `São necessários pelo menos 2 exercícios de Balanço Patrimonial. Encontrados: ${dados.balancos.length}`
    );
  }

  // DRE - mínimo 2 exercícios
  if (dados.dres.length < 2) {
    erros.push(
      `São necessários pelo menos 2 exercícios de DRE. Encontrados: ${dados.dres.length}`
    );
  }

  // DFC obrigatório (Portaria 1.457/2024)
  if (dados.dfcs.length === 0) {
    erros.push(
      "DFC (Demonstração de Fluxo de Caixa) é OBRIGATÓRIA desde a Portaria PGFN 1.457/2024."
    );
  }

  // DFC deve ser pelo método direto
  const dfcIndireto = dados.dfcs.filter((d) => d.metodo === "INDIRETO");
  if (dfcIndireto.length > 0) {
    erros.push(
      "ATENÇÃO: DFC pelo método INDIRETO causa INDEFERIMENTO. Utilize o método DIRETO."
    );
  }

  // Valor da dívida
  if (!dados.valorDivida || dados.valorDivida <= 0) {
    erros.push("O valor da dívida deve ser informado para o cálculo da CAPAG-e.");
  }

  // Metodologia
  if (!dados.metodologia) {
    erros.push("A metodologia de cálculo (ROA+PLR ou FCO+PLR) deve ser selecionada.");
  }

  // Valor numérico da CAPAG-e
  if (dados.valorCapagE === null || dados.valorCapagE === undefined) {
    erros.push(
      "O valor numérico da CAPAG-e pretendida é OBRIGATÓRIO no laudo técnico."
    );
  }

  // Parecer técnico
  if (!dados.parecerTecnico || dados.parecerTecnico.trim().length < 50) {
    alertas.push(
      "O parecer técnico deve ser detalhado e fundamentado. Considere utilizar a IA para auxiliar na geração."
    );
  }

  // Prazo fatal de 30 dias
  if (dados.dataProtocolo) {
    const hoje = new Date();
    const diasRestantes = Math.ceil(
      (dados.dataProtocolo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasRestantes <= 0) {
      erros.push("PRAZO FATAL EXPIRADO! O prazo de 30 dias para protocolo já venceu.");
    } else if (diasRestantes <= 5) {
      alertas.push(
        `ATENÇÃO: Restam apenas ${diasRestantes} dia(s) para o prazo fatal de protocolo!`
      );
    } else if (diasRestantes <= 10) {
      alertas.push(
        `Restam ${diasRestantes} dias para o prazo fatal de protocolo.`
      );
    }
  }

  // Verificar se exercícios são consecutivos
  const exercicios = [...new Set([
    ...dados.balancos.map((b) => b.exercicio),
    ...dados.dres.map((d) => d.exercicio),
  ])].sort();

  if (exercicios.length >= 2) {
    for (let i = 1; i < exercicios.length; i++) {
      if (exercicios[i] - exercicios[i - 1] > 1) {
        alertas.push(
          `Há lacuna nos exercícios: ${exercicios[i - 1]} e ${exercicios[i]}. Verifique se todos os exercícios estão preenchidos.`
        );
      }
    }
  }

  return {
    valido: erros.length === 0,
    erros,
    alertas,
  };
}
