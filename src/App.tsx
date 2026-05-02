import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, Menu } from 'lucide-react'
import Sidebar, { type View } from './components/Sidebar'
import LayerToggle from './components/LayerToggle'
import Map from './components/Map'
import BarrioScore from './components/BarrioScore'
import StatsView from './components/StatsView'
import RouteBuilder from './components/RouteBuilder'
import AboutView from './components/AboutView'
import Onboarding from './components/Onboarding'
import LandingPage from './components/LandingPage'
import { useDatasets } from './hooks/useDataset'
import { useLocale } from './hooks/useLocale'
import { t } from './i18n'
import type { LayerKey } from './types'
import type { RouteResult } from './services/routing'

const ONBOARDING_KEY = 'mp-onboarded-v1'

function App() {
  const { locale, toggle: toggleLocale } = useLocale()
  const { data, loading, error, reload } = useDatasets()
  // Always start on the landing on every page load — the project framing is part
  // of the value proposition; users decide to enter the atlas explicitly.
  const [showLanding, setShowLanding] = useState<boolean>(true)
  const [view, setView] = useState<View>('map')
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    papeleras: true,
    areas: true,
    parques: true,
    vets: false,
    air: false,
  })
  const [showHeat, setShowHeat] = useState(false)
  const [highlight, setHighlight] = useState<{ lat: number; lng: number } | null>(null)
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(ONBOARDING_KEY)
      if (!seen) setShowOnboarding(true)
    } catch {
      // ignore
    }
  }, [])

  function dismissOnboarding() {
    setShowOnboarding(false)
    try {
      localStorage.setItem(ONBOARDING_KEY, '1')
    } catch {
      // ignore
    }
  }

  function enterApp() {
    setShowLanding(false)
  }

  function toggleLayer(k: LayerKey) {
    setVisibleLayers((v) => ({ ...v, [k]: !v[k] }))
  }

  function handleLocate(coords: { lat: number; lng: number }) {
    setHighlight(coords)
    setView('map')
  }

  function handleRoute(r: RouteResult | null) {
    setRoute(r)
    if (r) setView('map')
  }

  if (showLanding) {
    return (
      <div className="h-full overflow-y-auto">
        <LandingPage locale={locale} toggleLocale={toggleLocale} onEnter={enterApp} />
      </div>
    )
  }

  return (
    <div className="h-full flex bg-stone-50">
      <Sidebar
        view={view}
        setView={setView}
        locale={locale}
        toggleLocale={toggleLocale}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar with hamburger */}
        <div className="md:hidden bg-white border-b border-stone-200 px-3 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-stone-100"
            aria-label={locale === 'es' ? 'Abrir menú' : 'Open menu'}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src="/icon.svg" alt="" className="w-7 h-7 shrink-0" />
            <div className="font-bold text-stone-900 truncate">{t(locale, 'app.title')}</div>
          </div>
        </div>

        <main className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
            <div className="flex items-center gap-3 text-stone-700">
              <Loader2 className="animate-spin" />
              <span>{t(locale, 'common.loading')}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
            <div className="text-center max-w-md p-6">
              <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
              <div className="text-stone-900 font-medium mb-1">{t(locale, 'common.error')}</div>
              <div className="text-sm text-stone-600 mb-4">{error}</div>
              <button
                type="button"
                onClick={reload}
                className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {t(locale, 'common.retry')}
              </button>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Map kept mounted to preserve MapLibre instance across views */}
            <div
              className="absolute inset-0"
              style={{ visibility: view === 'map' ? 'visible' : 'hidden' }}
              aria-hidden={view !== 'map'}
            >
              <Map
                data={data}
                visibleLayers={visibleLayers}
                showHeat={showHeat}
                highlight={highlight}
                route={route}
                locale={locale}
              />
              {view === 'map' && (
                <LayerToggle
                  visible={visibleLayers}
                  toggle={toggleLayer}
                  showHeat={showHeat}
                  toggleHeat={() => setShowHeat((s) => !s)}
                  data={data}
                  locale={locale}
                />
              )}
            </div>

            {view === 'barrio' && (
              <div className="absolute inset-0 overflow-y-auto bg-stone-50">
                <BarrioScore data={data} locale={locale} onLocate={handleLocate} />
              </div>
            )}
            {view === 'route' && (
              <div className="absolute inset-0 overflow-y-auto bg-stone-50">
                <RouteBuilder
                  data={data}
                  locale={locale}
                  onRoute={handleRoute}
                  onLocate={handleLocate}
                />
              </div>
            )}
            {view === 'stats' && (
              <div className="absolute inset-0 overflow-y-auto bg-stone-50">
                <StatsView data={data} locale={locale} />
              </div>
            )}
            {view === 'about' && (
              <div className="absolute inset-0 overflow-y-auto bg-stone-50">
                <AboutView locale={locale} />
              </div>
            )}
          </>
        )}
        </main>
      </div>

      {showOnboarding && <Onboarding locale={locale} onClose={dismissOnboarding} />}
    </div>
  )
}

export default App
