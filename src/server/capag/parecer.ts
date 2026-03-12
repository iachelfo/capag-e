// ─── Gerador de Parecer Técnico CAPAG-e ──────────────────────
// Suporta geração por template (sem IA) e via API de IA (OpenAI/Anthropic)

import type { ClassificacaoCapag } from "./classification";
import type { IndicadoresCalculados } from "./indicators";
import { interpretarIndicador } from "./indicators";

// ─── Types ────────────────────────────────────────────────────

export interface ParecerInput {
  // Contribuinte
  razaoSocial: string;
  cpfCnpj: string;
  tipo: string;

  // Laudo
  valorDivida: number;
  metodologia: "ROA_PLR" | "FCO_PLR";
  valorCapagE: number;
  classificacao: ClassificacaoCapag;
  plr: number;
  bensEssenciais: number;

  // Indicadores do último exercício
  indicadores: Partial<IndicadoresCalculados>;
  exercicioRef: number;

  // DFC
  temDfcDireto: boolean;
  exerciciosDfc: number[];

  // Balanço
  patrimonioLiquido: number;
  ativoTotal: number;
  passivoTotal: number;
}

export interface ParecerResult {
  parecerTecnico: string;
  conclusao: "favoravel" | "desfavoravel" | "parcial";
  conclusaoTexto: string;
  recomendacoes: string;
  limitacoes: string;
  geradoPorIA: boolean;
}

// ─── Formatação auxiliar ──────────────────────────────────────

function fmtBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

function fmtPct(v: number | null): string {
  if (v === null) return "N/D";
  return `${(v * 100).toFixed(1)}%`;
}

