// Shared helper for formatting timestamps as relative time strings.
// Used by both PapeleraPopup and EntityPopup so they don't pull each other in.

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
