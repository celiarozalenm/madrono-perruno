import { useEffect, useState } from 'react'
import { ArrowRight, Globe, Code, Heart, Download, MapPin, Footprints, BarChart3, Wind, Dog } from 'lucide-react'
import type { Locale } from '../types'
import { t } from '../i18n'
import HeroIllustration from './HeroIllustration'
import {
  PapeleraIcon,
  AreaCaninaIcon,
  ParqueIcon,
  VetIcon,
  FuenteIcon,
  MadronoMarkIcon,
} from './icons/CustomIcons'

interface Props {
  locale: Locale
  toggleLocale: () => void
  onEnter: () => void
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STATS: {
  value: string
  key: 'papeleras' | 'areas' | 'parques' | 'vets' | 'fuentes'
}[] = [
  { value: '~6.000', key: 'papeleras' },
  { value: '150', key: 'areas' },
  { value: '200+', key: 'parques' },
  { value: '2.100+', key: 'fuentes' },
  { value: '600+', key: 'vets' },
]

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

  function goReport(e: React.MouseEvent) {
    e.preventDefault()
    window.location.hash = '#/participar'
  }

  return (
    <div className="min-h-full bg-stone-50 text-stone-900">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-5 space-y-3 sm:space-y-5">
        {/* === ROW 1 — Hero (full width) === */}
        <div className="grid grid-cols-12 gap-3 sm:gap-5">
          {/* HERO */}
          <section className="col-span-12 relative">
            {/* Top nav */}
            <header className="pt-2 flex items-center justify-between gap-4">
              <a href="/" className="flex items-center gap-2.5">
                <img src="/icon.svg" alt="" className="w-9 h-9" />
                <span className="font-extrabold tracking-tight text-madrono-700 leading-tight text-[15px]">
                  Madroño
                  <br />
                  Perruno
                </span>
              </a>
              <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-stone-700">
                <a href="#/map" className="hover:text-brand-600 transition-colors">
                  {t(locale, 'landing.bento.nav.mapa')}
                </a>
                <a href="#features" className="hover:text-brand-600 transition-colors">
                  {t(locale, 'landing.bento.nav.recursos')}
                </a>
                <a href="#/participar" className="hover:text-brand-600 transition-colors">
                  {t(locale, 'landing.bento.nav.colabora')}
                </a>
                <a href="#datos" className="hover:text-brand-600 transition-colors">
                  {t(locale, 'landing.bento.nav.datos')}
                </a>
                <a href="#/about" className="hover:text-brand-600 transition-colors">
                  {t(locale, 'landing.bento.nav.about')}
                </a>
              </nav>
              <div className="flex items-center gap-3">
                {installEvt && !installed && (
                  <button
                    type="button"
                    onClick={triggerInstall}
                    className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold text-stone-700 hover:text-brand-600 transition-colors"
                  >
                    <Download size={13} />
                    {locale === 'es' ? 'Instalar' : 'Install'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleLocale}
                  className="text-[12px] font-semibold tracking-wider text-stone-600 hover:text-brand-600 transition-colors flex items-center gap-1"
                  aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a español'}
                >
                  <Globe size={13} />
                  <span className={locale === 'es' ? 'text-brand-600' : ''}>ES</span>
                  <span className="text-stone-300">/</span>
                  <span className={locale === 'en' ? 'text-brand-600' : ''}>EN</span>
                </button>
              </div>
            </header>

            <div className="grid grid-cols-12 gap-4 pt-8 sm:pt-12 pb-2 items-center">
              <div className="col-span-12 md:col-span-5 mp-fade-up">
                <span className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 text-[11px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden />
                  Madroño Perruno
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-[-0.025em] leading-[1.02] text-madrono-700 whitespace-pre-line">
                  {t(locale, 'landing.bento.hero.headline')}
                </h1>
                <p className="text-[15px] sm:text-base text-stone-600 mt-5 max-w-md leading-relaxed">
                  {t(locale, 'landing.bento.hero.lede')}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-7">
                  <button
                    type="button"
                    onClick={onEnter}
                    className="group bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 text-sm font-semibold rounded-full inline-flex items-center gap-2 transition-colors"
                  >
                    {t(locale, 'landing.bento.hero.cta1')}
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </button>
                  <a
                    href="#/participar"
                    onClick={goReport}
                    className="bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-800 px-5 py-3 text-sm font-semibold rounded-full inline-flex items-center transition-colors"
                  >
                    {t(locale, 'landing.bento.hero.cta2')}
                  </a>
                </div>
              </div>
              <div className="col-span-12 md:col-span-7 mp-fade-up mp-fade-up-2">
                <div className="bg-stone-50 border border-stone-900/10 rounded-2xl overflow-hidden">
                  <HeroIllustration className="block" />
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* === ROW 2 — Features (full width, horizontal) === */}
        <section
          id="features"
          className="bg-stone-50 border border-stone-900/10 rounded-2xl px-6 sm:px-9 py-7 sm:py-9 relative overflow-hidden"
        >
          <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="col-span-12 lg:col-span-4">
              <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-600">
                {t(locale, 'landing.bento.features.eyebrow')}
              </div>
              <h2 className="text-[1.7rem] sm:text-[2rem] font-extrabold tracking-[-0.02em] leading-[1.05] text-madrono-700 mt-2 max-w-xs">
                {t(locale, 'landing.bento.features.title')}
              </h2>
            </div>
            <ul className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FeatureRow
                color="brand"
                icon={<PapeleraIcon size={18} />}
                label={t(locale, 'landing.bento.features.papeleras.label')}
                body={t(locale, 'landing.bento.features.papeleras.body')}
              />
              <FeatureRow
                color="madrono"
                icon={<AreaCaninaIcon size={18} />}
                label={t(locale, 'landing.bento.features.areas.label')}
                body={t(locale, 'landing.bento.features.areas.body')}
              />
              <FeatureRow
                color="verde"
                icon={<ParqueIcon size={18} />}
                label={t(locale, 'landing.bento.features.parques.label')}
                body={t(locale, 'landing.bento.features.parques.body')}
              />
              <FeatureRow
                color="brand"
                icon={<VetIcon size={18} />}
                label={t(locale, 'landing.bento.features.vets.label')}
                body={t(locale, 'landing.bento.features.vets.body')}
              />
              <FeatureRow
                color="agua"
                icon={<FuenteIcon size={18} />}
                label={t(locale, 'landing.bento.features.fuentes.label')}
                body={t(locale, 'landing.bento.features.fuentes.body')}
              />
              <FeatureRow
                color="madrono"
                icon={<Wind size={18} />}
                label={t(locale, 'landing.bento.features.air.label')}
                body={t(locale, 'landing.bento.features.air.body')}
              />
              <FeatureRow
                color="verde"
                icon={<Dog size={18} />}
                label={t(locale, 'landing.bento.features.censo.label')}
                body={t(locale, 'landing.bento.features.censo.body')}
              />
            </ul>
          </div>
        </section>

        {/* === ROW 3 — Three ways to use it (no enclosing card) === */}
        <section className="pt-2 sm:pt-4">
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-600">
              {t(locale, 'landing.bento.uses.eyebrow')}
            </div>
            <h2 className="text-[1.7rem] sm:text-[2rem] font-extrabold tracking-[-0.02em] leading-[1.05] text-madrono-700 mt-2">
              {t(locale, 'landing.bento.uses.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
            <UseCard
              href="#/barrio"
              icon={<MapPin size={20} />}
              label={t(locale, 'landing.bento.uses.barrio.label')}
              body={t(locale, 'landing.bento.uses.barrio.body')}
              cta={t(locale, 'landing.bento.uses.cta')}
            />
            <UseCard
              href="#/route"
              icon={<Footprints size={20} />}
              label={t(locale, 'landing.bento.uses.ruta.label')}
              body={t(locale, 'landing.bento.uses.ruta.body')}
              cta={t(locale, 'landing.bento.uses.cta')}
            />
            <UseCard
              href="#/stats"
              icon={<BarChart3 size={20} />}
              label={t(locale, 'landing.bento.uses.stats.label')}
              body={t(locale, 'landing.bento.uses.stats.body')}
              cta={t(locale, 'landing.bento.uses.cta')}
            />
          </div>
        </section>

        {/* === ROW 4 — Two feature cards === */}
        <div className="grid grid-cols-12 gap-3 sm:gap-5">
          {/* Card A — Colabora (verde, photo overlay) */}
          <article className="col-span-12 md:col-span-6 lg:col-span-4 bg-verde-50 rounded-2xl relative overflow-hidden min-h-[300px] lg:min-h-[340px]">
            <img
              src="/colabora-mockup.png"
              alt=""
              className="absolute right-0 bottom-0 h-[110%] w-auto object-contain object-bottom-right pointer-events-none"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-verde-50 via-verde-50/85 to-transparent" />
            <div className="relative h-full px-6 py-7 sm:px-7 sm:py-8 flex flex-col">
              <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-600">
                {t(locale, 'landing.bento.colabora.eyebrow')}
              </div>
              <h3 className="text-[1.6rem] font-extrabold tracking-[-0.02em] leading-tight text-verde-700 mt-2 whitespace-pre-line">
                {t(locale, 'landing.bento.colabora.title')}
              </h3>
              <p className="text-sm text-stone-700 mt-3 leading-relaxed max-w-[14rem]">
                {t(locale, 'landing.bento.colabora.body')}
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                <a
                  href="#/participar"
                  onClick={goReport}
                  className="inline-flex items-center gap-1.5 bg-verde-500 hover:bg-verde-600 text-white text-xs font-semibold px-3.5 py-2 rounded-full transition-colors"
                >
                  <span>👍</span>
                  {locale === 'es' ? 'Está bien' : 'Looking good'}
                </a>
                <a
                  href="#/participar"
                  onClick={goReport}
                  className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-3.5 py-2 rounded-full transition-colors"
                >
                  <span>👎</span>
                  {locale === 'es' ? 'Mal estado' : 'Needs care'}
                </a>
              </div>
            </div>
          </article>

          {/* Card B — Datos abiertos (cream/brand) */}
          <article
            id="datos"
            className="col-span-12 md:col-span-6 lg:col-span-4 bg-brand-50 rounded-2xl px-6 py-7 sm:px-7 sm:py-8 relative overflow-hidden"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-600">
              {t(locale, 'landing.bento.datos.eyebrow')}
            </div>
            <h3 className="text-[1.6rem] font-extrabold tracking-[-0.02em] leading-tight text-madrono-700 mt-2 whitespace-pre-line">
              {t(locale, 'landing.bento.datos.title')}
            </h3>
            <p className="text-sm text-stone-700 mt-3 max-w-[22rem] leading-relaxed">
              {t(locale, 'landing.bento.datos.body')}
            </p>
            <a
              href="https://github.com/celiarozalenm/madrono-perruno"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-800 hover:text-brand-600 transition-colors mt-5"
            >
              <Code size={15} />
              {t(locale, 'landing.bento.datos.cta')}
            </a>
            <MadronoMarkIcon
              size={120}
              className="absolute -right-4 -bottom-4 text-brand-500/20"
            />
          </article>

          {/* Card C — Ciudad para todos (photo background + overlay) */}
          <article className="col-span-12 md:col-span-6 lg:col-span-4 rounded-2xl overflow-hidden relative min-h-[300px] lg:min-h-[340px]">
            <img
              src="/hero-dog.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/55 to-transparent" />
            <div className="relative h-full px-6 py-7 sm:px-7 sm:py-8 flex flex-col justify-between">
              <div className="bg-white shadow-md w-14 h-14 rounded-2xl flex items-center justify-center">
                <img src="/icon.svg" alt="" className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-[1.7rem] font-extrabold tracking-[-0.025em] leading-[1.05] text-madrono-700 max-w-[8ch]">
                  {t(locale, 'landing.bento.ciudad.title')}
                </h3>
                <p className="text-sm text-stone-700 mt-3 leading-relaxed max-w-[14rem]">
                  {t(locale, 'landing.bento.ciudad.sub')}
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* === ROW 3 — Stats bar === */}
        <section className="bg-stone-50 border border-stone-900/10 rounded-2xl px-5 sm:px-7 py-5 sm:py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-5">
            {STATS.map((s) => (
              <StatItem
                key={s.key}
                value={s.value}
                label={t(locale, `landing.bento.stats.${s.key}` as const)}
                iconKey={s.key}
              />
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-xs text-stone-600">
            <span className="flex items-center gap-2">
              <img src="/icon.svg" alt="" className="w-5 h-5" />
              <span className="leading-tight">
                {t(locale, 'landing.bento.foot.proyecto')}
              </span>
            </span>
            <span className="leading-tight">
              {t(locale, 'landing.bento.foot.hecho.before')}{' '}
              <Heart
                size={12}
                className="inline-block align-[-1px] text-brand-500 fill-current mx-0.5"
                aria-hidden
              />{' '}
              {t(locale, 'landing.bento.foot.hecho.after')}{' '}
              <a
                href="https://celiarozalenm.com"
                target="_blank"
                rel="noopener"
                className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                celiarozalenm
              </a>
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}

function UseCard({
  href,
  icon,
  label,
  body,
  cta,
}: {
  href: string
  icon: React.ReactNode
  label: string
  body: string
  cta: string
}) {
  return (
    <a
      href={href}
      className="group bg-white border border-stone-200 hover:border-brand-500 rounded-xl p-5 sm:p-6 flex flex-col transition-colors"
    >
      <span
        className="shrink-0 w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors"
        aria-hidden
      >
        {icon}
      </span>
      <h3 className="font-bold text-[1.05rem] tracking-tight text-madrono-700">
        {label}
      </h3>
      <p className="text-[13.5px] text-stone-600 leading-relaxed mt-1.5 flex-1">
        {body}
      </p>
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 group-hover:gap-2.5 transition-all mt-4">
        {cta}
        <ArrowRight size={14} />
      </span>
    </a>
  )
}

function FeatureRow({
  color,
  icon,
  label,
  body,
}: {
  color: 'verde' | 'brand' | 'madrono' | 'agua'
  icon: React.ReactNode
  label: string
  body: string
}) {
  const tone = {
    verde: 'bg-verde-500 text-white',
    brand: 'bg-brand-500 text-white',
    madrono: 'bg-madrono-600 text-white',
    agua: 'bg-agua-500 text-white',
  }[color]
  return (
    <li className="flex items-start gap-3.5">
      <span
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${tone}`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="min-w-0 pt-0.5">
        <span className="block text-[11px] uppercase tracking-[0.18em] font-bold text-brand-600">
          {label}
        </span>
        <span className="block text-[13.5px] text-stone-700 leading-snug mt-0.5">
          {body}
        </span>
      </span>
    </li>
  )
}

function StatItem({
  value,
  label,
  iconKey,
}: {
  value: string
  label: string
  iconKey: 'papeleras' | 'areas' | 'parques' | 'vets' | 'fuentes'
}) {
  const icon = {
    papeleras: <PapeleraIcon size={18} className="text-brand-600" />,
    areas: <AreaCaninaIcon size={18} className="text-madrono-600" />,
    parques: <ParqueIcon size={18} className="text-madrono-600" />,
    vets: <VetIcon size={18} className="text-brand-600" />,
    fuentes: <FuenteIcon size={18} className="text-agua-500" />,
  }[iconKey]
  return (
    <div className="flex items-center gap-2.5">
      <span className="shrink-0">{icon}</span>
      <span className="leading-tight">
        <span className="block text-xl font-extrabold tabular-nums tracking-tight text-stone-900">
          {value}
        </span>
        <span className="block text-[11px] text-stone-500">{label}</span>
      </span>
    </div>
  )
}
