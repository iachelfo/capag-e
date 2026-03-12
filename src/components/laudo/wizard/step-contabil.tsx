"use client";

import { useState } from "react";
import type { WizardData, BalancoData, DreData } from "@/hooks/use-wizard";
import { Plus, Trash2 } from "lucide-react";
import { formatBRL } from "@/lib/formatters";

interface Props {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
}

const currentYear = new Date().getFullYear();

function emptyBalanco(exercicio: number): BalancoData {
  return {
    exercicio,
    ativoCirculante: 0,
    ativoNaoCirculante: 0,
    ativoTotal: 0,
    passivoCirculante: 0,
    passivoNaoCirculante: 0,
    passivoTotal: 0,
    patrimonioLiquido: 0,
  };
}

function emptyDre(exercicio: number): DreData {
  return {
    exercicio,
    receitaBruta: 0,
    deducoes: 0,
    receitaLiquida: 0,
    custosMercadorias: 0,
    lucroBruto: 0,
    despesasOperacionais: 0,
    resultadoOperacional: 0,
    lucroLiquido: 0,
  };
}

function NumberInput({
  label,
  value,
  onChange,
  highlight,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  highlight?: boolean;
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
        className={`w-full px-2.5 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          highlight
            ? "border-blue-300 dark:border-blue-700"
            : "border-gray-200 dark:border-gray-700"
        }`}
      />
    </div>
  );
}

