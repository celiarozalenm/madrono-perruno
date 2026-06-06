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

// Madrid city centre + a generous radius. Outside it the data (papeleras, áreas
// caninas, parques) is meaningless, so we refuse with a friendly message.
const MADRID = { lat: 40.4168, lng: -3.7038 }
const MAX_DISTANCE_KM = 60

function distanceKm(a: Coords, b: Coords): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function useGeolocation(locale: 'es' | 'en' = 'es'): State & { request: () => void } {
  const [state, setState] = useState<State>({ coords: null, loading: false, error: null })

  function request() {
    if (!('geolocation' in navigator)) {
      setState({ coords: null, loading: false, error: 'Geolocalización no disponible' })
      return
    }
    setState({ coords: null, loading: true, error: null })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        if (distanceKm(coords, MADRID) > MAX_DISTANCE_KM) {
          setState({
            coords: null,
            loading: false,
            error:
              locale === 'es'
                ? 'Parece que no estás en Madrid. Esta plataforma solo funciona dentro de Madrid.'
                : "Looks like you're not in Madrid. This platform only works within Madrid.",
          })
          return
        }
        setState({ coords, loading: false, error: null })
      },
      (err) => {
        setState({ coords: null, loading: false, error: err.message })
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    )
  }

  return { ...state, request }
}
