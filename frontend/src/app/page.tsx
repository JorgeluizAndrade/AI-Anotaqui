"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { AnnotationCard } from "@/components/annotation-card";
import type { AnnotationSummary } from "@/lib/types";
import { getAnnotations } from "@/lib/api";

export default function HomePage() {
  const [annotations, setAnnotations] = useState<AnnotationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadAnnotations = async () => {
    setError(null);
    try {
      const data = await getAnnotations();
      setAnnotations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao buscar anotacoes.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAnnotations();

    const interval = setInterval(() => {
      void loadAnnotations();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const filteredAnnotations = annotations.filter((annotation) =>
    (annotation.title || `Anotacao #${annotation.id}`)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const doneAnnotations = filteredAnnotations.filter((a) => a.status === "DONE");
  const pendingAnnotations = filteredAnnotations.filter((a) => a.status !== "DONE");

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Suas Anotacoes</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerencie e edite suas anotacoes geradas por IA
              </p>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Novo Audio
            </Link>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar anotacoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{annotations.length}</p>
                  <p className="text-sm text-muted-foreground">Total de anotacoes</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                  <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{doneAnnotations.length}</p>
                  <p className="text-sm text-muted-foreground">Concluidas</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                  <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{pendingAnnotations.length}</p>
                  <p className="text-sm text-muted-foreground">Em processamento</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="mt-4 text-sm text-muted-foreground">Carregando anotacoes...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium text-destructive">Erro ao carregar</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsLoading(true);
                    void loadAnnotations();
                  }}
                  className="mt-3 text-sm font-medium text-destructive underline hover:no-underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : filteredAnnotations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">Nenhuma anotacao encontrada</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchQuery
                    ? "Tente buscar por outro termo"
                    : "Envie seu primeiro audio para comecar"}
                </p>
                {!searchQuery && (
                  <Link
                    href="/upload"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Enviar audio
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Processing annotations */}
                {pendingAnnotations.length > 0 && (
                  <div>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Em processamento ({pendingAnnotations.length})
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {pendingAnnotations.map((annotation) => (
                        <AnnotationCard key={annotation.id} annotation={annotation} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed annotations */}
                {doneAnnotations.length > 0 && (
                  <div>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Concluidas ({doneAnnotations.length})
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {doneAnnotations.map((annotation) => (
                        <AnnotationCard key={annotation.id} annotation={annotation} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
