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

export interface ReportMeta {
  name?: string
  lat?: number
  lng?: number
  distrito?: string
}

export async function submitReport(
  binId: string,
  hasBags: boolean,
  meta?: ReportMeta,
): Promise<{ ok: true; ts: number; hasBags: boolean } | { error: string }> {
  const res = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ binId, hasBags, meta }),
  })
  if (res.status === 429) return { error: 'rate_limited' }
  if (!res.ok) return { error: `HTTP ${res.status}` }
  return (await res.json()) as { ok: true; ts: number; hasBags: boolean }
}

export { formatRelativeTime } from '../components/reportsTime'
