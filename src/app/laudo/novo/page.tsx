"use client";

import { ArrowLeft, ArrowRight, Check, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWizard } from "@/hooks/use-wizard";
import { trpc } from "@/server/trpc/client";
import { StepContribuinte } from "@/components/laudo/wizard/step-contribuinte";
import { StepContabil } from "@/components/laudo/wizard/step-contabil";
import { StepDFC } from "@/components/laudo/wizard/step-dfc";
import { StepIndicadores } from "@/components/laudo/wizard/step-indicadores";
import { StepDocumentos } from "@/components/laudo/wizard/step-documentos";
import { StepRevisao } from "@/components/laudo/wizard/step-revisao";
import { useState } from "react";

const STEPS = [
  { label: "Contribuinte", desc: "Dados do contribuinte" },
  { label: "Contábil", desc: "Balanço Patrimonial e DRE" },
  { label: "DFC", desc: "Demonstração de Fluxo de Caixa" },
  { label: "Indicadores", desc: "Indicadores financeiros calculados" },
  { label: "Documentos", desc: "Upload de arquivos de suporte" },
  { label: "Revisão", desc: "Revisar dados e calcular CAPAG-e" },
];

export default function NovoLaudoPage() {
  const router = useRouter();
  const { data, currentStep, updateData, nextStep, prevStep, goToStep } =
    useWizard();
  const [saving, setSaving] = useState(false);

  const createContribuinte = trpc.contribuinte.create.useMutation();
  const createLaudo = trpc.laudo.create.useMutation();
  const upsertBalanco = trpc.balanco.upsert.useMutation();
  const upsertDre = trpc.dre.upsert.useMutation();
  const upsertDfc = trpc.dfc.upsert.useMutation();
  const createDocumento = trpc.documento.create.useMutation();

  async function handleFinalize() {
    setSaving(true);
    try {
      // 1) Create or use existing contribuinte
      let contribuinteId = data.contribuinteId;
      if (!contribuinteId && data.contribuinte) {
        const c = await createContribuinte.mutateAsync({
          cpfCnpj: data.contribuinte.cpfCnpj.replace(/\D/g, ""),
          razaoSocial: data.contribuinte.razaoSocial,
          nomeFantasia: data.contribuinte.nomeFantasia,
          tipo: data.contribuinte.tipo as "PF" | "PJ" | "MEI" | "SIMPLES",
          regimeTributario: data.contribuinte.regimeTributario as any,
          atividadePrincipal: data.contribuinte.atividadePrincipal,
          cnae: data.contribuinte.cnae,
          endereco: data.contribuinte.endereco,
          municipio: data.contribuinte.municipio,
          uf: data.contribuinte.uf,
          telefone: data.contribuinte.telefone,
          email: data.contribuinte.email,
        });
        contribuinteId = c.id;
      }

      if (!contribuinteId) {
        alert("Informe o contribuinte antes de salvar.");
        setSaving(false);
        return;
      }

      // 2) Create laudo
      const exercicios = data.balancos.map((b) => b.exercicio).sort();
      const laudo = await createLaudo.mutateAsync({
        contribuinteId,
        valorDivida: data.valorDivida,
        processoAdmin: data.processoAdmin,
        exercicioInicio: exercicios[0],
        exercicioFim: exercicios[exercicios.length - 1],
      });

      // 3) Save all financial data in parallel
      const promises: Promise<any>[] = [];

      for (const b of data.balancos) {
        promises.push(upsertBalanco.mutateAsync({ laudoId: laudo.id, ...b }));
      }
      for (const d of data.dres) {
        promises.push(upsertDre.mutateAsync({ laudoId: laudo.id, ...d }));
      }
      for (const d of data.dfcs) {
        promises.push(upsertDfc.mutateAsync({ laudoId: laudo.id, ...d }));
      }
      for (const doc of data.documentos) {
        promises.push(
          createDocumento.mutateAsync({
            laudoId: laudo.id,
            tipo: doc.tipo as any,
            nomeArquivo: doc.nomeArquivo,
            caminhoArquivo: doc.caminhoArquivo,
            tamanhoBytes: doc.tamanhoBytes ?? null,
            mimeType: doc.mimeType ?? null,
          })
        );
      }

      await Promise.all(promises);

      // Navigate to the newly created laudo
      router.push(`/laudo/${laudo.id}`);
    } catch (e: any) {
      alert(e.message ?? "Erro ao salvar laudo.");
      setSaving(false);
    }
  }

  function renderStep() {
    switch (currentStep) {
      case 0:
        return <StepContribuinte data={data} onUpdate={updateData} />;
      case 1:
        return <StepContabil data={data} onUpdate={updateData} />;
      case 2:
        return <StepDFC data={data} onUpdate={updateData} />;
      case 3:
        return <StepIndicadores data={data} />;
      case 4:
        return <StepDocumentos data={data} onUpdate={updateData} />;
      case 5:
        return <StepRevisao data={data} onUpdate={updateData} />;
      default:
        return null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Novo Laudo CAPAG-e
          </h1>
          <p className="text-sm text-gray-500">
            Preencha as informações para gerar o laudo técnico
          </p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((step, i) => (
          <button
            key={i}
            onClick={() => goToStep(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              i === currentStep
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium"
                : i < currentStep
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                i < currentStep
                  ? "bg-green-600 text-white"
                  : i === currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              }`}
            >
              {i < currentStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            {step.label}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 min-h-[400px]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {STEPS[currentStep].label}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {STEPS[currentStep].desc}
        </p>
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </button>

        {currentStep === STEPS.length - 1 ? (
          <button
            onClick={handleFinalize}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Salvando..." : "Salvar Laudo"}
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Próximo
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
