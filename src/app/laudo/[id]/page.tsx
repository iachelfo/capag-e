"use client";

import { use } from "react";
import { trpc } from "@/server/trpc/client";
import { CapagBadge } from "@/components/laudo/capag-badge";
import { STATUS_LAUDO } from "@/lib/constants";
import { formatBRL, formatCpfCnpj, formatDate } from "@/lib/formatters";
import { useDemoMode } from "@/hooks/use-demo-fallback";
import { DEMO_LAUDO_DETAIL } from "@/lib/demo-data";
import Link from "next/link";
import { ArrowLeft, FileDown, Edit, Calculator, Info } from "lucide-react";

export default function LaudoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const laudoId = parseInt(id);
  const demoMode = useDemoMode();

  const laudoLive = trpc.laudo.getById.useQuery(
    { id: laudoId },
    { enabled: !demoMode }
  );

  // In demo mode, use pre-computed data for laudo 1
  const demoData =
    DEMO_LAUDO_DETAIL[laudoId as keyof typeof DEMO_LAUDO_DETAIL] ?? null;

  const isLoading = demoMode ? false : laudoLive.isLoading;
  const laudoData = demoMode ? demoData : laudoLive.data;
  const laudoError = demoMode ? (demoData ? null : "not found") : laudoLive.error;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando laudo...</p>
      </div>
    );
  }

  if (laudoError || !laudoData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500">Laudo não encontrado.</p>
        {demoMode && (
          <p className="text-sm text-gray-500">
            No modo demonstração, apenas o laudo #1 está disponível para
            visualização detalhada.
          </p>
        )}
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const l = laudoData as any;
  const statusInfo = STATUS_LAUDO[l.status as keyof typeof STATUS_LAUDO];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Laudo #{l.id}
            </h1>
            <p className="text-sm text-gray-500">
              {l.contribuinte.razaoSocial} &middot;{" "}
              {formatCpfCnpj(l.contribuinte.cpfCnpj)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CapagBadge
            classificacao={l.classificacaoCapag as "A" | "B" | "C" | "D" | null}
            size="md"
          />
          <span
            className={`px-2.5 py-1 rounded text-sm font-medium ${statusInfo?.color ?? "bg-gray-100 text-gray-700"}`}
          >
            {statusInfo?.label ?? l.status}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="text-sm text-gray-500">CAPAG-e</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {l.valorCapagE != null ? formatBRL(l.valorCapagE) : "N/D"}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="text-sm text-gray-500">Dívida</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {l.valorDivida != null ? formatBRL(l.valorDivida) : "N/D"}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="text-sm text-gray-500">Metodologia</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {l.metodologia?.replace("_", "+") ?? "N/D"}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="text-sm text-gray-500">Exercícios</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {l.exercicioInicio && l.exercicioFim
              ? `${l.exercicioInicio}-${l.exercicioFim}`
              : `${l.balancos.length} exercício(s)`}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Calculator className="h-4 w-4" />
          Calcular CAPAG
        </button>
        <Link
          href={`/laudo/${l.id}/pdf`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <FileDown className="h-4 w-4" />
          Gerar PDF
        </Link>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Edit className="h-4 w-4" />
          Editar
        </button>
      </div>

      {/* Parecer Técnico */}
      {l.parecerTecnico && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            Parecer Técnico
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {l.parecerTecnico}
          </p>
        </div>
      )}

      {/* Data Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Balanços */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            Balanço Patrimonial ({l.balancos.length} exercícios)
          </h2>
          {l.balancos.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum balanço cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {l.balancos.map((b: any) => (
                <div
                  key={b.id}
                  className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2"
                >
                  <span className="font-medium">{b.exercicio}</span>
                  <span className="text-gray-500">
                    AT: {formatBRL(b.ativoTotal)} | PL:{" "}
                    {formatBRL(b.patrimonioLiquido)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DREs */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            DRE ({l.dres.length} exercícios)
          </h2>
          {l.dres.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma DRE cadastrada.</p>
          ) : (
            <div className="space-y-2">
              {l.dres.map((d: any) => (
                <div
                  key={d.id}
                  className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2"
                >
                  <span className="font-medium">{d.exercicio}</span>
                  <span className="text-gray-500">
                    RL: {formatBRL(d.receitaLiquida)} | LL:{" "}
                    {formatBRL(d.lucroLiquido)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-400 flex gap-4">
        <span>Criado em: {formatDate(l.createdAt)}</span>
        <span>Atualizado em: {formatDate(l.updatedAt)}</span>
        {l.dataEmissao && <span>Emissão: {formatDate(l.dataEmissao)}</span>}
      </div>
    </div>
  );
}
