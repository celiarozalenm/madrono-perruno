// Vercel Edge Function: handles GET (read latest reports for a bin) and POST (submit a report).
// Storage: Upstash Redis (env vars UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN auto-set
// when the marketplace integration is added in the project's "Storage" tab).
//
// Data model per bin:
//   - sorted set "bin:<binId>"  (score = unix-ms timestamp, value = "<true|false>:<ipHash>:<rand>")
//   - rate limit "rl:<ipHash>"  (counter expiring in 1 hour)

import { Redis } from '@upstash/redis'

export const config = { runtime: 'edge' }

// Vercel Marketplace integration exposes KV_REST_API_* env vars; Upstash SDK
// expects UPSTASH_REDIS_REST_*. Read whichever pair is available.
const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
})

const MAX_REPORTS_PER_BIN = 50
const REPORTS_RETURNED = 10
const REPORT_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days
const RATE_LIMIT_PER_HOUR = 20
const FEED_KEY = 'feed:global'
const FEED_MAX_ENTRIES = 200
const FEED_TTL_SECONDS = 60 * 60 * 24 * 60 // 60 days
const ALLOWED_ORIGINS = [
  'https://madrono-perruno.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

function corsHeaders(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + ':madrono-perruno-salt-2026')
  const buf = await crypto.subtle.digest('SHA-256', data)
  const arr = Array.from(new Uint8Array(buf))
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

interface ReportEntry {
  hasBags: boolean
  ipHash: string
  ts: number
}

function parseEntry(member: string, score: number): ReportEntry | null {
  const parts = member.split(':')
  if (parts.length < 2) return null
  return {
    hasBags: parts[0] === 'true',
    ipHash: parts[1],
    ts: score,
  }
}

export default async function handler(req: Request) {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  const url = new URL(req.url)

  if (req.method === 'GET') {
    const binId = url.searchParams.get('binId')
    if (!binId) {
      return new Response(JSON.stringify({ error: 'missing binId' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }
    const raw = await redis.zrange<string[]>(`bin:${binId}`, 0, REPORTS_RETURNED - 1, {
      rev: true,
      withScores: true,
    })
    const reports: ReportEntry[] = []
    for (let i = 0; i < raw.length; i += 2) {
      const member = String(raw[i])
      const score = Number(raw[i + 1])
      const e = parseEntry(member, score)
      if (e) reports.push(e)
    }
    return new Response(
      JSON.stringify({
        binId,
        reports,
        count: reports.length,
        latest: reports[0] ?? null,
      }),
      {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      },
    )
  }

  if (req.method === 'POST') {
    let body: {
      binId?: string
      hasBags?: boolean
      meta?: { name?: string; lat?: number; lng?: number; distrito?: string }
    }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return new Response(JSON.stringify({ error: 'invalid json' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const binId = String(body.binId ?? '').slice(0, 40)
    const hasBags = body.hasBags === true
    if (!binId || !/^[a-zA-Z0-9_\-]+$/.test(binId)) {
      return new Response(JSON.stringify({ error: 'invalid binId' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const meta = body.meta && typeof body.meta === 'object' ? body.meta : undefined
    const safeMeta =
      meta
        ? {
            name: typeof meta.name === 'string' ? meta.name.slice(0, 80) : undefined,
            lat: typeof meta.lat === 'number' && isFinite(meta.lat) ? meta.lat : undefined,
            lng: typeof meta.lng === 'number' && isFinite(meta.lng) ? meta.lng : undefined,
            distrito: typeof meta.distrito === 'string' ? meta.distrito.slice(0, 60) : undefined,
          }
        : undefined

    const ip =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
    const ipHash = await hashIp(ip)

    // Rate limit per IP per hour.
    const rlKey = `rl:${ipHash}`
    const count = await redis.incr(rlKey)
    if (count === 1) await redis.expire(rlKey, 3600)
    if (count > RATE_LIMIT_PER_HOUR) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const ts = Date.now()
    const rand = Math.random().toString(36).slice(2, 8)
    const member = `${hasBags ? 'true' : 'false'}:${ipHash}:${rand}`
    const setKey = `bin:${binId}`

    await redis.zadd(setKey, { score: ts, member })

    // Keep only the newest MAX_REPORTS_PER_BIN entries.
    const total = await redis.zcard(setKey)
    if (total > MAX_REPORTS_PER_BIN) {
      await redis.zremrangebyrank(setKey, 0, total - MAX_REPORTS_PER_BIN - 1)
    }
    await redis.expire(setKey, REPORT_TTL_SECONDS)

    // Also push to global feed for "Últimos reportes" view.
    try {
      const feedEntry = JSON.stringify({
        kind: 'report',
        entityType: 'papelera',
        id: binId,
        hasBags,
        meta: safeMeta,
        ipHash,
        ts,
        rand,
      })
      await redis.zadd(FEED_KEY, { score: ts, member: feedEntry })
      const feedTotal = await redis.zcard(FEED_KEY)
      if (feedTotal > FEED_MAX_ENTRIES) {
        await redis.zremrangebyrank(FEED_KEY, 0, feedTotal - FEED_MAX_ENTRIES - 1)
      }
      await redis.expire(FEED_KEY, FEED_TTL_SECONDS)
    } catch {
      // Feed write failures are non-fatal — the per-bin record is the source of truth.
    }

    return new Response(
      JSON.stringify({ ok: true, ts, hasBags }),
      {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      },
    )
  }

  return new Response('Method not allowed', { status: 405, headers: cors })
}
