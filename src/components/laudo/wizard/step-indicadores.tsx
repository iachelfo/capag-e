"use client";

import type { WizardData } from "@/hooks/use-wizard";
import { calcularIndicadores, interpretarIndicador } from "@/server/capag/indicators";
import { INTERPRETACAO_INDICADORES } from "@/lib/constants";
import { formatPercent } from "@/lib/formatters";
import { BarChart3, Info } from "lucide-react";
import type { BalancoPatrimonial, DRE } from "@/generated/prisma/client";

interface Props {
  data: WizardData;
}

const STATUS_COLORS = {
  bom: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  regular: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  ruim: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  indisponivel: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

const STATUS_LABELS = {
  bom: "Bom",
  regular: "Regular",
  ruim: "Ruim",
  indisponivel: "N/D",
};

export function StepIndicadores({ data }: Props) {
  if (data.balancos.length === 0 || data.dres.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Preencha o Balanço Patrimonial e a DRE primeiro.</p>
        <p className="text-sm mt-1">
          Os indicadores serão calculados automaticamente.
        </p>
      </div>
    );
  }

  // Calculate indicators for each exercise
  const exercicios = data.balancos
    .map((b) => b.exercicio)
    .filter((ex) => data.dres.some((d) => d.exercicio === ex))
    .sort((a, b) => a - b);

  const indicadoresPorExercicio = exercicios.map((ex) => {
    const balanco = data.balancos.find((b) => b.exercicio === ex)!;
    const dre = data.dres.find((d) => d.exercicio === ex)!;
    const dreIdx = exercicios.indexOf(ex);
    const dreAnterior =
      dreIdx > 0
        ? data.dres.find((d) => d.exercicio === exercicios[dreIdx - 1])
        : undefined;

    // Cast to Prisma types (the calculator expects Prisma model types)
    const indicadores = calcularIndicadores(
      balanco as unknown as BalancoPatrimonial,
      dre as unknown as DRE,
      dreAnterior as unknown as DRE | undefined
    );

    return { exercicio: ex, indicadores };
  });

  const indicadorKeys = Object.keys(INTERPRETACAO_INDICADORES) as Array<
    keyof typeof INTERPRETACAO_INDICADORES
  >;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Info className="h-4 w-4" />
        Indicadores calculados automaticamente a partir do Balanço e DRE.
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 font-medium text-gray-500">
                Indicador
              </th>
              {exercicios.map((ex) => (
                <th
                  key={ex}
                  className="text-center py-2 px-3 font-medium text-gray-500"
                >
                  {ex}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {indicadorKeys.map((key) => {
              const info = INTERPRETACAO_INDICADORES[key];
              return (
                <tr
                  key={key}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-2 px-3">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {info.label}
                    </p>
                    <p className="text-xs text-gray-400">{info.formula}</p>
                  </td>
                  {indicadoresPorExercicio.map(({ exercicio, indicadores }) => {
                    const valor =
                      indicadores[key as keyof typeof indicadores] ?? null;
                    const status = interpretarIndicador(key, valor as number | null);
                    return (
                      <td key={exercicio} className="text-center py-2 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status]}`}
                        >
                          {valor !== null
                            ? typeof valor === "number"
                              ? formatPercent(valor)
                              : "N/D"
                            : "N/D"}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {STATUS_LABELS[status]}
                        </p>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
