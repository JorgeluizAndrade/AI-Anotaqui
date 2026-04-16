"use client";

import type { AnnotationStatus, UploadStatus } from "@/lib/types";
import { getStatusColor, getStatusLabel } from "@/lib/types";

type StatusBadgeProps = {
  status: AnnotationStatus | UploadStatus;
  size?: "sm" | "md";
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${getStatusColor(status)}`}>
      {status === "PROCESSING" && (
        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {getStatusLabel(status)}
    </span>
  );
}
