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

type AnnotationStatus = "PENDING" | "PROCESSING" | "DONE" | "ERROR" | string;

type AnnotationSummary = {
  id: number;
  title: string;
  status: AnnotationStatus;
  createdAt?: string;
};

type AnnotationDetail = AnnotationSummary & {
  textOutput: string;
};

const terminalStates: UploadStatus[] = ["DONE", "ERROR"];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [trackedFileName, setTrackedFileName] = useState<string | null>(null);
  const [uploadRecord, setUploadRecord] = useState<UploadRecord | null>(null);

  const [annotations, setAnnotations] = useState<AnnotationSummary[]>([]);
  const [isAnnotationsLoading, setIsAnnotationsLoading] = useState(false);
  const [annotationsError, setAnnotationsError] = useState<string | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<number | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [editedTextOutput, setEditedTextOutput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => Boolean(file) && !isUploading, [file, isUploading]);

  const loadAnnotations = async () => {
    setAnnotationsError(null);
    setIsAnnotationsLoading(true);

    try {
      const response = await fetch("/api/annotations");

      if (!response.ok) {
        throw new Error("Não foi possível carregar as anotações de IA.");
      }

      const data = (await response.json()) as AnnotationSummary[];
      setAnnotations(data);

      if (!selectedAnnotationId && data.length > 0) {
        setSelectedAnnotationId(data[0].id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao buscar anotações.";
      setAnnotationsError(message);
    } finally {
      setIsAnnotationsLoading(false);
    }
  };

  useEffect(() => {
    void loadAnnotations();

    const interval = setInterval(() => {
      void loadAnnotations();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (uploadRecord?.status === "DONE") {
      void loadAnnotations();
    }
  }, [uploadRecord?.status]);

  useEffect(() => {
    if (!selectedAnnotationId) {
      setSelectedAnnotation(null);
      setEditedTextOutput("");
      return;
    }

    const loadAnnotationById = async () => {
      setDetailError(null);
      setSaveMessage(null);
      setIsDetailLoading(true);

      try {
        const response = await fetch(`/api/annotations/${selectedAnnotationId}`);

        if (!response.ok) {
          throw new Error("Não foi possível carregar a anotação selecionada.");
        }

        const data = (await response.json()) as AnnotationDetail;
        setSelectedAnnotation(data);
        setEditedTextOutput(data.textOutput ?? "");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro inesperado ao carregar anotação.";
        setDetailError(message);
      } finally {
        setIsDetailLoading(false);
      }
    };

    void loadAnnotationById();
  }, [selectedAnnotationId]);

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

  const handleSave = async () => {
    if (!selectedAnnotation) return;

    setSaveMessage(null);
    setDetailError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/annotations/${selectedAnnotation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textOutput: editedTextOutput,
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível salvar as alterações na anotação.");
      }

      const updatedAnnotation = (await response.json()) as AnnotationDetail;
      setSelectedAnnotation(updatedAnnotation);
      setEditedTextOutput(updatedAnnotation.textOutput ?? "");
      setSaveMessage("Anotação salva com sucesso.");
      void loadAnnotations();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao salvar anotação.";
      setDetailError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">AI Anota[qui]</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Envie um áudio, acompanhe o processamento e refine as anotações geradas pela IA com seus próprios
          comentários.
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

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-zinc-900">Anotações de IA</h2>
            <button
              type="button"
              onClick={() => void loadAnnotations()}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Atualizar
            </button>
          </div>

          {isAnnotationsLoading ? <p className="mt-4 text-sm text-zinc-600">Carregando anotações...</p> : null}
          {annotationsError ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{annotationsError}</p>
          ) : null}

          {!isAnnotationsLoading && !annotationsError && annotations.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">Nenhuma anotação disponível no momento.</p>
          ) : null}

          <ul className="mt-4 space-y-3">
            {annotations.map((annotation) => {
              const isActive = annotation.id === selectedAnnotationId;
              return (
                <li key={annotation.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedAnnotationId(annotation.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                    }`}
                  >
                    <p className="text-sm font-semibold">{annotation.title || `Anotação #${annotation.id}`}</p>
                    <p className={`mt-1 text-xs ${isActive ? "text-zinc-200" : "text-zinc-500"}`}>
                      Status: {annotation.status}
                    </p>
                    <p className={`text-xs ${isActive ? "text-zinc-200" : "text-zinc-500"}`}>
                      Criado em: {annotation.createdAt ? new Date(annotation.createdAt).toLocaleString("pt-BR") : "-"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Detalhes e edição</h2>

          {isDetailLoading ? <p className="mt-4 text-sm text-zinc-600">Carregando detalhes da anotação...</p> : null}
          {detailError ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{detailError}</p> : null}

          {!isDetailLoading && !selectedAnnotation ? (
            <p className="mt-4 text-sm text-zinc-600">Selecione uma anotação para visualizar e editar.</p>
          ) : null}

          {selectedAnnotation ? (
            <div className="mt-4 space-y-4">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium text-zinc-700">Título:</span>{" "}
                  <span className="text-zinc-900">{selectedAnnotation.title || `Anotação #${selectedAnnotation.id}`}</span>
                </p>
                <p>
                  <span className="font-medium text-zinc-700">Status:</span>{" "}
                  <span className="text-zinc-900">{selectedAnnotation.status}</span>
                </p>
              </div>

              <div>
                <label htmlFor="annotation-editor" className="mb-2 block text-sm font-medium text-zinc-700">
                  Conteúdo (edite e acrescente suas anotações pessoais)
                </label>
                <textarea
                  id="annotation-editor"
                  value={editedTextOutput}
                  onChange={(event) => setEditedTextOutput(event.target.value)}
                  rows={14}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800"
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>

              {saveMessage ? (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveMessage}</p>
              ) : null}
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}
