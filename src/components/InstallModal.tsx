import { useEffect } from 'react'
import { Smartphone, Apple, Monitor, X, Download } from 'lucide-react'
import type { Locale } from '../types'
import { t } from '../i18n'

interface Props {
  locale: Locale
  onClose: () => void
  /** Optional native install trigger — only fires on browsers that captured `beforeinstallprompt`. */
  onTriggerInstall?: () => void
  canInstallNatively?: boolean
}

export default function InstallModal({
  locale,
  onClose,
  onTriggerInstall,
  canInstallNatively,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-stone-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-2 flex items-start justify-between gap-3">
          <div>
            <h2
              id="install-title"
              className="text-2xl sm:text-[1.7rem] font-extrabold tracking-[-0.02em] text-madrono-700"
            >
              {t(locale, 'landing.install.title')}
            </h2>
            <p className="text-sm text-stone-600 mt-1.5 max-w-md">
              {t(locale, 'landing.install.lede')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 -mr-2 -mt-2 p-2 text-stone-500 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
            aria-label={t(locale, 'landing.install.modalClose')}
          >
            <X size={18} />
          </button>
        </div>

        {canInstallNatively && onTriggerInstall && (
          <div className="px-6 sm:px-8 mt-4">
            <button
              type="button"
              onClick={() => {
                onTriggerInstall()
                onClose()
              }}
              className="group bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 text-sm font-semibold rounded-full inline-flex items-center gap-2 transition-colors"
            >
              <Download size={16} />
              {locale === 'es' ? 'Instalar ahora' : 'Install now'}
            </button>
            <p className="text-[11px] text-stone-500 mt-2">
              {locale === 'es'
                ? 'Tu navegador soporta instalación con un click.'
                : 'Your browser supports one-click install.'}
            </p>
          </div>
        )}

        <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PlatformCard
            icon={<Smartphone size={20} />}
            title={t(locale, 'landing.install.android')}
            body={t(locale, 'landing.install.android.body')}
          />
          <PlatformCard
            icon={<Apple size={20} />}
            title={t(locale, 'landing.install.ios')}
            body={t(locale, 'landing.install.ios.body')}
          />
          <PlatformCard
            icon={<Monitor size={20} />}
            title={t(locale, 'landing.install.desktop')}
            body={t(locale, 'landing.install.desktop.body')}
          />
        </div>
      </div>
    </div>
  )
}

function PlatformCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-2.5">
      <span className="bg-brand-50 text-brand-600 w-9 h-9 rounded-lg flex items-center justify-center">
        {icon}
      </span>
      <div className="font-semibold text-sm text-stone-900 leading-tight">{title}</div>
      <div className="text-[13px] text-stone-600 leading-relaxed">{body}</div>
    </div>
  )
}
