import { Trash2, Dog, Trees, Stethoscope, Flame } from 'lucide-react'
import type { Datasets, LayerKey, Locale } from '../types'
import { t } from '../i18n'

interface Props {
  visible: Record<LayerKey, boolean>
  toggle: (k: LayerKey) => void
  showHeat: boolean
  toggleHeat: () => void
  data: Datasets
  locale: Locale
}

const LAYER_COLOR: Record<LayerKey, string> = {
  papeleras: '#ed731f',
  areas: '#2f7d3a',
  parques: '#5b3a1e',
  vets: '#0e7490',
}

export default function LayerToggle({
  visible,
  toggle,
  showHeat,
  toggleHeat,
  data,
  locale,
}: Props) {
  const vetsWithCoords = data.vets.filter(
    (v) => typeof v.lat === 'number' && typeof v.lng === 'number',
  ).length
  const items: { key: LayerKey; icon: React.ReactNode; count: number }[] = [
    { key: 'papeleras', icon: <Trash2 size={16} />, count: data.papeleras.length },
    { key: 'areas', icon: <Dog size={16} />, count: data.areas.length },
    { key: 'parques', icon: <Trees size={16} />, count: data.parques.length },
    { key: 'vets', icon: <Stethoscope size={16} />, count: vetsWithCoords },
  ]
  return (
    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-stone-200 p-2 z-10 max-w-[260px]">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 px-2 pt-1 pb-1">
        {locale === 'es' ? 'Capas' : 'Layers'}
      </div>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const labelKey = `layer.${item.key}` as const
          const disabled = false
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => !disabled && toggle(item.key)}
                disabled={disabled}
                aria-pressed={visible[item.key]}
                title={
                  disabled
                    ? locale === 'es'
                      ? 'Solo distrito (sin coordenadas)'
                      : 'District only (no coords)'
                    : undefined
                }
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  disabled
                    ? 'text-stone-400 cursor-not-allowed'
                    : visible[item.key]
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-white shadow-sm"
                  style={{ background: LAYER_COLOR[item.key] }}
                  aria-hidden
                />
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1 text-left truncate">{t(locale, labelKey)}</span>
                <span className="text-[11px] text-stone-500 tabular-nums">{item.count}</span>
              </button>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={toggleHeat}
            aria-pressed={showHeat}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors mt-1 border-t border-stone-100 pt-2 ${
              showHeat ? 'bg-stone-100 text-stone-900' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Flame size={16} className="shrink-0" />
            <span className="flex-1 text-left">{t(locale, 'layer.heat')}</span>
            <span className="text-[11px] text-stone-500 uppercase">
              {showHeat ? (locale === 'es' ? 'on' : 'on') : 'off'}
            </span>
          </button>
        </li>
      </ul>
    </div>
  )
}
