"use client";

import React, { forwardRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  charCount?: { current: number; max?: number };
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      charCount,
      id,
      value,
      defaultValue,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined ? Boolean(value) : Boolean(defaultValue);

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
            "relative flex items-center bg-surface-2 border rounded-[14px] transition-all duration-200",
            error
              ? "border-danger shadow-[0_0_0_1px_rgba(255,92,108,0.35)]"
              : isFocused
              ? "border-accent shadow-[0_0_0_1px_rgba(215,255,61,0.35),0_0_24px_rgba(215,255,61,0.12)]"
              : "border-border hover:border-border-strong",
            "h-[52px] px-4"
          )}
        >
          {leftIcon && <span className="mr-3 text-text-muted flex-shrink-0">{leftIcon}</span>}

          <input
            ref={ref}
            id={inputId}
            type={type}
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
              "w-full bg-transparent text-text text-sm font-sans placeholder:text-text-faint focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />

          {rightIcon && <span className="ml-3 text-text-muted flex-shrink-0">{rightIcon}</span>}
        </div>

        {/* Footer info: Error message or Helper text + Char counter */}
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

Input.displayName = "Input";
