import { ExternalLink } from 'lucide-react'
import type { Locale } from '../types'
import { t } from '../i18n'
import { DATASETS } from '../services/madridData'

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.16c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.92 10.92 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.15v3.18c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

interface Props {
  locale: Locale
}

export default function AboutView({ locale }: Props) {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{t(locale, 'about.title')}</h1>
        <p className="text-sm text-stone-700 leading-relaxed mt-2">{t(locale, 'about.body')}</p>
      </div>

      <section>
        <h2 className="font-semibold text-stone-900 mb-3">{t(locale, 'about.datasets')}</h2>
        <ul className="space-y-2">
          {Object.entries(DATASETS).map(([key, ds]) => (
            <li
              key={key}
              className="bg-white rounded-xl border border-stone-200 p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium text-sm text-stone-900 truncate">{ds.label}</div>
                <a
                  href={ds.portalUrl}
                  target="_blank"
                  rel="noopener"
                  className="text-xs text-madrid-500 hover:text-madrid-600 hover:underline truncate inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-madrid-500 shrink-0" aria-hidden />
                  {locale === 'es' ? 'datos.madrid.es' : 'datos.madrid.es'}
                  <ExternalLink size={11} />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
              {t(locale, 'about.author')}
            </div>
            <a
              href="https://celiarozalenm.com"
              target="_blank"
              rel="noopener"
              className="text-sm text-stone-900 font-medium hover:text-brand-600 inline-flex items-center gap-1"
            >
              celiarozalenm <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <a
          href="https://github.com/celiarozalenm/madrono-perruno"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg px-3 py-2"
        >
          <GithubIcon size={16} />
          {t(locale, 'about.code')}
        </a>
      </section>

      <p className="text-xs text-stone-500 leading-relaxed">{t(locale, 'about.license')}</p>
    </div>
  )
}
