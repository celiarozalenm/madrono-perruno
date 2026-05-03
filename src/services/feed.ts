// Client for the /api/feed Edge Function — returns the latest reports + comments
// across the whole city, sorted by timestamp descending.

export interface FeedMeta {
  name?: string
  lat?: number
  lng?: number
  distrito?: string
}

export interface ReportFeedEntry {
  kind: 'report'
  entityType: 'papelera'
  id: string
  hasBags: boolean
  meta?: FeedMeta
  ipHash: string
  ts: number
}

export interface CommentFeedEntry {
  kind: 'comment'
  entityType: 'area' | 'parque' | 'fuente'
  id: string
  sentiment: 'good' | 'bad'
  text: string
  meta?: FeedMeta
  ipHash: string
  ts: number
}

export type FeedEntry = ReportFeedEntry | CommentFeedEntry

export interface FeedResponse {
  entries: FeedEntry[]
  count: number
}

export async function fetchFeed(limit = 30): Promise<FeedResponse> {
  const res = await fetch(`/api/feed?limit=${encodeURIComponent(limit)}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`fetchFeed HTTP ${res.status}`)
  return (await res.json()) as FeedResponse
}
