"use client";

import { useState } from "react";
import { Calculator, ArrowLeft, TrendingDown, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { CAPAG_LIMITES, CAPAG_CORES } from "@/lib/constants";
import { formatBRL, formatPercent } from "@/lib/formatters";
import type { ClassificacaoCapag } from "@/server/capag/classification";

interface SimulacaoResultado {
  classificacao: ClassificacaoCapag;
  valorDivida: number;
  descontoMaximo: number;
  valorComDesconto: number;
  economia: number;
  prazoMaximoMeses: number;
  parcelaMensal: number;
}

function simular(
  valorDivida: number,
  classificacao: ClassificacaoCapag
): SimulacaoResultado {
  const limites = CAPAG_LIMITES[classificacao];
  const economia = valorDivida * limites.descontoMaximo;
  const valorComDesconto = valorDivida - economia;
  const parcelaMensal =
    limites.prazoMaximoMeses > 0
      ? valorComDesconto / limites.prazoMaximoMeses
      : valorComDesconto;

  return {
    classificacao,
    valorDivida,
    descontoMaximo: limites.descontoMaximo,
    valorComDesconto,
    economia,
    prazoMaximoMeses: limites.prazoMaximoMeses,
    parcelaMensal,
  };
}

export default function SimuladorPage() {
  const [valorDivida, setValorDivida] = useState("");
  const [resultado, setResultado] = useState<SimulacaoResultado[] | null>(null);

  function handleSimular() {
    const valor = parseFloat(valorDivida.replace(/\D/g, "")) / 100;
    if (!valor || valor <= 0) return;

    const resultados: SimulacaoResultado[] = (
      ["A", "B", "C", "D"] as ClassificacaoCapag[]
    ).map((c) => simular(valor, c));

    setResultado(resultados);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Simulador de Transação
          </h1>
          <p className="text-sm text-gray-500">
            Compare descontos e prazos por classificação CAPAG
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Valor da Dívida (R$)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={valorDivida}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              const num = parseInt(raw || "0");
              setValorDivida(
                (num / 100).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })
              );
            }}
            placeholder="0,00"
            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSimular}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Calculator className="h-4 w-4" />
            Simular
          </button>
        </div>
      </div>

      {/* Results */}
      {resultado && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resultado.map((r) => {
            const cores = CAPAG_CORES[r.classificacao];
            return (
              <div
                key={r.classificacao}
                className={`rounded-xl border p-5 space-y-4 ${cores.border} ${cores.bg} bg-opacity-30`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-2xl font-bold ${cores.text}`}
                  >
                    {r.classificacao}
                  </span>
                  <span className="text-xs text-gray-500">
                    {CAPAG_LIMITES[r.classificacao].fundamentacao}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Desconto:{" "}
                      <strong className={cores.text}>
                        {formatPercent(r.descontoMaximo)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Valor:{" "}
                      <strong>{formatBRL(r.valorComDesconto)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Prazo:{" "}
                      <strong>{r.prazoMaximoMeses} meses</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500">Parcela mínima</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatBRL(r.parcelaMensal)}
                  </p>
                  {r.economia > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Economia: {formatBRL(r.economia)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
          Sobre a Simulação
        </h2>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li>
            Os valores são estimativas baseadas nos limites máximos de desconto
            e prazo previstos na Portaria PGFN 6.757/2022.
          </li>
          <li>
            A classificação CAPAG é determinada pela relação entre a
            CAPAG-e calculada e o valor da dívida.
          </li>
          <li>
            A parcela mínima é calculada dividindo o valor com desconto pelo
            prazo máximo. O valor real pode variar conforme a modalidade.
          </li>
        </ul>
      </div>
    </div>
  );
}
