"use client";

import React, { forwardRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  charCount?: { current: number; max?: number };
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      charCount,
      id,
      value,
      defaultValue,
      onFocus,
      onBlur,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-mono uppercase tracking-wider text-text-muted transition-colors"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "relative bg-surface-2 border rounded-[14px] p-3.5 transition-all duration-200",
            error
              ? "border-danger shadow-[0_0_0_1px_rgba(255,92,108,0.35)]"
              : isFocused
              ? "border-accent shadow-[0_0_0_1px_rgba(215,255,61,0.35),0_0_24px_rgba(215,255,61,0.12)]"
              : "border-border hover:border-border-strong"
          )}
        >
          <textarea
            ref={ref}
            id={inputId}
            rows={rows}
            value={value}
            defaultValue={defaultValue}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "w-full bg-transparent text-text text-sm font-sans placeholder:text-text-faint focus:outline-none resize-y leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] min-h-[16px]">
          {error ? (
            <span className="text-danger flex items-center gap-1 font-medium">
              <AlertCircle size={12} />
              <span>{error}</span>
            </span>
          ) : helperText ? (
            <span className="text-text-faint">{helperText}</span>
          ) : (
            <span />
          )}

          {charCount && (
            <span className="text-text-faint font-mono ml-auto">
              {charCount.current}
              {charCount.max ? ` / ${charCount.max}` : ""}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
