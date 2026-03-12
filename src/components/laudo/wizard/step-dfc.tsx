"use client";

import { useState } from "react";
import type { WizardData, DfcData } from "@/hooks/use-wizard";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { formatBRL } from "@/lib/formatters";

interface Props {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
}

const currentYear = new Date().getFullYear();

function emptyDfc(exercicio: number): DfcData {
  return {
    exercicio,
    metodo: "DIRETO",
    caixaLiquidoOperacional: 0,
  };
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type="number"
        step="0.01"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

export function StepDFC({ data, onUpdate }: Props) {
  function addDfc() {
    const existingYears = data.dfcs.map((d) => d.exercicio);
    const nextYear =
      existingYears.length > 0
        ? Math.min(...existingYears) - 1
        : currentYear - 1;
    onUpdate({ dfcs: [...data.dfcs, emptyDfc(nextYear)] });
  }

  function removeDfc(exercicio: number) {
    onUpdate({ dfcs: data.dfcs.filter((d) => d.exercicio !== exercicio) });
  }

  function updateDfc(exercicio: number, field: string, value: any) {
    const updated = data.dfcs.map((d) => {
      if (d.exercicio !== exercicio) return d;
      return { ...d, [field]: value };
    });
    onUpdate({ dfcs: updated });
  }

  const hasIndireto = data.dfcs.some((d) => d.metodo === "INDIRETO");

  return (
    <div className="space-y-4">
      {/* Warning about method */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium">
            DFC pelo Método Direto é OBRIGATÓRIO
          </p>
          <p className="mt-0.5">
            Portaria PGFN 1.457/2024 exige expressamente o método direto.
            O uso do método indireto é a causa mais frequente de indeferimento.
          </p>
        </div>
      </div>

      {hasIndireto && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            ATENÇÃO: Um ou mais exercícios estão usando método INDIRETO.
            Altere para DIRETO antes de prosseguir.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={addDfc}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Exercício
        </button>
      </div>

      {data.dfcs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Adicione a DFC para cada exercício.</p>
          <button
            onClick={addDfc}
            className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Adicionar primeiro exercício
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.dfcs
            .sort((a, b) => a.exercicio - b.exercicio)
            .map((d) => (
              <div
                key={d.exercicio}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Exercício {d.exercicio}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      FCO: {formatBRL(d.caixaLiquidoOperacional)}
                    </span>
                    <button
                      onClick={() => removeDfc(d.exercicio)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Method selector */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Método
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateDfc(d.exercicio, "metodo", "DIRETO")}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                        d.metodo === "DIRETO"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                      }`}
                    >
                      Direto
                    </button>
                    <button
                      onClick={() => updateDfc(d.exercicio, "metodo", "INDIRETO")}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                        d.metodo === "INDIRETO"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                      }`}
                    >
                      Indireto
                    </button>
                  </div>
                </div>

                {d.metodo === "DIRETO" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <NumberInput
                      label="Receb. Clientes"
                      value={d.recebimentosClientes ?? 0}
                      onChange={(v) => updateDfc(d.exercicio, "recebimentosClientes", v)}
                    />
                    <NumberInput
                      label="Pgto. Fornecedores"
                      value={d.pagamentosFornecedores ?? 0}
                      onChange={(v) => updateDfc(d.exercicio, "pagamentosFornecedores", v)}
                    />
                    <NumberInput
                      label="Pgto. Salários"
                      value={d.pagamentosSalarios ?? 0}
                      onChange={(v) => updateDfc(d.exercicio, "pagamentosSalarios", v)}
                    />
                    <NumberInput
                      label="Pgto. Impostos"
                      value={d.pagamentosImpostos ?? 0}
                      onChange={(v) => updateDfc(d.exercicio, "pagamentosImpostos", v)}
                    />
                    <NumberInput
                      label="Outros Recebimentos"
                      value={d.outrosRecebimentos ?? 0}
                      onChange={(v) => updateDfc(d.exercicio, "outrosRecebimentos", v)}
                    />
                    <NumberInput
                      label="Outros Pagamentos"
                      value={d.outrosPagamentos ?? 0}
                      onChange={(v) => updateDfc(d.exercicio, "outrosPagamentos", v)}
                    />
                    <NumberInput
                      label="Caixa Líq. Operacional"
                      value={d.caixaLiquidoOperacional}
                      onChange={(v) => updateDfc(d.exercicio, "caixaLiquidoOperacional", v)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <NumberInput
                      label="Lucro Líquido Base"
                      value={d.lucroLiquidoBase ?? 0}
                      onChange={(v) => updateDfc(d.exercicio, "lucroLiquidoBase", v)}
                    />
                    <NumberInput
                      label="Depreciação/Amortização"
                      value={d.depreciacaoAmortizacao ?? 0}
                      onChange={(v) => updateDfc(d.exercicio, "depreciacaoAmortizacao", v)}
                    />
                    <NumberInput
                      label="Var. Capital de Giro"
                      value={d.variacaoCapitalGiro ?? 0}
                      onChange={(v) => updateDfc(d.exercicio, "variacaoCapitalGiro", v)}
                    />
                    <NumberInput
                      label="Caixa Líq. Operacional"
                      value={d.caixaLiquidoOperacional}
                      onChange={(v) => updateDfc(d.exercicio, "caixaLiquidoOperacional", v)}
                    />
                  </div>
                )}

                {/* Investment & financing */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <NumberInput
                    label="Ativ. Investimento"
                    value={d.atividadesInvestimento ?? 0}
                    onChange={(v) => updateDfc(d.exercicio, "atividadesInvestimento", v)}
                  />
                  <NumberInput
                    label="Ativ. Financiamento"
                    value={d.atividadesFinanciamento ?? 0}
                    onChange={(v) => updateDfc(d.exercicio, "atividadesFinanciamento", v)}
                  />
                  <NumberInput
                    label="Saldo Inicial Caixa"
                    value={d.saldoInicialCaixa ?? 0}
                    onChange={(v) => updateDfc(d.exercicio, "saldoInicialCaixa", v)}
                  />
                  <NumberInput
                    label="Saldo Final Caixa"
                    value={d.saldoFinalCaixa ?? 0}
                    onChange={(v) => updateDfc(d.exercicio, "saldoFinalCaixa", v)}
                  />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
