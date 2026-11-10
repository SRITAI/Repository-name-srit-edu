"use client";

import React, { useState } from "react";
import { UploadCloud, Image as ImageIcon, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  id: string;
  url: string;
  name: string;
  isPrimary?: boolean;
}

export interface DropzoneProps {
  files: UploadedFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  maxFiles?: number;
  className?: string;
}

export function Dropzone({
  files,
  onFilesAdded,
  onFileRemoved,
  onSetPrimary,
  maxFiles = 8,
  className,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 select-none overflow-hidden",
          isDragging
            ? "border-accent bg-accent/5 scale-[1.01] shadow-[0_0_32px_rgba(215,255,61,0.15)]"
            : "border-border bg-surface hover:border-border-strong hover:bg-surface-2"
        )}
      >
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={handleFileInput}
          className="hidden"
        />

        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110",
            isDragging ? "bg-accent text-accent-ink" : "bg-surface-2 text-text-muted group-hover:text-accent"
          )}
        >
          <UploadCloud size={28} />
        </div>

        <div className="text-sm font-semibold text-text group-hover:text-white transition-colors">
          Drop product photos here, or <span className="text-accent underline underline-offset-4">browse files</span>
        </div>
        <p className="text-xs text-text-faint mt-1.5 max-w-sm text-center leading-relaxed">
          High-res PNG, JPG or WebP. Packaging, texture close-ups, or candid product shots.
        </p>

        <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-text-muted uppercase tracking-wider">
          <span>Max 10MB per file</span>
          <span>•</span>
          <span>Up to {maxFiles} images</span>
        </div>
      </label>

      {/* Uploaded File Cards */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {files.map((file) => (
            <div
              key={file.id}
              className="group/img relative aspect-square rounded-xl overflow-hidden border border-border bg-surface-2 shadow-sm"
            >
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />

              {/* Primary Badge */}
              {file.isPrimary ? (
                <span className="absolute top-2 left-2 bg-accent text-accent-ink text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                  Primary
                </span>
              ) : (
                onSetPrimary && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onSetPrimary(file.id);
                    }}
                    className="absolute top-2 left-2 bg-black/60 hover:bg-black text-[9px] font-mono text-text-muted hover:text-white px-2 py-0.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                  >
                    Set Primary
                  </button>
                )
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onFileRemoved(file.id);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-danger text-white flex items-center justify-center transition-colors opacity-0 group-hover/img:opacity-100"
                title="Remove photo"
              >
                <X size={12} />
              </button>

              <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white truncate font-sans opacity-0 group-hover/img:opacity-100 transition-opacity">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
