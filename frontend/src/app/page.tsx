"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type UploadStatus = "PENDING" | "PROCESSING" | "DONE" | "ERROR";

type UploadRecord = {
  id: number;
  fileName: string;
  filePath: string;
  status: UploadStatus;
  createdAt: string;
  updatedAt: string;
};

const terminalStates: UploadStatus[] = ["DONE", "ERROR"];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [trackedFileName, setTrackedFileName] = useState<string | null>(null);
  const [uploadRecord, setUploadRecord] = useState<UploadRecord | null>(null);

  const canSubmit = useMemo(() => Boolean(file) && !isUploading, [file, isUploading]);

  useEffect(() => {
    if (!trackedFileName) return;

    const loadStatus = async () => {
      try {
        const response = await fetch(`/api/upload/${encodeURIComponent(trackedFileName)}`);

        if (!response.ok) {
          throw new Error("Não foi possível consultar o status do processamento.");
        }

        const data = (await response.json()) as UploadRecord;
        setUploadRecord(data);
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
  }, [trackedFileName, uploadRecord]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) return;

    setError(null);
    setSuccessMessage(null);
    setUploadRecord(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "Falha no upload.");
      }

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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">AI Anota[qui]</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Envie um áudio e acompanhe o processamento assíncrono para gerar transcrição e conteúdos de IA.
        </p>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-zinc-700" htmlFor="audio-input">
            Arquivo de áudio (.mp3 ou .mp4)
          </label>
          <input
            id="audio-input"
            type="file"
            accept="audio/mpeg,audio/mp4"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700"
          />

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isUploading ? "Enviando..." : "Enviar áudio"}
          </button>
        </form>

        {successMessage ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
        ) : null}

        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Status do processamento</h2>
        {!trackedFileName ? (
          <p className="mt-3 text-sm text-zinc-600">Nenhum arquivo enviado nesta sessão.</p>
        ) : (
          <div className="mt-3 space-y-2 text-sm text-zinc-700">
            <p>
              <span className="font-medium">Arquivo:</span> {trackedFileName}
            </p>
            <p>
              <span className="font-medium">Status:</span> {uploadRecord?.status ?? "Consultando..."}
            </p>
            <p>
              <span className="font-medium">Última atualização:</span>{" "}
              {uploadRecord?.updatedAt ? new Date(uploadRecord.updatedAt).toLocaleString("pt-BR") : "-"}
            </p>
            <p className="text-xs text-zinc-500">
              O backend processa de forma assíncrona; esta tela atualiza automaticamente a cada 5 segundos.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
