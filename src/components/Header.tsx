import { Map as MapIcon, BarChart3, Compass, Footprints, Info, Languages } from 'lucide-react'
import type { Locale } from '../types'
import { t } from '../i18n'

export type View = 'map' | 'barrio' | 'route' | 'stats' | 'about'

interface Props {
  view: View
  setView: (v: View) => void
  locale: Locale
  toggleLocale: () => void
}

export default function Header({ view, setView, locale, toggleLocale }: Props) {
  const tabs: { key: View; label: string; icon: React.ReactNode }[] = [
    { key: 'map', label: t(locale, 'nav.map'), icon: <MapIcon size={16} /> },
    { key: 'barrio', label: t(locale, 'nav.barrio'), icon: <Compass size={16} /> },
    { key: 'route', label: locale === 'es' ? 'Ruta bolsa-amigable' : 'Bag-friendly route', icon: <Footprints size={16} /> },
    { key: 'stats', label: t(locale, 'nav.stats'), icon: <BarChart3 size={16} /> },
    { key: 'about', label: t(locale, 'nav.about'), icon: <Info size={16} /> },
  ]
  return (
    <header className="bg-white/95 backdrop-blur border-b border-stone-200 z-30 shadow-sm">
      <div className="px-4 py-2 flex items-center gap-3">
        <a
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label={t(locale, 'app.title')}
        >
          <img src="/icon.svg" alt="" className="w-8 h-8" />
          <div className="leading-tight hidden sm:block">
            <div className="font-bold text-base text-stone-900">{t(locale, 'app.title')}</div>
            <div className="text-[11px] text-stone-500">{t(locale, 'app.subtitle')}</div>
          </div>
        </a>

        <nav className="flex-1 overflow-x-auto" aria-label="Secciones">
          <ul className="flex gap-1 items-center">
            {tabs.map((tab) => (
              <li key={tab.key}>
                <button
                  type="button"
                  onClick={() => setView(tab.key)}
                  aria-current={view === tab.key ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    view === tab.key
                      ? 'bg-brand-500 text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={toggleLocale}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm text-stone-700 hover:bg-stone-100 shrink-0"
          aria-label={locale === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'}
        >
          <Languages size={16} />
          <span className="font-mono text-xs uppercase">{locale === 'es' ? 'EN' : 'ES'}</span>
        </button>
      </div>
    </header>
  )
}
