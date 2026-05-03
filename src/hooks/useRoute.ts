import { useEffect, useState } from 'react'
import type { View, StatsSection } from '../components/Sidebar'

const VIEWS: readonly View[] = ['map', 'barrio', 'route', 'stats', 'participar', 'recientes', 'about'] as const
const STATS_SECTIONS: readonly StatsSection[] = ['overview', 'ranking', 'needs', 'proteccion'] as const

export interface RouteState {
  view: View | null // null = show landing (no route in URL)
  statsSection: StatsSection
}

function parseHash(hash: string): RouteState {
  const clean = hash.replace(/^#\/?/, '').replace(/\/$/, '')
  if (!clean) return { view: null, statsSection: 'overview' }
  const [head, sub] = clean.split('/')
  const view = (VIEWS as readonly string[]).includes(head) ? (head as View) : null
  const statsSection =
    view === 'stats' && (STATS_SECTIONS as readonly string[]).includes(sub)
      ? (sub as StatsSection)
      : 'overview'
  return { view, statsSection }
}

function buildHash(view: View | null, statsSection: StatsSection): string {
  if (!view) return ''
  if (view === 'stats') return `#/stats/${statsSection}`
  return `#/${view}`
}

export function useRoute() {
  const [state, setState] = useState<RouteState>(() => parseHash(window.location.hash))

  useEffect(() => {
    function onHashChange() {
      setState(parseHash(window.location.hash))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function navigate(view: View | null, statsSection: StatsSection = 'overview') {
    const hash = buildHash(view, statsSection)
    const current = window.location.hash
    if (hash !== current) {
      if (hash) {
        window.location.hash = hash
      } else {
        // clear hash without leaving "#" in the URL
        history.replaceState(null, '', window.location.pathname + window.location.search)
        setState({ view: null, statsSection: 'overview' })
      }
    } else {
      setState({ view, statsSection })
    }
  }

  return { view: state.view, statsSection: state.statsSection, navigate }
}
