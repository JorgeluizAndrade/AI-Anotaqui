export type UploadStatus = "PENDING" | "PROCESSING" | "DONE" | "ERROR";

export type UploadRecord = {
  id: number;
  fileName: string;
  filePath: string;
  status: UploadStatus;
  createdAt: string;
  updatedAt: string;
};

export type AnnotationStatus = "PENDING" | "PROCESSING" | "DONE" | "ERROR" | string;

export type AnnotationSummary = {
  id: number;
  title: string;
  status: AnnotationStatus;
  createdAt?: string;
};

export type AnnotationDetail = AnnotationSummary & {
  textOutput: string;
};

export const terminalStates: UploadStatus[] = ["DONE", "ERROR"];

export function getStatusColor(status: AnnotationStatus): string {
  switch (status) {
    case "DONE":
      return "bg-success/20 text-success";
    case "PROCESSING":
      return "bg-secondary/20 text-secondary";
    case "PENDING":
      return "bg-accent/20 text-accent";
    case "ERROR":
      return "bg-destructive/20 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function getStatusLabel(status: AnnotationStatus): string {
  switch (status) {
    case "DONE":
      return "Concluido";
    case "PROCESSING":
      return "Processando";
    case "PENDING":
      return "Pendente";
    case "ERROR":
      return "Erro";
    default:
      return status;
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
