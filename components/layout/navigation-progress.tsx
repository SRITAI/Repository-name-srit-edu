'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [, startTransition] = useTransition()

  // Reset when route or search params change
  useEffect(() => {
    if (isNavigating) {
      setProgress(100)
      const timer = setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  // Progress animation while navigating
  useEffect(() => {
    if (!isNavigating) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + 15
        if (prev < 60) return prev + 8
        if (prev < 85) return prev + 3
        return prev
      })
    }, 150)

    // Safety timeout in case navigation is cancelled or takes too long
    const safetyTimer = setTimeout(() => {
      setIsNavigating(false)
      setProgress(0)
    }, 12000)

    return () => {
      clearInterval(interval)
      clearTimeout(safetyTimer)
    }
  }, [isNavigating])

  // Global click listener on internal links
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore external, hash-only, mailto, tel, or target="_blank"
      if (
        target.target === '_blank' ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      try {
        const targetUrl = new URL(target.href, window.location.href)
        const currentUrl = new URL(window.location.href)

        // Only trigger for same-origin navigation to a different page/search
        if (
          targetUrl.origin === currentUrl.origin &&
          (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
        ) {
          startTransition(() => {
            setIsNavigating(true)
            setProgress(15)
          })
        }
      } catch {
        // Ignore invalid URLs
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [])

  if (!isNavigating && progress === 0) return null

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Page loading"
      className="fixed inset-x-0 top-0 z-[9999] pointer-events-none"
    >
      {/* Top Progress Bar */}
      <div
        className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-navy transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      {/* Subtle top-right indicator badge */}
      {isNavigating && (
        <div className="absolute right-4 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-navy-900 shadow-md border border-neutral-200 backdrop-blur-sm transition animate-in fade-in duration-150">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
          <span>Loading…</span>
        </div>
      )}
    </div>
  )
}
