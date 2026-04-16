"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { UploadDropzone } from "@/components/upload-dropzone";
import { StatusBadge } from "@/components/status-badge";
import type { UploadRecord } from "@/lib/types";
import { terminalStates } from "@/lib/types";
import { uploadFile, getUploadStatus } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [trackedFileName, setTrackedFileName] = useState<string | null>(null);
  const [uploadRecord, setUploadRecord] = useState<UploadRecord | null>(null);

  useEffect(() => {
    if (!trackedFileName) return;

    const loadStatus = async () => {
      try {
        const data = await getUploadStatus(trackedFileName);
        setUploadRecord(data);

        if (data.status === "DONE") {
          // Redirect to home after processing is done
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro inesperado.";
        setError(message);
      }
    };

    void loadStatus();

    const interval = setInterval(() => {
      if (uploadRecord && terminalStates.includes(uploadRecord.status)) {
        clearInterval(interval);
        return;
      }
      void loadStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [trackedFileName, uploadRecord, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) return;

    setError(null);
    setSuccessMessage(null);
    setUploadRecord(null);
    setIsUploading(true);

    try {
      const responseText = await uploadFile(file);
      setSuccessMessage(responseText);

      const matched = responseText.match(/:\s*(.+)$/);
      const fileNameFromApi = matched?.[1]?.trim();
      const target = fileNameFromApi || file.name;
      setTrackedFileName(target);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSuccessMessage(null);
    setTrackedFileName(null);
    setUploadRecord(null);
    setError(null);
  };

  const getProgressPercentage = () => {
    if (!uploadRecord) return 0;
    switch (uploadRecord.status) {
      case "PENDING":
        return 25;
      case "PROCESSING":
        return 60;
      case "DONE":
        return 100;
      case "ERROR":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Novo Audio</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Envie um arquivo de audio para transcricao e geracao de anotacoes com IA
              </p>
            </div>
          </div>

          {/* Upload form */}
          {!trackedFileName ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-medium text-foreground">Selecione o arquivo</h2>
                <UploadDropzone
                  onFileSelect={setFile}
                  isUploading={isUploading}
                  selectedFile={file}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Enviar audio
                    </>
                  )}
                </button>
                <Link
                  href="/"
                  className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          ) : (
            /* Processing status */
            <div className="mt-8 space-y-6">
              {/* Success message */}
              {successMessage && (
                <div className="rounded-lg border border-success/50 bg-success/10 p-4">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-success">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Status card */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-foreground">Status do Processamento</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Acompanhe o progresso da transcricao
                    </p>
                  </div>
                  {uploadRecord && <StatusBadge status={uploadRecord.status} />}
                </div>

                {/* Progress bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium text-foreground">{getProgressPercentage()}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all duration-500 ${
                        uploadRecord?.status === "ERROR" ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>

                {/* File info */}
                <div className="mt-6 space-y-3 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Arquivo</span>
                    <span className="font-medium text-foreground">{trackedFileName}</span>
                  </div>
                  {uploadRecord && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ultima atualizacao</span>
                        <span className="font-medium text-foreground">
                          {new Date(uploadRecord.updatedAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Status messages */}
                {uploadRecord?.status === "PROCESSING" && (
                  <div className="mt-6 flex items-center gap-3 rounded-lg bg-secondary/10 p-4">
                    <svg className="h-5 w-5 animate-spin text-secondary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-secondary">Processando audio...</p>
                      <p className="text-xs text-secondary/80">
                        A IA esta transcrevendo e gerando anotacoes. Isso pode levar alguns minutos.
                      </p>
                    </div>
                  </div>
                )}

                {uploadRecord?.status === "DONE" && (
                  <div className="mt-6 flex items-center gap-3 rounded-lg bg-success/10 p-4">
                    <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-success">Processamento concluido!</p>
                      <p className="text-xs text-success/80">
                        Redirecionando para a pagina inicial...
                      </p>
                    </div>
                  </div>
                )}

                {uploadRecord?.status === "ERROR" && (
                  <div className="mt-6 flex items-center gap-3 rounded-lg bg-destructive/10 p-4">
                    <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-destructive">Erro no processamento</p>
                      <p className="text-xs text-destructive/80">
                        Ocorreu um erro ao processar o arquivo. Tente novamente.
                      </p>
                    </div>
                  </div>
                )}

                {/* Info */}
                <p className="mt-4 text-xs text-muted-foreground">
                  O status e atualizado automaticamente a cada 5 segundos.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
                >
                  Enviar outro arquivo
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Ver anotacoes
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Help section */}
          <div className="mt-12 rounded-lg border border-border bg-card p-6">
            <h3 className="text-base font-medium text-foreground">Como funciona?</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Envie o audio</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Selecione um arquivo MP3 ou MP4
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-sm font-semibold text-secondary">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">IA processa</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Transcricao e geracao de insights
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Edite e refine</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Adicione suas proprias anotacoes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
