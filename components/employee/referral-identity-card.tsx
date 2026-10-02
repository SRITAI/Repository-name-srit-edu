'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Link2, ShieldCheck, Share2 } from 'lucide-react'

interface ReferralIdentityCardProps {
  employeeId: string
  referralCode: string
  department?: string | null
  status?: string
}

export function ReferralIdentityCard({
  employeeId,
  referralCode,
  department = 'General',
  status = 'active',
}: ReferralIdentityCardProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [baseUrl, setBaseUrl] = useState('https://sritedu.online')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setBaseUrl(window.location.origin)
    }
  }, [])

  const referralLink = `${baseUrl}/?ref=${referralCode}`

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'code') {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
    } catch {
      // Fallback
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Left Column: ID & Meta */}
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 px-3.5 py-1 text-xs font-bold text-blue-700">
            <ShieldCheck size={14} />
            <span>OFFICIAL EMPLOYEE REFERRAL IDENTITY</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-navy-900">
              Your Referral Link &amp; Code
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Share your personal referral link with students. When a student visits using your link, their browser session is automatically attributed to your account for 30 days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium">
              Employee ID: <strong className="font-mono font-bold text-navy-900">{employeeId}</strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              Department: <strong className="font-bold text-navy-900">{department || 'General'}</strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 capitalize">
              {status}
            </span>
          </div>
        </div>

        {/* Right Column: Code & Link Interactive Boxes */}
        <div className="grid w-full lg:max-w-md gap-3">
          {/* Referral Code Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                Referral Code
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(referralCode, 'code')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition shadow-2xs"
              >
                {copiedCode ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-1 font-mono text-lg font-extrabold tracking-wide text-navy-900">
              {referralCode}
            </div>
          </div>

          {/* Referral Link Box */}
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700 flex items-center gap-1.5">
                <Link2 size={13} />
                <span>Personal Referral Link</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(referralLink, 'link')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 active:scale-95 transition shadow-2xs"
              >
                {copiedLink ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={12} className="text-blue-600" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-1.5 font-mono text-xs font-semibold text-blue-950 truncate select-all">
              {referralLink}
            </div>
            <p className="mt-2 text-[11px] text-blue-800 leading-normal">
              Students should open this link before purchasing any course for verified attribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
