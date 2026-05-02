// Vercel Edge Function: handles GET (read latest comments for an entity) and POST
// (submit a comment). Used for áreas caninas and parques (papeleras have their
// own simpler yes/no /api/report endpoint).
//
// Data model per entity:
//   - sorted set "comment:<entityType>:<entityId>"
//     score = unix-ms timestamp
//     value = JSON.stringify({ sentiment, text, ipHash, ts, rand })
//   - rate limit "rlc:<ipHash>" (counter expiring in 1 hour)

import { Redis } from '@upstash/redis'

export const config = { runtime: 'edge' }

const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
})

const MAX_COMMENTS_PER_ENTITY = 30
const COMMENTS_RETURNED = 8
const COMMENT_TTL_SECONDS = 60 * 60 * 24 * 60 // 60 days
const RATE_LIMIT_PER_HOUR = 12
const MAX_TEXT_LENGTH = 140
const ALLOWED_TYPES = new Set(['area', 'parque'])
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

interface CommentEntry {
  sentiment: 'good' | 'bad'
  text: string
  ipHash: string
  ts: number
}

function sanitiseText(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH)
}

function parseEntry(raw: string): CommentEntry | null {
  try {
    const obj = JSON.parse(raw) as Partial<CommentEntry>
    if (obj.sentiment !== 'good' && obj.sentiment !== 'bad') return null
    return {
      sentiment: obj.sentiment,
      text: typeof obj.text === 'string' ? obj.text : '',
      ipHash: typeof obj.ipHash === 'string' ? obj.ipHash : '',
      ts: typeof obj.ts === 'number' ? obj.ts : 0,
    }
  } catch {
    return null
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
    const entityType = url.searchParams.get('type') ?? ''
    const entityId = url.searchParams.get('id') ?? ''
    if (!ALLOWED_TYPES.has(entityType) || !entityId) {
      return new Response(JSON.stringify({ error: 'invalid params' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }
    const key = `comment:${entityType}:${entityId}`
    const raw = await redis.zrange<string[]>(key, 0, COMMENTS_RETURNED - 1, { rev: true })
    const comments: CommentEntry[] = []
    for (const r of raw) {
      const e = parseEntry(String(r))
      if (e) comments.push(e)
    }
    return new Response(
      JSON.stringify({
        entityType,
        entityId,
        comments,
        count: comments.length,
      }),
      {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      },
    )
  }

  if (req.method === 'POST') {
    let body: { type?: string; id?: string; sentiment?: string; text?: string }
    try {
      body = (await req.json()) as typeof body
    } catch {
      return new Response(JSON.stringify({ error: 'invalid json' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const entityType = String(body.type ?? '')
    const entityId = String(body.id ?? '').slice(0, 60)
    const sentiment = body.sentiment === 'good' || body.sentiment === 'bad' ? body.sentiment : null
    const text = sanitiseText(typeof body.text === 'string' ? body.text : '')

    if (!ALLOWED_TYPES.has(entityType) || !entityId || !/^[a-zA-Z0-9_\-]+$/.test(entityId) || !sentiment) {
      return new Response(JSON.stringify({ error: 'invalid params' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const ip =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
    const ipHash = await hashIp(ip)

    const rlKey = `rlc:${ipHash}`
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
    const entry: CommentEntry & { rand: string } = { sentiment, text, ipHash, ts, rand }
    const key = `comment:${entityType}:${entityId}`
    await redis.zadd(key, { score: ts, member: JSON.stringify(entry) })
    const total = await redis.zcard(key)
    if (total > MAX_COMMENTS_PER_ENTITY) {
      await redis.zremrangebyrank(key, 0, total - MAX_COMMENTS_PER_ENTITY - 1)
    }
    await redis.expire(key, COMMENT_TTL_SECONDS)

    return new Response(
      JSON.stringify({ ok: true, ts, sentiment, text }),
      {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      },
    )
  }

  return new Response('Method not allowed', { status: 405, headers: cors })
}
