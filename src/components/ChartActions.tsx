import { useRef, useState } from 'react'
import { Download, Loader2, Share2 } from 'lucide-react'
import { shareOrDownloadChart } from '../services/chartShare'
import type { Locale } from '../types'

interface Props {
  title: string
  subtitle?: string
  filename: string
  locale: Locale
  /** Element that wraps the Recharts <ResponsiveContainer>. */
  targetRef: React.RefObject<HTMLDivElement | null>
}

export default function ChartActions({ title, subtitle, filename, locale, targetRef }: Props) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<'shared' | 'downloaded' | 'error' | null>(null)
  const timerRef = useRef<number | null>(null)

  async function handle() {
    if (!targetRef.current) return
    setBusy(true)
    setDone(null)
    try {
      const result = await shareOrDownloadChart({
        container: targetRef.current,
        title,
        subtitle,
        filename,
      })
      setDone(result)
    } catch (err) {
      // User cancelling the native share sheet throws AbortError. That's not
      // a failure — just reset the button silently without the red "Error".
      const isAbort =
        err instanceof DOMException && err.name === 'AbortError'
      if (isAbort) {
        setDone(null)
      } else {
        console.error('chart share failed', err)
        setDone('error')
      }
    } finally {
      setBusy(false)
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setDone(null), 3000)
    }
  }

  const label =
    done === 'shared'
      ? locale === 'es' ? '¡Compartido!' : 'Shared!'
      : done === 'downloaded'
      ? locale === 'es' ? 'Descargado' : 'Downloaded'
      : done === 'error'
      ? locale === 'es' ? 'Error' : 'Error'
      : locale === 'es' ? 'Compartir' : 'Share'

  const Icon = busy
    ? Loader2
    : done === 'downloaded'
    ? Download
    : Share2

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-medium border border-stone-300 hover:bg-stone-100 text-stone-700 disabled:opacity-50 transition-colors"
      aria-label={label}
      title={label}
    >
      <Icon size={14} className={busy ? 'animate-spin' : ''} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
