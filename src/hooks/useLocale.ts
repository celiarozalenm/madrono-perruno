import { useEffect, useState } from 'react'
import type { Locale } from '../types'

const STORAGE_KEY = 'mp-locale'

function detect(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored === 'es' || stored === 'en') return stored
  } catch {
    // ignore
  }
  return 'es'
}

export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void; toggle: () => void } {
  const [locale, setLocaleState] = useState<Locale>(() => detect())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // ignore
    }
    document.documentElement.lang = locale
  }, [locale])

  function setLocale(l: Locale): void {
    setLocaleState(l)
  }
  function toggle(): void {
    setLocaleState((l) => (l === 'es' ? 'en' : 'es'))
  }
  return { locale, setLocale, toggle }
}
