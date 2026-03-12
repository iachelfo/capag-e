"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/server/trpc/client";
import { DEMO_LAUDO_DETAIL } from "@/lib/demo-data";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const METODOLOGIAS = [
  { value: "ROA_PLR", label: "ROA + PLR" },
  { value: "FCO_PLR", label: "FCO + PLR" },
] as const;

const STATUS_OPTIONS = [
  { value: "rascunho", label: "Rascunho" },
  { value: "em_analise", label: "Em Análise" },
  { value: "finalizado", label: "Finalizado" },
] as const;

const CONCLUSAO_OPTIONS = [
  { value: "", label: "— Selecione —" },
  { value: "favoravel", label: "Favorável" },
  { value: "parcial", label: "Parcial" },
  { value: "desfavoravel", label: "Desfavorável" },
] as const;

export default function EditarLaudoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const laudoId = parseInt(id);
  const router = useRouter();

  const laudoQuery = trpc.laudo.getById.useQuery({ id: laudoId });
  const updateMutation = trpc.laudo.update.useMutation();

  // Fall back to demo data if query fails
  const demoData =
    DEMO_LAUDO_DETAIL[laudoId as keyof typeof DEMO_LAUDO_DETAIL] ?? null;
  const laudo = laudoQuery.data ?? (laudoQuery.isError ? demoData : null);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  // Initialize form from laudo data once loaded
  if (laudo && !form) {
    const l = laudo as Record<string, unknown>;
    setForm({
      status: l.status ?? "rascunho",
      valorDivida: l.valorDivida ?? "",
      metodologia: l.metodologia ?? "",
      bensEssenciais: l.bensEssenciais ?? "",
      parecerTecnico: l.parecerTecnico ?? "",
      conclusao: l.conclusao ?? "",
      conclusaoTexto: l.conclusaoTexto ?? "",
      limitacoes: l.limitacoes ?? "",
      recomendacoes: l.recomendacoes ?? "",
    });
  }

  if (laudoQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando laudo...</p>
      </div>
    );
  }

  if (!laudo || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500">Laudo não encontrado.</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const l = laudo as Record<string, unknown>;
  const contribuinte = l.contribuinte as Record<string, unknown>;

  function updateField(field: string, value: unknown) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { id: laudoId };

      // Only send changed fields
      if (form.status !== l.status) payload.status = form.status;
      if (form.metodologia && form.metodologia !== l.metodologia)
        payload.metodologia = form.metodologia;
      if (form.parecerTecnico !== l.parecerTecnico)
        payload.parecerTecnico = form.parecerTecnico;
      if (form.conclusao !== l.conclusao)
        payload.conclusao = form.conclusao || undefined;
      if (form.conclusaoTexto !== l.conclusaoTexto)
        payload.conclusaoTexto = form.conclusaoTexto;
      if (form.limitacoes !== l.limitacoes)
        payload.limitacoes = form.limitacoes;
      if (form.recomendacoes !== l.recomendacoes)
        payload.recomendacoes = form.recomendacoes;

      const divida = Number(form.valorDivida);
      if (!isNaN(divida) && divida !== l.valorDivida) payload.valorDivida = divida;

      const bens = Number(form.bensEssenciais);
      if (!isNaN(bens) && bens !== l.bensEssenciais) payload.bensEssenciais = bens;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateMutation.mutateAsync(payload as any);
      toast.success("Laudo atualizado com sucesso!");
      router.push(`/laudo/${laudoId}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar.";
      toast.error(msg);
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/laudo/${laudoId}`}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Editar Laudo #{laudoId}
          </h1>
          <p className="text-sm text-gray-500">
            {String(contribuinte.razaoSocial)}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Status & Metadados */}
        <Section title="Status e Metadados">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Status">
              <select
                value={String(form.status)}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Metodologia">
              <select
                value={String(form.metodologia)}
                onChange={(e) => updateField("metodologia", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">— Selecione —</option>
                {METODOLOGIAS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Valor da Dívida (R$)">
              <input
                type="number"
                value={String(form.valorDivida)}
                onChange={(e) => updateField("valorDivida", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </Field>
            <Field label="Bens Essenciais (R$)">
              <input
                type="number"
                value={String(form.bensEssenciais)}
                onChange={(e) => updateField("bensEssenciais", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </Field>
          </div>
        </Section>

        {/* Parecer Técnico */}
        <Section title="Parecer Técnico">
          <Field label="Parecer">
            <textarea
              rows={5}
              value={String(form.parecerTecnico)}
              onChange={(e) => updateField("parecerTecnico", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva o parecer técnico..."
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Conclusão">
              <select
                value={String(form.conclusao)}
                onChange={(e) => updateField("conclusao", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CONCLUSAO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Texto da Conclusão">
            <textarea
              rows={3}
              value={String(form.conclusaoTexto)}
              onChange={(e) => updateField("conclusaoTexto", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Texto detalhado da conclusão..."
            />
          </Field>
        </Section>

        {/* Limitações e Recomendações */}
        <Section title="Limitações e Recomendações">
          <Field label="Limitações">
            <textarea
              rows={3}
              value={String(form.limitacoes)}
              onChange={(e) => updateField("limitacoes", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Limitações da análise..."
            />
          </Field>
          <Field label="Recomendações">
            <textarea
              rows={3}
              value={String(form.recomendacoes)}
              onChange={(e) => updateField("recomendacoes", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Recomendações técnicas..."
            />
          </Field>
        </Section>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
        <Link
          href={`/laudo/${laudoId}`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
    </div>
  );
}
