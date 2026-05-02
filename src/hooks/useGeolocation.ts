import { useState } from 'react'

interface Coords {
  lat: number
  lng: number
}

interface State {
  coords: Coords | null
  loading: boolean
  error: string | null
}

export function useGeolocation(): State & { request: () => void } {
  const [state, setState] = useState<State>({ coords: null, loading: false, error: null })

  function request() {
    if (!('geolocation' in navigator)) {
      setState({ coords: null, loading: false, error: 'Geolocalización no disponible' })
      return
    }
    setState({ coords: null, loading: true, error: null })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          loading: false,
          error: null,
        })
      },
      (err) => {
        setState({ coords: null, loading: false, error: err.message })
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    )
  }

  return { ...state, request }
}
