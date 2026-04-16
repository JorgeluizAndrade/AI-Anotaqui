"use client";

import { useCallback, useState } from "react";

type UploadDropzoneProps = {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  selectedFile: File | null;
};

export function UploadDropzone({ onFileSelect, isUploading, selectedFile }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.type === "audio/mpeg" || file.type === "audio/mp4")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all ${
        isDragOver
          ? "border-primary bg-primary/10"
          : selectedFile
          ? "border-success bg-success/10"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        type="file"
        accept="audio/mpeg,audio/mp4"
        onChange={handleFileChange}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={isUploading}
      />

      {selectedFile ? (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/20">
            <svg className="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-4 text-base font-medium text-foreground">{selectedFile.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Clique ou arraste outro arquivo para substituir</p>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <svg className="h-7 w-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="mt-4 text-base font-medium text-foreground">
            Arraste e solte seu arquivo de audio aqui
          </p>
          <p className="mt-1 text-sm text-muted-foreground">ou clique para selecionar</p>
          <p className="mt-3 text-xs text-muted-foreground">Formatos suportados: MP3, MP4</p>
        </>
      )}
    </div>
  );
}
