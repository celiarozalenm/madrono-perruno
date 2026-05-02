// Client for the /api/report Edge Function.

export interface BinReport {
  hasBags: boolean
  ipHash: string
  ts: number
}

export interface BinReportsSummary {
  binId: string
  reports: BinReport[]
  count: number
  latest: BinReport | null
}

export async function fetchReports(binId: string): Promise<BinReportsSummary> {
  const res = await fetch(`/api/report?binId=${encodeURIComponent(binId)}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`fetchReports HTTP ${res.status}`)
  return (await res.json()) as BinReportsSummary
}

export async function submitReport(
  binId: string,
  hasBags: boolean,
): Promise<{ ok: true; ts: number; hasBags: boolean } | { error: string }> {
  const res = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ binId, hasBags }),
  })
  if (res.status === 429) return { error: 'rate_limited' }
  if (!res.ok) return { error: `HTTP ${res.status}` }
  return (await res.json()) as { ok: true; ts: number; hasBags: boolean }
}

export function formatRelativeTime(ts: number, locale: 'es' | 'en' = 'es'): string {
  const diff = Date.now() - ts
  const m = Math.round(diff / 60_000)
  if (m < 1) return locale === 'es' ? 'ahora' : 'just now'
  if (m < 60) return locale === 'es' ? `hace ${m} min` : `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return locale === 'es' ? `hace ${h} h` : `${h} h ago`
  const d = Math.round(h / 24)
  if (d < 30) return locale === 'es' ? `hace ${d} d` : `${d} d ago`
  return new Date(ts).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')
}
