import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, Menu } from 'lucide-react'
import Sidebar, { type View, type StatsSection } from './components/Sidebar'
import LayerToggle from './components/LayerToggle'
import Map from './components/Map'
import BarrioScore from './components/BarrioScore'
import StatsView from './components/StatsView'
import RouteBuilder from './components/RouteBuilder'
import AboutView from './components/AboutView'
import ParticiparView from './components/ParticiparView'
import RecientesView from './components/RecientesView'
import Onboarding from './components/Onboarding'
import LandingPage from './components/LandingPage'
import { useDatasets } from './hooks/useDataset'
import { useLocale } from './hooks/useLocale'
import { useRoute } from './hooks/useRoute'
import { t } from './i18n'
import type { LayerKey } from './types'
import type { RouteResult } from './services/routing'

const ONBOARDING_KEY = 'mp-onboarded-v1'

function App() {
  const { locale, toggle: toggleLocale } = useLocale()
  const { data, loading, error, reload } = useDatasets()
  // The hash route is the source of truth for the current view. A bare URL ("/")
  // shows the landing; any "/#/<section>" URL routes straight into the atlas so
  // that sections and subsections are shareable.
  const { view: routeView, statsSection, navigate } = useRoute()
  const showLanding = routeView === null
  const view: View = routeView ?? 'map'

  function setView(v: View) {
    navigate(v, v === 'stats' ? 'overview' : statsSection)
  }
  function setStatsSection(s: StatsSection) {
    navigate('stats', s)
  }
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    papeleras: true,
    areas: true,
    parques: true,
    vets: false,
    fuentes: false,
    air: false,
    perros: false,
  })
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
    navigate('map')
  }

  function toggleLayer(k: LayerKey) {
    setVisibleLayers((v) => ({ ...v, [k]: !v[k] }))
  }

  function handleLocate(coords: { lat: number; lng: number }) {
    setHighlight(coords)
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
        statsSection={statsSection}
        setStatsSection={setStatsSection}
        locale={locale}
        toggleLocale={toggleLocale}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onGoHome={() => navigate(null)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar with hamburger */}
        <div className="md:hidden bg-stone-50 border-b border-stone-900/15 flex flex-col">
          <div className="px-3 py-2.5 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
              aria-label={locale === 'es' ? 'Abrir menú' : 'Open menu'}
            >
              <Menu size={18} />
            </button>
            <a href="/" className="flex items-center gap-2 flex-1 min-w-0" aria-label={t(locale, 'app.title')}>
              <img src="/icon.svg" alt="" className="w-8 h-8 shrink-0" />
              <div className="leading-tight min-w-0">
                <div className="font-extrabold text-stone-900 truncate text-[15px]">
                  {t(locale, 'app.title')}
                </div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-stone-500 truncate font-medium">
                  {t(locale, 'app.subtitle')}
                </div>
              </div>
            </a>
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
                highlight={highlight}
                route={route}
                locale={locale}
              />
              {view === 'map' && (
                <LayerToggle
                  visible={visibleLayers}
                  toggle={toggleLayer}
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
                <StatsView data={data} locale={locale} section={statsSection} />
              </div>
            )}
            {view === 'participar' && (
              <div className="absolute inset-0 overflow-y-auto bg-white">
                <ParticiparView data={data} locale={locale} />
              </div>
            )}
            {view === 'recientes' && (
              <div className="absolute inset-0 overflow-y-auto bg-white">
                <RecientesView locale={locale} />
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
