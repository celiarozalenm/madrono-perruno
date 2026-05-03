// Temporary debug endpoint: writes a hardcoded entry to feed:global and
// returns the result, so we can see if the redis write itself is failing.

import { Redis } from '@upstash/redis'

export const config = { runtime: 'edge' }

const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
})

const FEED_KEY = 'feed:global'

export default async function handler() {
  try {
    const ts = Date.now()
    const member = JSON.stringify({
      kind: 'report',
      entityType: 'papelera',
      id: 'debug-test',
      hasBags: true,
      ipHash: 'debug',
      ts,
      rand: 'debug',
    })
    const result = await redis.zadd(FEED_KEY, { score: ts, member })
    const total = await redis.zcard(FEED_KEY)
    return new Response(JSON.stringify({ ok: true, result, total, ts, member }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : null,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
