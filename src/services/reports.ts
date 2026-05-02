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

export { formatRelativeTime } from '../components/reportsTime'
