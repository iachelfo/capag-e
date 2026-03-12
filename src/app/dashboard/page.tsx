"use client";

import { trpc } from "@/server/trpc/client";
import { CapagBadge } from "@/components/laudo/capag-badge";
import { STATUS_LAUDO } from "@/lib/constants";
import { formatBRL, formatDate, formatCpfCnpj } from "@/lib/formatters";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const stats = trpc.laudo.getStats.useQuery();
  const laudos = trpc.laudo.list.useQuery({ take: 10 });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visão geral dos laudos CAPAG-e
          </p>
        </div>
        <Link
          href="/laudo/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Laudo
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de Laudos"
          value={stats.data?.total ?? 0}
          icon={FileText}
          color="text-gray-600"
        />
        <StatCard
          label="Rascunhos"
          value={stats.data?.porStatus.rascunho ?? 0}
          icon={Clock}
          color="text-gray-500"
        />
        <StatCard
          label="Em Análise"
          value={stats.data?.porStatus.emAnalise ?? 0}
          icon={AlertCircle}
          color="text-blue-600"
        />
        <StatCard
          label="Finalizados"
          value={stats.data?.porStatus.finalizado ?? 0}
          icon={CheckCircle}
          color="text-green-600"
        />
      </div>

      {/* CAPAG Classification Stats */}
      <div className="grid grid-cols-4 gap-4">
        {(["A", "B", "C", "D"] as const).map((cls) => {
          const count = stats.data?.porClassificacao[cls] ?? 0;
          const colors = {
            A: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
            B: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
            C: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
            D: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
          };
          return (
            <div
              key={cls}
              className={`p-4 rounded-lg border ${colors[cls]} text-center`}
            >
              <CapagBadge classificacao={cls} size="sm" />
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Laudos List */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Laudos Recentes
          </h2>
        </div>
        {laudos.isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : !laudos.data?.items.length ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum laudo encontrado.</p>
            <Link
              href="/laudo/novo"
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Criar primeiro laudo
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {laudos.data.items.map((laudo: any) => {
              const statusInfo =
                STATUS_LAUDO[laudo.status as keyof typeof STATUS_LAUDO];
              return (
                <Link
                  key={laudo.id}
                  href={`/laudo/${laudo.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <CapagBadge
                      classificacao={
                        laudo.classificacaoCapag as
                          | "A"
                          | "B"
                          | "C"
                          | "D"
                          | null
                      }
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {laudo.contribuinte.razaoSocial}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCpfCnpj(laudo.contribuinte.cpfCnpj)} &middot;{" "}
                        {formatDate(laudo.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {laudo.valorCapagE != null && (
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatBRL(laudo.valorCapagE)}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo?.color ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {statusInfo?.label ?? laudo.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}
