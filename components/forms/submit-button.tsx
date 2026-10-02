'use client'

import React from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: React.ReactNode
  pendingLabel?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  className?: string
  children?: React.ReactNode
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-navy-900 text-white shadow-sm hover:bg-navy-700 active:bg-navy-950 border border-transparent shadow-navy-900/10',
  secondary:
    'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 shadow-sm',
  outline:
    'bg-white text-navy-900 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 shadow-sm',
  danger:
    'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-sm',
}

export function SubmitButton({
  label,
  pendingLabel = 'Processing…',
  variant = 'primary',
  children,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const isPending = pending || disabled

  // Default base styling if no custom className override
  const defaultClass = `w-full rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 inline-flex items-center justify-center gap-2 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99] ${variantStyles[variant]}`

  return (
    <button
      type="submit"
      disabled={isPending}
      className={className || defaultClass}
      aria-disabled={isPending}
      {...props}
    >
      {pending && (
        <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current opacity-90" aria-hidden="true" />
      )}
      <span className="truncate">{pending ? pendingLabel : (children ?? label)}</span>
    </button>
  )
}
