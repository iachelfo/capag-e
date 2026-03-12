"use client";

import { ArrowLeft, BookOpen, Calculator, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  CAPAG_LIMITES,
  LEGISLACAO,
  ERROS_COMUNS_INDEFERIMENTO,
  INTERPRETACAO_INDICADORES,
} from "@/lib/constants";

export default function GuiaTecnicoPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Guia Técnico CAPAG-e
          </h1>
          <p className="text-sm text-gray-500">
            Referência rápida sobre metodologias, classificação e indicadores
          </p>
        </div>
      </div>

      {/* Metodologias */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Metodologias de Cálculo
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              ROA + PLR
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Baseada no Resultado Operacional Ajustado
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 font-mono text-sm">
              <p>CAPAG-e = (ROA médio × 5) + PLR</p>
              <p className="text-gray-500 mt-1">
                ROA = média dos Resultados Operacionais
              </p>
              <p className="text-gray-500">
                PLR = Patrimônio Líquido - Bens Essenciais
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              FCO + PLR
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Baseada no Fluxo de Caixa Operacional
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 font-mono text-sm">
              <p>CAPAG-e = (FCO médio × 5) + PLR</p>
              <p className="text-gray-500 mt-1">
                FCO = média dos Fluxos de Caixa Operacionais (DFC)
              </p>
              <p className="text-gray-500">
                PLR = Patrimônio Líquido - Bens Essenciais
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Classificação */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Classificação CAPAG
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Rating
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Critério
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Desconto Máx.
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Prazo Máx.
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Fundamentação
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                Object.entries(CAPAG_LIMITES) as [
                  string,
                  (typeof CAPAG_LIMITES)[keyof typeof CAPAG_LIMITES],
                ][]
              ).map(([rating, info]) => (
                <tr
                  key={rating}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-2 px-3 font-bold">{rating}</td>
                  <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                    {info.descricao}
                  </td>
                  <td className="py-2 px-3">
                    {info.descontoMaximo > 0
                      ? `${(info.descontoMaximo * 100).toFixed(0)}%`
                      : "Sem desconto"}
                  </td>
                  <td className="py-2 px-3">{info.prazoMaximoMeses} meses</td>
                  <td className="py-2 px-3 text-xs text-gray-500">
                    {info.fundamentacao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Indicadores */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Indicadores Financeiros
        </h2>
        <div className="space-y-3">
          {Object.entries(INTERPRETACAO_INDICADORES).map(([key, ind]) => (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-800"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {ind.label}
                </p>
                <p className="text-xs text-gray-500">{ind.descricao}</p>
              </div>
              <div className="flex gap-3 text-xs">
                <code className="px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {ind.formula}
                </code>
                <span className="px-2 py-1 rounded bg-green-50 text-green-700">
                  {ind.bom}
                </span>
                <span className="px-2 py-1 rounded bg-amber-50 text-amber-700">
                  {ind.regular}
                </span>
                <span className="px-2 py-1 rounded bg-red-50 text-red-700">
                  {ind.ruim}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Erros Comuns */}
      <section className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">
            10 Erros que Levam ao Indeferimento
          </h2>
        </div>
        <ol className="space-y-2">
          {ERROS_COMUNS_INDEFERIMENTO.map((erro, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300"
            >
              <span className="font-bold text-red-600 shrink-0">
                {i + 1}.
              </span>
              {erro}
            </li>
          ))}
        </ol>
      </section>

      {/* Legislação */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Base Legal
          </h2>
        </div>
        <div className="space-y-3">
          {LEGISLACAO.map((leg) => (
            <div
              key={leg.nome}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {leg.nome}
                </p>
                <p className="text-xs text-gray-500">{leg.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
