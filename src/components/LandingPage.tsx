import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Compass,
  Footprints,
  BarChart3,
  Map as MapIcon,
  Smartphone,
  Apple,
  Monitor,
  Download,
  ExternalLink,
  Users,
  Globe,
  MapPin,
  MessageSquare,
} from 'lucide-react'
import type { Locale } from '../types'
import { t } from '../i18n'
import { DATASETS } from '../services/madridData'

interface Props {
  locale: Locale
  toggleLocale: () => void
  onEnter: () => void
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function LandingPage({ locale, toggleLocale, onEnter }: Props) {
  const [installEvt, setInstallEvt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvt(e as InstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onInstalled)
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function triggerInstall() {
    if (!installEvt) return
    await installEvt.prompt()
    const choice = await installEvt.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setInstallEvt(null)
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-orange-50 via-stone-50 to-white">
      {/* Top bar */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="" className="w-9 h-9" />
          <div className="leading-tight">
            <div className="font-bold text-stone-900">{t(locale, 'app.title')}</div>
            <div className="text-[11px] text-stone-500">{t(locale, 'app.subtitle')}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleLocale}
          className="text-sm text-stone-700 hover:bg-white px-3 py-1.5 rounded-lg border border-stone-200 flex items-center gap-1.5"
          aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a español'}
        >
          <Globe size={16} />
          <span className="font-mono uppercase">{locale === 'es' ? 'EN' : 'ES'}</span>
        </button>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-6 pt-6 pb-12 max-w-4xl mx-auto text-center">
        <div className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
          {t(locale, 'landing.hero.tag')}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight tracking-tight">
          {t(locale, 'app.title')}
          <span className="block text-brand-500 mt-1">{t(locale, 'app.subtitle')}</span>
        </h1>
        <p className="text-base sm:text-lg text-stone-700 mt-5 max-w-2xl mx-auto leading-relaxed">
          {t(locale, 'landing.hero.lede')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={onEnter}
            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl text-base font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/30"
          >
            {t(locale, 'landing.hero.cta')}
            <ArrowRight size={18} />
          </button>
          <a
            href="https://github.com/celiarozalenm/madrono-perruno"
            target="_blank"
            rel="noopener"
            className="border border-stone-300 hover:bg-white text-stone-800 px-6 py-3 rounded-xl text-base font-medium flex items-center gap-2"
          >
            {t(locale, 'landing.hero.cta2')}
            <ExternalLink size={16} />
          </a>
        </div>
      </section>

      {/* Photo banner */}
      <section className="px-4 sm:px-6 pb-2 max-w-5xl mx-auto">
        <figure className="relative rounded-3xl overflow-hidden shadow-xl">
          <img
            src="/hero.jpg"
            alt={
              locale === 'es'
                ? 'Persona con perro recogiendo una bolsa de una papelera con dispensador en una calle de Madrid'
                : 'Person with dog taking a bag from a dispenser bin on a Madrid street'
            }
            className="w-full h-[260px] sm:h-[380px] object-cover"
            loading="lazy"
          />
          <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent text-white px-5 sm:px-8 py-5 sm:py-6">
            <p className="text-sm sm:text-base font-medium leading-snug max-w-2xl">
              {t(locale, 'landing.photo.caption')}
            </p>
          </figcaption>
        </figure>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 text-center mb-10">
          {t(locale, 'landing.what.title')}
        </h2>

        {/* Hero feature: collaborative reports */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 sm:p-8 text-white mb-4 shadow-xl shadow-brand-500/20">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur p-3 rounded-xl shrink-0">
              <Users size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-block bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
                {t(locale, 'landing.what.f5.badge')}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                {t(locale, 'landing.what.f5.title')}
              </h3>
              <p className="text-sm sm:text-base text-white/90 mt-2 leading-relaxed">
                {t(locale, 'landing.what.f5.body')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureCard
            icon={<MapIcon size={24} />}
            color="#ed731f"
            title={t(locale, 'landing.what.f1.title')}
            body={t(locale, 'landing.what.f1.body')}
          />
          <FeatureCard
            icon={<Compass size={24} />}
            color="#2f7d3a"
            title={t(locale, 'landing.what.f2.title')}
            body={t(locale, 'landing.what.f2.body')}
          />
          <FeatureCard
            icon={<Footprints size={24} />}
            color="#5b3a1e"
            title={t(locale, 'landing.what.f3.title')}
            body={t(locale, 'landing.what.f3.body')}
          />
          <FeatureCard
            icon={<BarChart3 size={24} />}
            color="#0e7490"
            title={t(locale, 'landing.what.f4.title')}
            body={t(locale, 'landing.what.f4.body')}
          />
        </div>
      </section>

      {/* Help your neighborhood — civic loop */}
      <section className="px-4 sm:px-6 py-12 max-w-4xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 text-center">
            {t(locale, 'landing.help.title')}
          </h2>
          <p className="text-stone-700 text-center mt-3 max-w-2xl mx-auto leading-relaxed">
            {t(locale, 'landing.help.lede')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="bg-white rounded-xl border border-amber-200 p-5">
              <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mb-3">
                <MapPin size={20} />
              </div>
              <h3 className="font-semibold text-stone-900">
                {t(locale, 'landing.help.bags.title')}
              </h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                {t(locale, 'landing.help.bags.body')}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-5">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-3">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-semibold text-stone-900">
                {t(locale, 'landing.help.parks.title')}
              </h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                {t(locale, 'landing.help.parks.body')}
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-madrid-600 text-center mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
            {t(locale, 'landing.help.loop')}
          </p>
          <div className="flex justify-center mt-7">
            <button
              type="button"
              onClick={onEnter}
              className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl text-base font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/30"
            >
              {t(locale, 'landing.help.cta')}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Datasets */}
      <section className="px-4 sm:px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 text-center">
          {t(locale, 'landing.data.title')}
        </h2>
        <p className="text-stone-600 text-center mt-2 max-w-2xl mx-auto">
          {t(locale, 'landing.data.lede')}
        </p>
        <ul className="mt-8 space-y-2">
          {Object.entries(DATASETS).map(([key, ds]) => (
            <li
              key={key}
              className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-stone-900 truncate">{ds.label}</div>
                <a
                  href={ds.portalUrl}
                  target="_blank"
                  rel="noopener"
                  className="text-xs text-madrid-500 hover:text-madrid-600 hover:underline inline-flex items-center gap-1.5 mt-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-madrid-500 shrink-0" aria-hidden />
                  datos.madrid.es
                  <ExternalLink size={11} />
                </a>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-madrid-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-madrid-500" aria-hidden />
          <span>
            {locale === 'es'
              ? 'Datos: Ayuntamiento de Madrid · Licencia abierta'
              : 'Data: Madrid City Council · Open licence'}
          </span>
        </div>
      </section>

      {/* Privacy */}
      <section className="px-4 sm:px-6 py-10 max-w-3xl mx-auto">
        <div className="bg-stone-100 border border-stone-200 rounded-2xl p-6 sm:p-7 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-700 bg-brand-100 px-3 py-1 rounded-full mb-3">
            🔒 {locale === 'es' ? 'Privacidad' : 'Privacy'}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            {t(locale, 'landing.privacy.title')}
          </h2>
          <p className="text-sm text-stone-700 mt-3 leading-relaxed">
            {t(locale, 'landing.privacy.body')}
          </p>
        </div>
      </section>

      {/* Install instructions */}
      <section className="px-4 sm:px-6 py-12 bg-stone-900 text-stone-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            {t(locale, 'landing.install.title')}
          </h2>
          <p className="text-stone-400 text-center mt-2 max-w-2xl mx-auto">
            {t(locale, 'landing.install.lede')}
          </p>
          {installEvt && !installed && (
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={triggerInstall}
                className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 mx-auto"
              >
                <Download size={18} />
                {locale === 'es' ? 'Instalar ahora' : 'Install now'}
              </button>
            </div>
          )}
          {installed && (
            <div className="text-center mt-6 text-green-400 text-sm">
              {locale === 'es' ? '✓ App instalada' : '✓ App installed'}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            <InstallCard
              icon={<Smartphone />}
              title={t(locale, 'landing.install.android')}
              body={t(locale, 'landing.install.android.body')}
            />
            <InstallCard
              icon={<Apple />}
              title={t(locale, 'landing.install.ios')}
              body={t(locale, 'landing.install.ios.body')}
            />
            <InstallCard
              icon={<Monitor />}
              title={t(locale, 'landing.install.desktop')}
              body={t(locale, 'landing.install.desktop.body')}
            />
          </div>
        </div>
      </section>

      {/* Final CTA + Footer */}
      <section className="px-4 sm:px-6 py-12 text-center">
        <button
          type="button"
          onClick={onEnter}
          className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/30 mx-auto"
        >
          {t(locale, 'landing.hero.cta')}
          <ArrowRight size={20} />
        </button>
      </section>

      <footer className="px-4 sm:px-6 py-8 border-t border-stone-200 text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs text-madrid-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-madrid-500" aria-hidden />
          {t(locale, 'landing.foot.tag')}
        </div>
        <div className="text-xs text-stone-500">
          {t(locale, 'landing.foot.author')}{' '}
          <a
            href="https://celiarozalenm.com"
            target="_blank"
            rel="noopener"
            className="text-brand-600 hover:underline"
          >
            celiarozalenm
          </a>
          {' · '}
          <a
            href="https://github.com/celiarozalenm/madrono-perruno"
            target="_blank"
            rel="noopener"
            className="text-brand-600 hover:underline"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  color,
  title,
  body,
}: {
  icon: React.ReactNode
  color: string
  title: string
  body: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:border-brand-300 transition-colors">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-3"
        style={{ background: color }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-stone-900 mb-1">{title}</h3>
      <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
    </div>
  )
}

function InstallCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="bg-stone-800 rounded-xl p-4">
      <div className="text-brand-400 mb-2">{icon}</div>
      <div className="font-semibold text-stone-100">{title}</div>
      <div className="text-sm text-stone-400 mt-1">{body}</div>
    </div>
  )
}
