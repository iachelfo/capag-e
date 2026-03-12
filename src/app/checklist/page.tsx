"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { CHECKLIST_DOCUMENTOS } from "@/lib/constants";

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const total = CHECKLIST_DOCUMENTOS.length;
  const completados = Object.values(checked).filter(Boolean).length;
  const progresso = total > 0 ? (completados / total) * 100 : 0;

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Checklist de Documentos
          </h1>
          <p className="text-sm text-gray-500">
            Documentos obrigatórios conforme Art. 30 da Portaria PGFN 6.757/2022
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              Progresso
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {completados} de {total} documentos
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>
        {progresso === 100 && (
          <p className="text-sm text-green-600 mt-2 font-medium">
            Todos os documentos foram verificados!
          </p>
        )}
      </div>

      {/* Items */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        {CHECKLIST_DOCUMENTOS.map((doc) => (
          <button
            key={doc.id}
            onClick={() => toggle(doc.id)}
            className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {checked[doc.id] ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  checked[doc.id]
                    ? "text-gray-400 line-through"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {doc.label}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {doc.obrigatorio && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Obrigatório
                  </span>
                )}
                {doc.critico && (
                  <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                    <AlertTriangle className="h-3 w-3" />
                    Crítico
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium mb-1">Atenção</p>
          <p>
            A ausência do DFC pelo método direto é a causa mais frequente de
            indeferimento. A Portaria PGFN 1.457/2024 exige expressamente o
            método direto.
          </p>
        </div>
      </div>
    </div>
  );
}