export function StepContabil({ data, onUpdate }: Props) {
  const [tab, setTab] = useState<"balanco" | "dre">("balanco");

  // Add exercise
  function addExercicio() {
    const existingYears = data.balancos.map((b) => b.exercicio);
    const nextYear =
      existingYears.length > 0
        ? Math.min(...existingYears) - 1
        : currentYear - 1;

    onUpdate({
      balancos: [...data.balancos, emptyBalanco(nextYear)],
      dres: [...data.dres, emptyDre(nextYear)],
    });
  }

  function removeExercicio(exercicio: number) {
    onUpdate({
      balancos: data.balancos.filter((b) => b.exercicio !== exercicio),
      dres: data.dres.filter((d) => d.exercicio !== exercicio),
    });
  }

  function updateBalanco(exercicio: number, field: string, value: number) {
    const updated = data.balancos.map((b) => {
      if (b.exercicio !== exercicio) return b;
      const newB = { ...b, [field]: value };
      // Auto-calculate totals
      newB.ativoTotal = newB.ativoCirculante + newB.ativoNaoCirculante;
      newB.passivoTotal = newB.passivoCirculante + newB.passivoNaoCirculante;
      return newB;
    });
    onUpdate({ balancos: updated });
  }

  function updateDre(exercicio: number, field: string, value: number) {
    const updated = data.dres.map((d) => {
      if (d.exercicio !== exercicio) return d;
      const newD = { ...d, [field]: value };
      // Auto-calculate derived fields
      newD.receitaLiquida = newD.receitaBruta - newD.deducoes;
      newD.lucroBruto = newD.receitaLiquida - newD.custosMercadorias;
      newD.resultadoOperacional = newD.lucroBruto - newD.despesasOperacionais;
      return newD;
    });
    onUpdate({ dres: updated });
  }

  const exercicios = [
    ...new Set([
      ...data.balancos.map((b) => b.exercicio),
      ...data.dres.map((d) => d.exercicio),
    ]),
  ].sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setTab("balanco")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === "balanco"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Balanço Patrimonial
          </button>
          <button
            onClick={() => setTab("dre")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === "dre"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            DRE
          </button>
        </div>
        <button
          onClick={addExercicio}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Exercício
        </button>
      </div>

      {exercicios.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Adicione pelo menos 2 exercícios para o cálculo CAPAG-e.</p>
          <button
            onClick={addExercicio}
            className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Adicionar primeiro exercício
          </button>
        </div>
      ) : tab === "balanco" ? (
        <div className="space-y-6">
          {data.balancos
            .sort((a, b) => a.exercicio - b.exercicio)
            .map((b) => (
              <div
                key={b.exercicio}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Exercício {b.exercicio}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      AT: {formatBRL(b.ativoTotal)}
                    </span>
                    <button
                      onClick={() => removeExercicio(b.exercicio)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <NumberInput
                    label="Ativo Circulante"
                    value={b.ativoCirculante}
                    onChange={(v) => updateBalanco(b.exercicio, "ativoCirculante", v)}
                  />
                  <NumberInput
                    label="Ativo Não Circulante"
                    value={b.ativoNaoCirculante}
                    onChange={(v) => updateBalanco(b.exercicio, "ativoNaoCirculante", v)}
                  />
                  <NumberInput
                    label="Ativo Total"
                    value={b.ativoTotal}
                    onChange={(v) => updateBalanco(b.exercicio, "ativoTotal", v)}
                    highlight
                  />
                  <NumberInput
                    label="Passivo Circulante"
                    value={b.passivoCirculante}
                    onChange={(v) => updateBalanco(b.exercicio, "passivoCirculante", v)}
                  />
                  <NumberInput
                    label="Passivo Não Circulante"
                    value={b.passivoNaoCirculante}
                    onChange={(v) => updateBalanco(b.exercicio, "passivoNaoCirculante", v)}
                  />
                  <NumberInput
                    label="Passivo Total"
                    value={b.passivoTotal}
                    onChange={(v) => updateBalanco(b.exercicio, "passivoTotal", v)}
                    highlight
                  />
                  <NumberInput
                    label="Patrimônio Líquido"
                    value={b.patrimonioLiquido}
                    onChange={(v) => updateBalanco(b.exercicio, "patrimonioLiquido", v)}
                    highlight
                  />
                  <NumberInput
                    label="Caixa/Equivalentes"
                    value={b.caixaEquivalentes ?? 0}
                    onChange={(v) => updateBalanco(b.exercicio, "caixaEquivalentes", v)}
                  />
                  <NumberInput
                    label="Estoques"
                    value={b.estoques ?? 0}
                    onChange={(v) => updateBalanco(b.exercicio, "estoques", v)}
                  />
                  <NumberInput
                    label="Contas a Receber"
                    value={b.contasReceber ?? 0}
                    onChange={(v) => updateBalanco(b.exercicio, "contasReceber", v)}
                  />
                  <NumberInput
                    label="Imobilizado"
                    value={b.imobilizado ?? 0}
                    onChange={(v) => updateBalanco(b.exercicio, "imobilizado", v)}
                  />
                  <NumberInput
                    label="Empréstimos"
                    value={b.emprestimos ?? 0}
                    onChange={(v) => updateBalanco(b.exercicio, "emprestimos", v)}
                  />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-6">
          {data.dres
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
                  <span className="text-xs text-gray-500">
                    LL: {formatBRL(d.lucroLiquido)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <NumberInput
                    label="Receita Bruta"
                    value={d.receitaBruta}
                    onChange={(v) => updateDre(d.exercicio, "receitaBruta", v)}
                  />
                  <NumberInput
                    label="Deduções"
                    value={d.deducoes}
                    onChange={(v) => updateDre(d.exercicio, "deducoes", v)}
                  />
                  <NumberInput
                    label="Receita Líquida"
                    value={d.receitaLiquida}
                    onChange={(v) => updateDre(d.exercicio, "receitaLiquida", v)}
                    highlight
                  />
                  <NumberInput
                    label="Custos Mercadorias"
                    value={d.custosMercadorias}
                    onChange={(v) => updateDre(d.exercicio, "custosMercadorias", v)}
                  />
                  <NumberInput
                    label="Lucro Bruto"
                    value={d.lucroBruto}
                    onChange={(v) => updateDre(d.exercicio, "lucroBruto", v)}
                    highlight
                  />
                  <NumberInput
                    label="Despesas Operacionais"
                    value={d.despesasOperacionais}
                    onChange={(v) => updateDre(d.exercicio, "despesasOperacionais", v)}
                  />
                  <NumberInput
                    label="Resultado Operacional"
                    value={d.resultadoOperacional}
                    onChange={(v) => updateDre(d.exercicio, "resultadoOperacional", v)}
                    highlight
                  />
                  <NumberInput
                    label="Resultado Financeiro"
                    value={d.resultadoFinanceiro ?? 0}
                    onChange={(v) => updateDre(d.exercicio, "resultadoFinanceiro", v)}
                  />
                  <NumberInput
                    label="Provisão IR/CSLL"
                    value={d.provisaoIRCSLL ?? 0}
                    onChange={(v) => updateDre(d.exercicio, "provisaoIRCSLL", v)}
                  />
                  <NumberInput
                    label="Lucro Líquido"
                    value={d.lucroLiquido}
                    onChange={(v) => updateDre(d.exercicio, "lucroLiquido", v)}
                    highlight
                  />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
