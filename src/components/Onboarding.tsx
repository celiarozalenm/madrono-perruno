import { X } from 'lucide-react'
import type { Locale } from '../types'
import { t } from '../i18n'

interface Props {
  locale: Locale
  onClose: () => void
}

export default function Onboarding({ locale, onClose }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t(locale, 'common.close')}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1 rounded-md"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <img src="/icon.svg" alt="" className="w-12 h-12" />
          <div>
            <h2 id="onboarding-title" className="font-bold text-lg leading-tight">
              {t(locale, 'onboarding.title')}
            </h2>
            <p className="text-xs text-stone-500">{t(locale, 'app.subtitle')}</p>
          </div>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">{t(locale, 'onboarding.p1')}</p>
        <p className="text-sm text-stone-700 leading-relaxed mt-3">{t(locale, 'onboarding.p2')}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium mt-5"
        >
          {t(locale, 'onboarding.cta')}
        </button>
      </div>
    </div>
  )
}
