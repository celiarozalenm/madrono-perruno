import { Map as MapIcon, BarChart3, Compass, Footprints, MessageSquareHeart, Info, Globe, X } from 'lucide-react'
import type { Locale } from '../types'
import { t } from '../i18n'

export type View = 'map' | 'barrio' | 'route' | 'stats' | 'participar' | 'about'
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
  ]

  const aboutTab = { key: 'about' as View, label: t(locale, 'nav.about'), icon: <Info size={18} /> }

  function maybeCloseMobile() {
    if (window.matchMedia('(max-width: 767px)').matches) onClose()
  }

  function handleNavClick(key: View) {
    setView(key)
    if (key === 'stats') setStatsSection('overview')
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
        className={`fixed md:static top-0 left-0 h-full bg-white border-r border-stone-200 z-40 flex flex-col transition-transform duration-200 w-64 md:w-60 shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label={locale === 'es' ? 'Navegación' : 'Navigation'}
      >
        <div className="px-4 py-4 flex items-center gap-2.5 border-b border-stone-100">
          <a href="/" className="flex items-center gap-2.5 flex-1 min-w-0" aria-label={t(locale, 'app.title')}>
            <img src="/icon.svg" alt="" className="w-9 h-9 shrink-0" />
            <div className="leading-tight min-w-0">
              <div className="font-bold text-stone-900 truncate">{t(locale, 'app.title')}</div>
              <div className="text-[11px] text-stone-500 truncate">{t(locale, 'app.subtitle')}</div>
            </div>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-stone-400 hover:text-stone-700 p-1 rounded-md"
            aria-label={t(locale, 'common.close')}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Sections">
          <ul className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <li key={tab.key}>
                <button
                  type="button"
                  onClick={() => handleNavClick(tab.key)}
                  aria-current={view === tab.key ? 'page' : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    view === tab.key
                      ? 'bg-brand-500 text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="shrink-0">{tab.icon}</span>
                  <span className="flex-1 text-left">{tab.label}</span>
                </button>
                {tab.key === 'stats' && view === 'stats' && (
                  <ul className="mt-1 mb-1 ml-4 pl-3 border-l border-stone-200 flex flex-col gap-0.5">
                    {STATS_SUBSECTIONS.map((sub) => (
                      <li key={sub.id}>
                        <button
                          type="button"
                          onClick={() => handleStatsSubClick(sub.id)}
                          aria-current={statsSection === sub.id ? 'page' : undefined}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                            statsSection === sub.id
                              ? 'bg-stone-100 text-stone-900 font-medium'
                              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                          }`}
                        >
                          {t(locale, sub.labelKey)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-stone-100 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleNavClick(aboutTab.key)}
            aria-current={view === aboutTab.key ? 'page' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === aboutTab.key
                ? 'bg-brand-500 text-white'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span className="shrink-0">{aboutTab.icon}</span>
            <span className="flex-1 text-left">{aboutTab.label}</span>
          </button>
          <button
            type="button"
            onClick={toggleLocale}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100 border border-stone-200"
            aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a español'}
          >
            <Globe size={16} />
            <span className="font-mono uppercase text-xs">{locale === 'es' ? 'EN' : 'ES'}</span>
            <span className="ml-auto text-[10px] text-stone-400 uppercase">
              {locale === 'es' ? 'Idioma' : 'Language'}
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
