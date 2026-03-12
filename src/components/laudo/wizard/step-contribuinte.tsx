"use client";

import { useState } from "react";
import { trpc } from "@/server/trpc/client";
import type { WizardData } from "@/hooks/use-wizard";
import { TIPOS_CONTRIBUINTE, REGIMES_TRIBUTARIOS } from "@/lib/constants";
import { maskCpfCnpj } from "@/lib/formatters";
import { Search, UserPlus, Building2 } from "lucide-react";

interface Props {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
}

export function StepContribuinte({ data, onUpdate }: Props) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(data.isNewContribuinte ?? false);

  const contribuintes = trpc.contribuinte.list.useQuery(
    { search, take: 5 },
    { enabled: search.length >= 3 }
  );

  const form = data.contribuinte ?? {
    cpfCnpj: "",
    razaoSocial: "",
    tipo: "PJ" as string,
  };

  function selectExisting(c: any) {
    onUpdate({
      contribuinteId: c.id,
      contribuinte: {
        cpfCnpj: c.cpfCnpj,
        razaoSocial: c.razaoSocial,
        nomeFantasia: c.nomeFantasia ?? undefined,
        tipo: c.tipo,
        regimeTributario: c.regimeTributario ?? undefined,
        atividadePrincipal: c.atividadePrincipal ?? undefined,
        cnae: c.cnae ?? undefined,
        endereco: c.endereco ?? undefined,
        municipio: c.municipio ?? undefined,
        uf: c.uf ?? undefined,
        telefone: c.telefone ?? undefined,
        email: c.email ?? undefined,
      },
      isNewContribuinte: false,
    });
    setShowForm(false);
  }

  function updateField(field: string, value: string) {
    onUpdate({
      contribuinte: { ...form, [field]: value } as any,
      isNewContribuinte: true,
      contribuinteId: undefined,
    });
  }

  return (
    <div className="space-y-6">
      {/* Search existing */}
      {!showForm && !data.contribuinteId && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por CNPJ/CPF ou razão social..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {contribuintes.data && contribuintes.data.items.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
              {contribuintes.data.items.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => selectExisting(c)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Building2 className="h-5 w-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {c.razaoSocial}
                    </p>
                    <p className="text-xs text-gray-500">{c.cpfCnpj}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setShowForm(true);
              onUpdate({ isNewContribuinte: true });
            }}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <UserPlus className="h-4 w-4" />
            Cadastrar novo contribuinte
          </button>
        </div>
      )}

      {/* Selected existing */}
      {data.contribuinteId && !showForm && (
        <div className="flex items-center justify-between p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">
              {data.contribuinte?.razaoSocial}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {data.contribuinte?.cpfCnpj}
            </p>
          </div>
          <button
            onClick={() => {
              onUpdate({ contribuinteId: undefined, contribuinte: undefined });
              setSearch("");
            }}
            className="text-sm text-green-700 hover:text-green-800 dark:text-green-300"
          >
            Alterar
          </button>
        </div>
      )}

      {/* New contribuinte form */}
      {showForm && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Novo Contribuinte
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                onUpdate({ isNewContribuinte: false, contribuinte: undefined });
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CPF/CNPJ *
              </label>
              <input
                type="text"
                value={form.cpfCnpj}
                onChange={(e) => updateField("cpfCnpj", maskCpfCnpj(e.target.value))}
                maxLength={18}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo *
              </label>
              <select
                value={form.tipo}
                onChange={(e) => updateField("tipo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TIPOS_CONTRIBUINTE.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Razão Social *
            </label>
            <input
              type="text"
              value={form.razaoSocial}
              onChange={(e) => updateField("razaoSocial", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={form.nomeFantasia ?? ""}
                onChange={(e) => updateField("nomeFantasia", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Regime Tributário
              </label>
              <select
                value={form.regimeTributario ?? ""}
                onChange={(e) => updateField("regimeTributario", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecionar...</option>
                {REGIMES_TRIBUTARIOS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CNAE
              </label>
              <input
                type="text"
                value={form.cnae ?? ""}
                onChange={(e) => updateField("cnae", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Atividade Principal
              </label>
              <input
                type="text"
                value={form.atividadePrincipal ?? ""}
                onChange={(e) => updateField("atividadePrincipal", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Município
              </label>
              <input
                type="text"
                value={form.municipio ?? ""}
                onChange={(e) => updateField("municipio", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                UF
              </label>
              <input
                type="text"
                value={form.uf ?? ""}
                onChange={(e) => updateField("uf", e.target.value.toUpperCase())}
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={form.telefone ?? ""}
                onChange={(e) => updateField("telefone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Laudo context fields */}
      {(data.contribuinteId || data.isNewContribuinte) && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">
            Contexto do Laudo
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor da Dívida (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={data.valorDivida ?? ""}
                onChange={(e) =>
                  onUpdate({
                    valorDivida: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Processo Administrativo
              </label>
              <input
                type="text"
                value={data.processoAdmin ?? ""}
                onChange={(e) => onUpdate({ processoAdmin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
