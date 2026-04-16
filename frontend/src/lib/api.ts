import type { AnnotationDetail, AnnotationSummary, UploadRecord } from "./types";

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Falha no upload.");
  }

  return text;
}

export async function getUploadStatus(fileName: string): Promise<UploadRecord> {
  const response = await fetch(`/api/upload/${encodeURIComponent(fileName)}`);

  if (!response.ok) {
    throw new Error("Nao foi possivel consultar o status do processamento.");
  }

  return response.json();
}

export async function getAnnotations(): Promise<AnnotationSummary[]> {
  const response = await fetch("/api/annotations");

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as anotacoes de IA.");
  }

  return response.json();
}

export async function getAnnotationById(id: number): Promise<AnnotationDetail> {
  const response = await fetch(`/api/annotations/${id}`);

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a anotacao selecionada.");
  }

  return response.json();
}

export async function updateAnnotation(id: number, textOutput: string): Promise<AnnotationDetail> {
  const response = await fetch(`/api/annotations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ textOutput }),
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel salvar as alteracoes na anotacao.");
  }

  return response.json();
}

export async function deleteAnnotation(id: number): Promise<void> {
  const response = await fetch(`/api/annotations/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel excluir a anotacao.");
  }
}
