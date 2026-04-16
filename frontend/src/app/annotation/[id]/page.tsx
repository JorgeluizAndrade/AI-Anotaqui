"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { AnnotationDetail } from "@/lib/types";
import { formatDate } from "@/lib/types";
import { getAnnotationById, updateAnnotation, deleteAnnotation } from "@/lib/api";

type ViewMode = "preview" | "edit" | "split";

export default function AnnotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [annotation, setAnnotation] = useState<AnnotationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editedContent, setEditedContent] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasChanges = annotation && editedContent !== (annotation.textOutput ?? "");

  const loadAnnotation = useCallback(async () => {
    if (!id) return;
    
    setError(null);
    try {
      const data = await getAnnotationById(id);
      setAnnotation(data);
      setEditedContent(data.textOutput ?? "");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao carregar anotacao.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadAnnotation();
  }, [loadAnnotation]);

  const handleSave = async () => {
    if (!annotation) return;

    setSaveMessage(null);
    setIsSaving(true);

    try {
      const updated = await updateAnnotation(annotation.id, editedContent);
      setAnnotation(updated);
      setEditedContent(updated.textOutput ?? "");
      setSaveMessage("Alteracoes salvas com sucesso!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao salvar.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!annotation) return;

    setIsDeleting(true);
    try {
      await deleteAnnotation(annotation.id);
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir anotacao.";
      setError(message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      if (hasChanges && !isSaving) {
        void handleSave();
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1">
        {isLoading ? (
          <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-4 text-sm text-muted-foreground">Carregando anotacao...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-screen items-center justify-center p-8">
            <div className="max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="mt-4 text-lg font-semibold text-destructive">Erro ao carregar</h2>
              <p className="mt-2 text-sm text-destructive/80">{error}</p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setError(null);
                    void loadAnnotation();
                  }}
                  className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
                >
                  Tentar novamente
                </button>
                <Link
                  href="/"
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted"
                >
                  Voltar ao inicio
                </Link>
              </div>
            </div>
          </div>
        ) : annotation ? (
          <div className="flex h-screen flex-col" onKeyDown={handleKeyDown}>
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {annotation.title || `Anotacao #${annotation.id}`}
                  </h1>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDate(annotation.createdAt)}</span>
                    <StatusBadge status={annotation.status} size="sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View mode toggle */}
                <div className="flex rounded-lg border border-border bg-muted p-1">
                  <button
                    onClick={() => setViewMode("preview")}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === "preview"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Visualizar
                  </button>
                  <button
                    onClick={() => setViewMode("split")}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === "split"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Dividido
                  </button>
                  <button
                    onClick={() => setViewMode("edit")}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === "edit"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Editar
                  </button>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Excluir anotacao"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Save message */}
            {saveMessage && (
              <div className="border-b border-success/50 bg-success/10 px-6 py-2">
                <p className="text-sm text-success">{saveMessage}</p>
              </div>
            )}

            {/* Editor area */}
            <div className="flex flex-1 overflow-hidden">
              {/* Edit panel */}
              {(viewMode === "edit" || viewMode === "split") && (
                <div className={`flex flex-col overflow-hidden border-r border-border ${viewMode === "split" ? "w-1/2" : "w-full"}`}>
                  <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-xs font-medium text-muted-foreground">Editor Markdown</span>
                    <span className="text-xs text-muted-foreground/60">(Ctrl/Cmd + S para salvar)</span>
                  </div>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder="Escreva suas anotacoes aqui usando Markdown..."
                    className="editor-textarea flex-1 resize-none border-0 bg-background p-6 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              )}

              {/* Preview panel */}
              {(viewMode === "preview" || viewMode === "split") && (
                <div className={`flex flex-col overflow-hidden ${viewMode === "split" ? "w-1/2" : "w-full"}`}>
                  <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-xs font-medium text-muted-foreground">Visualizacao</span>
                  </div>
                  <div className="flex-1 overflow-auto p-6">
                    {editedContent ? (
                      <MarkdownRenderer content={editedContent} />
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        O conteudo aparecera aqui conforme voce digita...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
                  <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Excluir anotacao</h3>
                  <p className="text-sm text-muted-foreground">Esta acao nao pode ser desfeita.</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Tem certeza que deseja excluir permanentemente esta anotacao? Todo o conteudo sera perdido.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Excluindo...
                    </>
                  ) : (
                    "Sim, excluir"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
