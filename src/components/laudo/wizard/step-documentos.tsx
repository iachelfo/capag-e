"use client";

import { useRef, useState } from "react";
import type { WizardData, DocumentoData } from "@/hooks/use-wizard";
import { TIPOS_DOCUMENTO } from "@/lib/constants";
import { Upload, FileText, Trash2, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
}

export function StepDocumentos({ data, onUpdate }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    const novos: DocumentoData[] = [];

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          alert(`Erro ao enviar ${file.name}: ${err.error}`);
          continue;
        }

        const result = await res.json();
        novos.push({
          tipo: "OUTROS",
          nomeArquivo: result.originalName,
          caminhoArquivo: result.path,
          tamanhoBytes: result.size,
          mimeType: result.mimeType,
        });
      } catch {
        alert(`Erro ao enviar ${file.name}`);
      }
    }

    if (novos.length > 0) {
      onUpdate({ documentos: [...data.documentos, ...novos] });
    }
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updateTipo(index: number, tipo: string) {
    const updated = data.documentos.map((d, i) =>
      i === index ? { ...d, tipo } : d
    );
    onUpdate({ documentos: updated });
  }

  function removeDocumento(index: number) {
    onUpdate({ documentos: data.documentos.filter((_, i) => i !== index) });
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("border-blue-400");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("border-blue-400");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-blue-400");
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center transition-colors ${
          uploading ? "opacity-50 cursor-wait" : "cursor-pointer hover:border-blue-300"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 mx-auto mb-3 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-blue-600">
              Enviando arquivos...
            </p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Arraste arquivos ou clique para selecionar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, imagens ou planilhas (max 10MB por arquivo)
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File list */}
      {data.documentos.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
          {data.documentos.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <FileText className="h-5 w-5 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {doc.nomeArquivo}
                  </p>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                </div>
                {doc.tamanhoBytes && (
                  <p className="text-xs text-gray-400">
                    {formatSize(doc.tamanhoBytes)}
                  </p>
                )}
              </div>
              <select
                value={doc.tipo}
                onChange={(e) => updateTipo(i, e.target.value)}
                className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeDocumento(i)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 text-sm text-gray-500">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Os arquivos são enviados imediatamente. Consulte o Checklist
          para verificar os documentos obrigatórios conforme Art. 30.
        </p>
      </div>
    </div>
  );
}
