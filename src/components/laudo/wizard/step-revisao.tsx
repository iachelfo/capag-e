"use client";

import { useState } from "react";
import type { WizardData } from "@/hooks/use-wizard";
import { CapagBadge } from "@/components/laudo/capag-badge";
import { calcularCapagE } from "@/server/capag/calculator";
import {
  classificarCapag,
  type ClassificacaoResult,
} from "@/server/capag/classification";
import { formatBRL, formatPercent, formatCpfCnpj } from "@/lib/formatters";
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface Props {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
}

interface CalcResult {
  capag: number;
  classificacao: ClassificacaoResult;
}

export function StepRevisao({ data, onUpdate }: Props) {
  const [resultado, setResultado] = useState<CalcResult | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Validation checks
  const checks = [
    {
      label: "Contribuinte informado",
      ok: !!(data.contribuinteId || data.contribuinte?.cpfCnpj),
    },
    {
      label: "Pelo menos 2 exercícios de Balanço",
      ok: data.balancos.length >= 2,
    },
    {
      label: "Pelo menos 2 exercícios de DRE",
      ok: data.dres.length >= 2,
    },
    {
      label: "DFC informada",
      ok: data.dfcs.length > 0,
    },
    {
      label: "DFC usa método direto",
      ok: data.dfcs.length > 0 && data.dfcs.every((d) => d.metodo === "DIRETO"),
      critical: true,
    },
    {
      label: "Valor da dívida informado",
      ok: (data.valorDivida ?? 0) > 0,
    },
    {
      label: "Metodologia selecionada",
      ok: !!data.metodologia,
    },
  ];

  const allPassed = checks.every((c) => c.ok);

  function calcular() {
    setErro(null);
    try {
      if (!data.metodologia) {
        setErro("Selecione uma metodologia.");
        return;
      }

      const input = {
        metodologia: data.metodologia,
        resultadosOperacionais: data.dres.map((d) => d.resultadoOperacional),
        fluxosCaixaOperacional: data.dfcs.map((d) => d.caixaLiquidoOperacional),
        patrimonioLiquido:
          data.balancos.length > 0
            ? data.balancos[data.balancos.length - 1].patrimonioLiquido
            : 0,
        bensEssenciais: data.bensEssenciais ?? 0,
      };

      const result = calcularCapagE(input);
      const classificacao = classificarCapag(
        result.valorCapagE,
        data.valorDivida ?? 0
      );

      setResultado({ capag: result.valorCapagE, classificacao });
    } catch (e: any) {
      setErro(e.message ?? "Erro no cálculo.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 mb-1">Contribuinte</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {data.contribuinte?.razaoSocial ?? "Não informado"}
          </p>
          {data.contribuinte?.cpfCnpj && (
            <p className="text-sm text-gray-500">
              {formatCpfCnpj(data.contribuinte.cpfCnpj)}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 mb-1">Dívida</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {data.valorDivida ? formatBRL(data.valorDivida) : "Não informado"}
          </p>
          {data.processoAdmin && (
            <p className="text-sm text-gray-500">
              Processo: {data.processoAdmin}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 mb-1">Exercícios</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {data.balancos.length} balanço(s), {data.dres.length} DRE(s),{" "}
            {data.dfcs.length} DFC(s)
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 mb-1">Documentos</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {data.documentos.length} arquivo(s)
          </p>
        </div>
      </div>

      {/* Validation Checklist */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Verificação
        </h3>
        <div className="space-y-2">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {c.ok ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              ) : c.critical ? (
                <XCircle className="h-4 w-4 text-red-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span
                className={
                  c.ok
                    ? "text-gray-600 dark:text-gray-400"
                    : c.critical
                      ? "text-red-600 font-medium"
                      : "text-amber-600"
                }
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology selection */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Metodologia
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => onUpdate({ metodologia: "ROA_PLR" })}
            className={`flex-1 p-3 rounded-lg border text-sm font-medium text-left transition-colors ${
              data.metodologia === "ROA_PLR"
                ? "border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <p className="font-semibold">ROA + PLR</p>
            <p className="text-xs mt-1 opacity-75">
              Resultado Operacional Ajustado + Patrimônio Líquido Realizável
            </p>
          </button>
          <button
            onClick={() => onUpdate({ metodologia: "FCO_PLR" })}
            className={`flex-1 p-3 rounded-lg border text-sm font-medium text-left transition-colors ${
              data.metodologia === "FCO_PLR"
                ? "border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <p className="font-semibold">FCO + PLR</p>
            <p className="text-xs mt-1 opacity-75">
              Fluxo de Caixa Operacional + Patrimônio Líquido Realizável
            </p>
          </button>
        </div>

        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Bens Essenciais (deduzidos do PL)
          </label>
          <input
            type="number"
            step="0.01"
            value={data.bensEssenciais ?? ""}
            onChange={(e) =>
              onUpdate({
                bensEssenciais: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
            placeholder="0.00"
            className="w-full max-w-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Calculate button */}
      <button
        onClick={calcular}
        disabled={!data.metodologia}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Calculator className="h-4 w-4" />
        Calcular CAPAG-e
      </button>

      {erro && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
          {erro}
        </div>
      )}

      {/* Result */}
      {resultado && (
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
              Resultado CAPAG-e
            </h3>
            <CapagBadge
              classificacao={resultado.classificacao.classificacao}
              size="lg"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-blue-600">Valor CAPAG-e</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatBRL(resultado.capag)}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Desconto Máximo</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatPercent(resultado.classificacao.descontoMaximo)}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Prazo Máximo</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {resultado.classificacao.prazoMaximoMeses} meses
              </p>
            </div>
          </div>

          <p className="text-sm text-blue-700 dark:text-blue-300 mt-4">
            {resultado.classificacao.descricao}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            {resultado.classificacao.fundamentacao}
          </p>
        </div>
      )}
    </div>
  );
}
