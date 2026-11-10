"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  description?: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
  searchable?: boolean;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option...",
  error,
  className,
  searchable,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const shouldShowSearch = searchable || options.length > 8;

  // Filter options if searchable
  const filteredOptions = shouldShowSearch && searchQuery
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (shouldShowSearch) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, shouldShowSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full space-y-1.5 text-left relative">
      {label && (
        <label className="block text-xs font-mono uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}

      {/* Select trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full h-[52px] px-4 rounded-[14px] bg-surface-2 border text-left flex items-center justify-between transition-all duration-200 select-none",
          isOpen
            ? "border-accent shadow-[0_0_0_1px_rgba(215,255,61,0.35),0_0_24px_rgba(215,255,61,0.12)]"
            : error
            ? "border-danger"
            : "border-border hover:border-border-strong",
          className
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon && (
            <span className="text-text-muted flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className={cn("text-sm font-sans truncate", selectedOption ? "text-text" : "text-text-faint")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-3 text-text-muted border border-border">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={16}
          className={cn(
            "text-text-muted flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-accent"
          )}
        />
      </button>

      {/* Custom Popover Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 left-0 right-0 top-[calc(100%+6px)] rounded-[18px] bg-surface border border-border-strong shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden",
            "animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl"
          )}
        >
          {shouldShowSearch && (
            <div className="p-2 border-b border-border bg-surface-2 flex items-center gap-2">
              <Search size={14} className="text-text-faint ml-2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs text-text placeholder:text-text-faint focus:outline-none p-1.5 font-sans"
              />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-text-faint">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-[10px] text-xs font-sans text-left flex items-center justify-between transition-colors",
                      isSelected
                        ? "bg-accent/15 text-accent font-semibold"
                        : "text-text hover:bg-surface-2 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-surface-3 text-text-muted">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check size={14} className="text-accent flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