function fmtNum(v: number | null): string {
  if (v === null) return "N/D";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

// ─── Qualificação dos indicadores ─────────────────────────────

function qualificarIndicadores(ind: Partial<IndicadoresCalculados>): string {
  const items: string[] = [];
  const mapping: { key: keyof IndicadoresCalculados; label: string; pct?: boolean }[] = [
    { key: "liquidezCorrente", label: "Liquidez Corrente" },
    { key: "liquidezSeca", label: "Liquidez Seca" },
    { key: "liquidezImediata", label: "Liquidez Imediata" },
    { key: "endividamentoGeral", label: "Endividamento Geral", pct: true },
    { key: "margemBruta", label: "Margem Bruta", pct: true },
    { key: "margemOperacional", label: "Margem Operacional", pct: true },
    { key: "margemLiquida", label: "Margem Líquida", pct: true },
    { key: "roe", label: "ROE", pct: true },
    { key: "roa", label: "ROA", pct: true },
  ];

  for (const m of mapping) {
    const val = ind[m.key];
    if (val === null || val === undefined) continue;
    const interp = interpretarIndicador(m.key, val);
    const emoji = interp === "bom" ? "✅" : interp === "regular" ? "⚠️" : "🔴";
    const formatted = m.pct ? fmtPct(val) : fmtNum(val);
    items.push(`  ${emoji} ${m.label}: ${formatted} (${interp})`);
  }

  return items.join("\n");
}

// ─── Conclusão automática ─────────────────────────────────────

function determinarConclusao(
  classificacao: ClassificacaoCapag,
  temDfcDireto: boolean
): { conclusao: "favoravel" | "desfavoravel" | "parcial"; texto: string } {
  if (!temDfcDireto) {
    return {
      conclusao: "desfavoravel",
      texto:
        "Não foi possível emitir parecer favorável por ausência de Demonstração de Fluxo de Caixa pelo método direto, conforme exigido pela Portaria PGFN 1.457/2024.",
    };
  }

  if (classificacao === "A" || classificacao === "B") {
    return {
      conclusao: "favoravel",
      texto: `O contribuinte apresenta capacidade de pagamento classificada como "${classificacao}", indicando condições favoráveis para honrar o débito tributário. Recomenda-se transação individual ou por adesão com pagamento integral, em até 60 meses.`,
    };
  }

  if (classificacao === "C") {
    return {
      conclusao: "parcial",
      texto:
        'O contribuinte apresenta capacidade de pagamento classificada como "C", com CAPAG-e inferior ao valor da dívida. A transação tributária com desconto de até 65% e prazo de até 114 meses é tecnicamente recomendada para viabilizar a regularização fiscal.',
    };
  }

  // D
  return {
    conclusao: "parcial",
    texto:
      'O contribuinte apresenta situação econômica crítica, com CAPAG-e nula ou negativa, classificação "D". Recomenda-se transação excepcional com desconto máximo de 70% e prazo de até 133 meses, como única alternativa viável de recuperação do crédito.',
  };
}

// ─── Gerador de Parecer por Template (sem IA) ─────────────────

export function gerarParecerTemplate(input: ParecerInput): ParecerResult {
  const metodoNome =
    input.metodologia === "ROA_PLR"
      ? "ROA + PLR (Resultado Operacional Ajustado + Patrimônio Líquido Realizável)"
      : "FCO + PLR (Fluxo de Caixa Operacional + Patrimônio Líquido Realizável)";

  const ratio = input.valorDivida > 0 ? input.valorCapagE / input.valorDivida : 0;

  const { conclusao, texto: conclusaoTexto } = determinarConclusao(
    input.classificacao,
    input.temDfcDireto
  );

  const indicadoresTexto = qualificarIndicadores(input.indicadores);

  const parecerTecnico = `PARECER TÉCNICO DE CAPACIDADE DE PAGAMENTO EXTRAORDINÁRIA (CAPAG-e)

1. IDENTIFICAÇÃO

Contribuinte: ${input.razaoSocial}
CPF/CNPJ: ${input.cpfCnpj}
Tipo: ${input.tipo}
Exercício de referência: ${input.exercicioRef}

2. OBJETO

O presente laudo tem por objeto a apuração da Capacidade de Pagamento Extraordinária (CAPAG-e) do contribuinte acima identificado, para fins de transação tributária junto à Procuradoria-Geral da Fazenda Nacional (PGFN), nos termos da Lei 14.375/2022 e Portaria PGFN 6.757/2022.

3. METODOLOGIA APLICADA

Metodologia: ${metodoNome}

A CAPAG-e foi calculada conforme fórmula:
  CAPAG-e = (${input.metodologia === "ROA_PLR" ? "ROA médio" : "FCO médio"} × 5) + PLR

Onde:
  PLR = Patrimônio Líquido (${fmtBRL(input.patrimonioLiquido)}) − Bens Essenciais (${fmtBRL(input.bensEssenciais)}) = ${fmtBRL(input.plr)}

4. ANÁLISE CONTÁBIL E FINANCEIRA

Ativo Total: ${fmtBRL(input.ativoTotal)}
Passivo Total: ${fmtBRL(input.passivoTotal)}
Patrimônio Líquido: ${fmtBRL(input.patrimonioLiquido)}

Indicadores Financeiros (exercício ${input.exercicioRef}):
${indicadoresTexto || "  Indicadores não disponíveis."}

5. DEMONSTRAÇÃO DE FLUXO DE CAIXA

${input.temDfcDireto ? `DFC pelo método direto apresentada para os exercícios: ${input.exerciciosDfc.join(", ")}.` : "⚠️ ATENÇÃO: DFC pelo método direto NÃO foi apresentada. A Portaria PGFN 1.457/2024 exige obrigatoriamente o método direto."}

6. RESULTADO

  Valor da CAPAG-e: ${fmtBRL(input.valorCapagE)}
  Valor da Dívida: ${fmtBRL(input.valorDivida)}
  Relação CAPAG/Dívida: ${fmtNum(ratio)}
  Classificação: ${input.classificacao}

7. FUNDAMENTAÇÃO LEGAL

- Lei 14.375/2022 — Transação tributária
- Portaria PGFN 6.757/2022 — Regulamentação da transação
- Portaria PGFN 1.457/2024 — Exigência de DFC pelo método direto
- CPC 03 (R2) — Demonstração dos Fluxos de Caixa

8. CONCLUSÃO

${conclusaoTexto}`;

  const recomendacoes = gerarRecomendacoes(input);

  const limitacoes = `Este parecer técnico foi elaborado com base exclusivamente nos documentos e informações contábeis fornecidos pelo contribuinte ou seu representante legal. O perito não realizou auditoria independente dos demonstrativos financeiros. Os valores e cálculos apresentados estão sujeitos à verificação pela PGFN. O laudo tem validade de 30 dias a partir de sua emissão, devendo ser atualizado caso haja alteração material na situação patrimonial ou financeira do contribuinte.`;

  return {
    parecerTecnico,
    conclusao,
    conclusaoTexto,
    recomendacoes,
    limitacoes,
    geradoPorIA: false,
  };
}

// ─── Recomendações automáticas ────────────────────────────────

function gerarRecomendacoes(input: ParecerInput): string {
  const recs: string[] = [];

  if (!input.temDfcDireto) {
    recs.push(
      "URGENTE: Providenciar a Demonstração de Fluxo de Caixa (DFC) pelo método direto, conforme Portaria PGFN 1.457/2024. A ausência deste documento é a principal causa de indeferimento."
    );
  }

  if (input.classificacao === "A" || input.classificacao === "B") {
    recs.push(
      "Considerar transação individual com pagamento integral em até 60 meses para obter condições mais favoráveis de regularização."
    );
  }

  if (input.classificacao === "C") {
    recs.push(
      "Avaliar transação com desconto (até 65%) e prazo estendido (até 114 meses) para viabilizar o pagamento."
    );
    recs.push(
      "Simular diferentes cenários de desconto e prazo para identificar a opção mais adequada à capacidade do contribuinte."
    );
  }

  if (input.classificacao === "D") {
    recs.push(
      "Solicitar transação excepcional com desconto máximo de 70% e prazo de até 133 meses."
    );
    recs.push(
      "Documentar detalhadamente a situação de irrecuperabilidade com base nos demonstrativos financeiros."
    );
  }

  const lc = input.indicadores.liquidezCorrente;
  if (lc !== null && lc !== undefined && lc < 1.0) {
    recs.push(
      "Atenção: liquidez corrente abaixo de 1,0 indica dificuldade para honrar obrigações de curto prazo."
    );
  }

  const eg = input.indicadores.endividamentoGeral;
  if (eg !== null && eg !== undefined && eg > 0.7) {
    recs.push(
      "Alto endividamento geral detectado. Considerar reestruturação das dívidas de curto prazo."
    );
  }

  recs.push(
    "Protocolar o laudo dentro do prazo fatal de 30 dias, conforme Art. 36 da Portaria PGFN 6.757/2022."
  );

  return recs.map((r, i) => `${i + 1}. ${r}`).join("\n\n");
}

// ─── Gerador de Parecer via IA ────────────────────────────────

export function buildAIPrompt(input: ParecerInput): string {
  const ratio = input.valorDivida > 0 ? input.valorCapagE / input.valorDivida : 0;
  const indicadoresTexto = qualificarIndicadores(input.indicadores);

  return `Você é um perito contábil especialista em transação tributária com a PGFN. Elabore um parecer técnico profissional de CAPAG-e (Capacidade de Pagamento Extraordinária) com base nos dados abaixo.

DADOS DO CONTRIBUINTE:
- Razão Social: ${input.razaoSocial}
- CPF/CNPJ: ${input.cpfCnpj}
- Tipo: ${input.tipo}

DADOS FINANCEIROS:
- Ativo Total: ${fmtBRL(input.ativoTotal)}
- Passivo Total: ${fmtBRL(input.passivoTotal)}
- Patrimônio Líquido: ${fmtBRL(input.patrimonioLiquido)}
- Bens Essenciais: ${fmtBRL(input.bensEssenciais)}
- PLR (PL - Bens Essenciais): ${fmtBRL(input.plr)}

INDICADORES (exercício ${input.exercicioRef}):
${indicadoresTexto || "Não disponíveis"}

RESULTADO CAPAG-e:
- Metodologia: ${input.metodologia === "ROA_PLR" ? "ROA + PLR" : "FCO + PLR"}
- Valor CAPAG-e: ${fmtBRL(input.valorCapagE)}
- Valor da Dívida: ${fmtBRL(input.valorDivida)}
- Relação CAPAG/Dívida: ${fmtNum(ratio)}
- Classificação: ${input.classificacao}
- DFC Método Direto: ${input.temDfcDireto ? "Sim" : "Não"}

LEGISLAÇÃO APLICÁVEL:
- Lei 14.375/2022
- Portaria PGFN 6.757/2022 (Art. 22 — classificação)
- Portaria PGFN 1.457/2024 (exigência de DFC método direto)
- CPC 03 (R2) — DFC

INSTRUÇÕES:
1. Estruture o parecer com seções: Identificação, Objeto, Metodologia, Análise Financeira, DFC, Resultado, Fundamentação Legal, Conclusão
2. Inclua análise técnica dos indicadores
3. Fundamente juridicamente a classificação CAPAG
4. Emita conclusão clara (favorável, desfavorável ou parcial)
5. Use linguagem técnica formal de perito contábil
6. Referencie os artigos relevantes das portarias
7. Máximo 2000 palavras`;
}

export async function gerarParecerIA(
  input: ParecerInput
): Promise<ParecerResult | null> {
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return null;

  const prompt = buildAIPrompt(input);

  try {
    if (process.env.ANTHROPIC_API_KEY) {
      return await callAnthropic(prompt, input, process.env.ANTHROPIC_API_KEY);
    }
    if (process.env.OPENAI_API_KEY) {
      return await callOpenAI(prompt, input, process.env.OPENAI_API_KEY);
    }
    return null;
  } catch (err) {
    console.warn("Erro na geração via IA:", (err as Error).message?.slice(0, 100));
    return null;
  }
}

async function callAnthropic(
  prompt: string,
  input: ParecerInput,
  apiKey: string
): Promise<ParecerResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";
  return parseAIResponse(text, input);
}

async function callOpenAI(
  prompt: string,
  input: ParecerInput,
  apiKey: string
): Promise<ParecerResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Você é um perito contábil brasileiro especialista em transação tributária com a PGFN.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return parseAIResponse(text, input);
}

function parseAIResponse(text: string, input: ParecerInput): ParecerResult {
  const { conclusao, texto: conclusaoTexto } = determinarConclusao(
    input.classificacao,
    input.temDfcDireto
  );

  return {
    parecerTecnico: text,
    conclusao,
    conclusaoTexto,
    recomendacoes: gerarRecomendacoes(input),
    limitacoes:
      "Este parecer técnico foi elaborado com auxílio de inteligência artificial e revisado tecnicamente. Os valores e cálculos apresentados estão sujeitos à verificação pela PGFN. O laudo tem validade de 30 dias.",
    geradoPorIA: true,
  };
}
