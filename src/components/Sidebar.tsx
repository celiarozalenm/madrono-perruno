import { useEffect, useState } from 'react'
import { Map as MapIcon, BarChart3, Compass, Footprints, MessageSquareHeart, Info, Globe, ArrowLeft, ChevronDown, X, Activity } from 'lucide-react'
import type { Locale } from '../types'
import { t } from '../i18n'

export type View = 'map' | 'barrio' | 'route' | 'stats' | 'participar' | 'recientes' | 'about'
export type StatsSection = 'overview' | 'ranking' | 'needs' | 'proteccion'

interface Props {
  view: View
  setView: (v: View) => void
  statsSection: StatsSection
  setStatsSection: (s: StatsSection) => void
  locale: Locale
  toggleLocale: () => void
  open: boolean
  onClose: () => void
  onGoHome: () => void
}

const STATS_SUBSECTIONS: { id: StatsSection; labelKey: 'stats.sub.overview' | 'stats.sub.ranking' | 'stats.sub.needs' | 'stats.sub.proteccion' }[] = [
  { id: 'overview', labelKey: 'stats.sub.overview' },
  { id: 'ranking', labelKey: 'stats.sub.ranking' },
  { id: 'needs', labelKey: 'stats.sub.needs' },
  { id: 'proteccion', labelKey: 'stats.sub.proteccion' },
]

