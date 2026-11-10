"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
  canNavigateTo?: (step: 1 | 2 | 3) => boolean;
  className?: string;
}

export function Stepper({
  currentStep,
  onStepClick,
  canNavigateTo,
  className,
}: StepperProps) {
  const steps = [
    { number: 1, label: "Brief" },
    { number: 2, label: "Input" },
    { number: 3, label: "Review" },
  ] as const;

  return (
    <div
      className={cn(
        "relative flex items-center justify-between p-1.5 rounded-full bg-surface-2 border border-border max-w-md mx-auto select-none",
        className
      )}
    >
      {steps.map((step, idx) => {
        const isCurrent = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const isClickable = canNavigateTo ? canNavigateTo(step.number) : step.number <= currentStep;

        return (
          <React.Fragment key={step.number}>
            {/* Step Node Button */}
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.number)}
              className={cn(
                "relative z-10 flex items-center gap-2 py-1.5 px-3.5 rounded-full text-xs font-sans font-medium transition-all duration-200",
                isCurrent
                  ? "bg-accent text-accent-ink font-bold shadow-[0_0_16px_rgba(215,255,61,0.25)]"
                  : isCompleted
                  ? "text-accent hover:bg-surface-3 cursor-pointer"
                  : isClickable
                  ? "text-text-muted hover:text-text cursor-pointer"
                  : "text-text-faint cursor-not-allowed opacity-60"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors",
                  isCurrent
                    ? "bg-accent-ink text-accent"
                    : isCompleted
                    ? "bg-accent/20 text-accent"
                    : "bg-surface-3 text-text-faint"
                )}
              >
                {isCompleted ? <Check size={11} strokeWidth={3} /> : step.number}
              </span>
              <span>{step.label}</span>
            </button>

            {/* Connecting progress line */}
            {idx < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-1.5 bg-surface-3 relative overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full bg-accent transition-all duration-300",
                    currentStep > step.number ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
