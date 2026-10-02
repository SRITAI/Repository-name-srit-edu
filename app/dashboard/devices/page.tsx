import { createClient } from '@/lib/supabase/server'
import {
  getUserSessions,
  getDeviceTokenFromCookies,
  hashToken,
  MAX_ACTIVE_DEVICES,
} from '@/lib/auth/session'
import { revokeDeviceAction } from './actions'
import { SubmitButton } from '@/components/forms/submit-button'

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

function maskIp(ip: string | null): string {
  if (!ip) return '—'
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`
  }
  return ip.substring(0, 8) + '***'
}

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const sessions = user ? await getUserSessions(user.id) : []
  const currentToken = getDeviceTokenFromCookies()
  const currentHash = currentToken ? hashToken(currentToken) : null

  const now = new Date()
  const activeSessions = sessions.filter(
    (s) => !s.revoked_at && (!s.expires_at || new Date(s.expires_at) > now)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-900">My Devices</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage authorized devices and active login sessions.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold text-navy-900">
          <span className="text-slate-500">Active Slots:</span>
          <span className="text-blue-600">
            {activeSessions.length} / {MAX_ACTIVE_DEVICES}
          </span>
        </div>
      </div>

      {searchParams?.message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800">
          {searchParams.message}
        </div>
      )}

      {searchParams?.error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800">
          {searchParams.error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 text-xs text-slate-600 leading-relaxed">
        <strong className="text-navy-900 font-bold">Device Security Policy:</strong> You can use SRIT EDU on a
        maximum of <strong className="text-navy-900">{MAX_ACTIVE_DEVICES} devices</strong> simultaneously.
        To access your courses on a new phone, laptop, or tablet, remove an existing device below.
      </div>

      <div className="space-y-3.5">
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center text-xs text-slate-500">
            No device history recorded yet.
          </div>
        ) : (
          sessions.map((session) => {
            const isCurrent =
              Boolean(currentHash) && (session as any).session_token_hash === currentHash
            const isRevoked = Boolean(session.revoked_at)
            const isExpired =
              !isRevoked && session.expires_at && new Date(session.expires_at) <= now
            const isActive = !isRevoked && !isExpired

            return (
              <div
                key={session.id}
                className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center transition ${
                  isCurrent
                    ? 'border-blue-300 bg-blue-50/30 shadow-sm'
                    : isActive
                      ? 'border-slate-200/80 bg-white shadow-sm'
                      : 'border-slate-200/60 bg-slate-50/60 opacity-60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-navy-900 text-sm">
                      {session.device_label || 'Unknown Device'}
                    </span>
                    {isCurrent && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                        This Device
                      </span>
                    )}
                    {isRevoked ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                        Revoked
                      </span>
                    ) : isExpired ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                        Expired
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/80">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 space-x-2">
                    <span>Last active: {formatDate(session.last_active_at)}</span>
                    <span>•</span>
                    <span>Added: {formatDate(session.created_at)}</span>
                    {session.ip_address && (
                      <>
                        <span>•</span>
                        <span>IP: {maskIp(session.ip_address)}</span>
                      </>
                    )}
                  </div>
                </div>

                {isActive && (
                  <div>
                    <form action={revokeDeviceAction}>
                      <input type="hidden" name="sessionId" value={session.id} />
                      <input type="hidden" name="isCurrent" value={String(isCurrent)} />
                      <SubmitButton
                        label={isCurrent ? 'Log Out This Device' : 'Remove Device'}
                        pendingLabel={isCurrent ? 'Logging out…' : 'Removing…'}
                        className={`rounded-xl px-4 py-2 text-xs font-semibold transition inline-flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed ${
                          isCurrent
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
                      />
                    </form>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