export default function Sidebar({
  view,
  setView,
  statsSection,
  setStatsSection,
  locale,
  toggleLocale,
  open,
  onClose,
  onGoHome,
}: Props) {
  const tabs: { key: View; label: string; icon: React.ReactNode }[] = [
    { key: 'map', label: t(locale, 'nav.map'), icon: <MapIcon size={18} /> },
    { key: 'barrio', label: t(locale, 'nav.barrio'), icon: <Compass size={18} /> },
    {
      key: 'route',
      label: locale === 'es' ? 'Ruta bolsa-amigable' : 'Bag-friendly route',
      icon: <Footprints size={18} />,
    },
    { key: 'stats', label: t(locale, 'nav.stats'), icon: <BarChart3 size={18} /> },
    { key: 'participar', label: t(locale, 'nav.participar'), icon: <MessageSquareHeart size={18} /> },
    { key: 'recientes', label: t(locale, 'nav.recientes'), icon: <Activity size={18} /> },
  ]

  const aboutTab = { key: 'about' as View, label: t(locale, 'nav.about'), icon: <Info size={18} /> }

  // Subsections of "Estadísticas" can be collapsed by the user. Auto-open
  // whenever the user lands on a stats page so deep links to /stats/needs
  // never appear with the parent collapsed.
  const [statsOpen, setStatsOpen] = useState(view === 'stats')
  useEffect(() => {
    if (view === 'stats') setStatsOpen(true)
  }, [view])

  function maybeCloseMobile() {
    if (window.matchMedia('(max-width: 767px)').matches) onClose()
  }

  function handleNavClick(key: View) {
    setView(key)
    if (key === 'stats') {
      setStatsSection('overview')
      setStatsOpen(true)
    }
    maybeCloseMobile()
  }

  function handleStatsSubClick(id: StatsSection) {
    if (view !== 'stats') setView('stats')
    setStatsSection(id)
    maybeCloseMobile()
  }

  return (
    <>
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed md:static top-0 left-0 h-full bg-stone-50 border-r border-stone-900/15 z-40 flex flex-col transition-transform duration-200 w-64 max-w-[85vw] md:max-w-none shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label={locale === 'es' ? 'Navegación' : 'Navigation'}
      >
        <div className="px-4 pt-4 pb-3 flex items-center gap-2.5 border-b border-stone-900/10">
          <a href="/" className="flex items-center gap-2.5 flex-1 min-w-0 group" aria-label={t(locale, 'app.title')}>
            <img
              src="/icon.svg"
              alt=""
              className="w-9 h-9 shrink-0 transition-transform duration-300 group-hover:rotate-[-6deg]"
            />
            <div className="min-w-0">
              <div className="font-extrabold tracking-tight text-stone-900 truncate text-[15px] leading-tight">
                {t(locale, 'app.title')}
              </div>
            </div>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-stone-400 hover:text-stone-900 p-2 -mr-1 transition-colors"
            aria-label={t(locale, 'common.close')}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pt-3 pb-3" aria-label="Sections">
          <ul className="flex flex-col">
            {tabs.map((tab) => {
              const active = view === tab.key
              const isStats = tab.key === 'stats'
              return (
                <li key={tab.key}>
                  <div
                    className={`group relative w-full flex items-stretch text-sm font-semibold tracking-tight transition-all duration-200 ${
                      active
                        ? 'text-stone-900 bg-stone-100'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70'
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1.5 bottom-1.5 w-1 transition-all duration-200 ${
                        active ? 'bg-brand-500' : 'bg-transparent group-hover:bg-stone-300'
                      }`}
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => handleNavClick(tab.key)}
                      aria-current={active ? 'page' : undefined}
                      className="flex-1 flex items-center gap-2.5 pl-4 pr-2 py-2.5 text-left"
                    >
                      <span className="shrink-0 text-stone-700 group-hover:text-stone-900">{tab.icon}</span>
                      <span className="flex-1 text-left">{tab.label}</span>
                      {active && !isStats && (
                        <span className="text-brand-500 text-xs">●</span>
                      )}
                    </button>
                    {isStats && (
                      <button
                        type="button"
                        onClick={() => setStatsOpen((o) => !o)}
                        aria-expanded={statsOpen}
                        aria-label={
                          statsOpen
                            ? locale === 'es' ? 'Ocultar subsecciones' : 'Hide subsections'
                            : locale === 'es' ? 'Mostrar subsecciones' : 'Show subsections'
                        }
                        className="px-2.5 text-stone-500 hover:text-stone-900 transition-colors"
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            statsOpen ? '' : '-rotate-90'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {isStats && statsOpen && (
                    <ul className="ml-8 mt-1 mb-2 border-l border-stone-300 flex flex-col">
                      {STATS_SUBSECTIONS.map((sub) => {
                        const subActive = statsSection === sub.id
                        return (
                          <li key={sub.id}>
                            <button
                              type="button"
                              onClick={() => handleStatsSubClick(sub.id)}
                              aria-current={subActive ? 'page' : undefined}
                              className={`relative w-full text-left pl-4 pr-2.5 py-1.5 text-xs transition-colors ${
                                subActive
                                  ? 'text-stone-900 font-semibold'
                                  : 'text-stone-500 hover:text-stone-900'
                              }`}
                            >
                              <span
                                className={`absolute -left-px top-1.5 bottom-1.5 w-px transition-colors ${
                                  subActive ? 'bg-brand-500' : 'bg-transparent'
                                }`}
                                aria-hidden
                              />
                              {t(locale, sub.labelKey)}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="px-2 pt-2 pb-4 border-t border-stone-900/10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => handleNavClick(aboutTab.key)}
            aria-current={view === aboutTab.key ? 'page' : undefined}
            className={`group relative w-full flex items-center gap-2.5 pl-4 pr-3 py-2.5 text-sm font-semibold transition-colors ${
              view === aboutTab.key
                ? 'text-stone-900 bg-stone-100'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <span
              className={`absolute left-0 top-1.5 bottom-1.5 w-1 transition-colors ${
                view === aboutTab.key ? 'bg-brand-500' : 'bg-transparent group-hover:bg-stone-300'
              }`}
              aria-hidden
            />
            <span className="shrink-0">{aboutTab.icon}</span>
            <span className="flex-1 text-left">{aboutTab.label}</span>
          </button>
          <div className="mt-2 mx-2 pt-3 border-t border-stone-200 flex items-center justify-between gap-3 text-[12px] font-medium">
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 text-stone-500 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft size={12} />
              {locale === 'es' ? 'Inicio' : 'Home'}
            </button>
            <button
              type="button"
              onClick={toggleLocale}
              className="inline-flex items-center gap-1 tracking-wider text-stone-500 hover:text-brand-600 transition-colors"
              aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a español'}
            >
              <Globe size={12} />
              <span className={locale === 'es' ? 'text-brand-600' : ''}>ES</span>
              <span className="text-stone-300">/</span>
              <span className={locale === 'en' ? 'text-brand-600' : ''}>EN</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
