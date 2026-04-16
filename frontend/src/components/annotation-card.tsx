"use client";

import Link from "next/link";
import type { AnnotationSummary } from "@/lib/types";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/types";

type AnnotationCardProps = {
  annotation: AnnotationSummary;
};

export function AnnotationCard({ annotation }: AnnotationCardProps) {
  return (
    <Link
      href={`/annotation/${annotation.id}`}
      className="group block rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-medium text-card-foreground group-hover:text-primary">
            {annotation.title || `Anotacao #${annotation.id}`}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(annotation.createdAt)}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(annotation.status)}`}>
          {getStatusLabel(annotation.status)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Clique para visualizar e editar</span>
      </div>
    </Link>
  );
}
