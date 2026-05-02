import { useEffect, useState } from 'react'
import { loadAllDatasets } from '../services/madridData'
import type { Datasets } from '../types'

interface State {
  data: Datasets | null
  loading: boolean
  error: string | null
}

export function useDatasets(): State & { reload: () => void } {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    loadAllDatasets()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Unknown error'
          setState({ data: null, loading: false, error: msg })
        }
      })
    return () => {
      cancelled = true
    }
  }, [tick])

  return { ...state, reload: () => setTick((t) => t + 1) }
}
