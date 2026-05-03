import { useState } from 'react'
import { Trash2, Dog, Trees, Stethoscope, Wind, Droplet, ChevronDown, ChevronUp } from 'lucide-react'
import type { Datasets, LayerKey, Locale } from '../types'
import { t } from '../i18n'

interface Props {
  visible: Record<LayerKey, boolean>
  toggle: (k: LayerKey) => void
  data: Datasets
  locale: Locale
}

const LAYER_COLOR: Record<LayerKey, string> = {
  papeleras: '#ed731f',
  areas: '#3d6e3a',
  parques: '#5b3a1e',
  vets: '#3a5a6e',
  fuentes: '#2f6e8c',
  air: '#78716c',
  perros: '#7a3b14',
}

export default function LayerToggle({
  visible,
  toggle,
  data,
  locale,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const vetsWithCoords = data.vets.filter(
    (v) => typeof v.lat === 'number' && typeof v.lng === 'number',
  ).length
  const totalPerros = data.perros?.distritos.reduce((s, d) => s + d.perros, 0) ?? 0
  const items: { key: LayerKey; icon: React.ReactNode; count: number }[] = [
    { key: 'papeleras', icon: <Trash2 size={16} />, count: data.papeleras.length },
    { key: 'areas', icon: <Dog size={16} />, count: data.areas.length },
    { key: 'parques', icon: <Trees size={16} />, count: data.parques.length },
    { key: 'vets', icon: <Stethoscope size={16} />, count: vetsWithCoords },
    { key: 'fuentes', icon: <Droplet size={16} />, count: data.fuentes?.length ?? 0 },
    { key: 'air', icon: <Wind size={16} />, count: data.air?.length ?? 0 },
    { key: 'perros', icon: <Dog size={16} />, count: totalPerros },
  ]
  const titleLabel = locale === 'es' ? 'Capas' : 'Layers'
  const toggleLabel = collapsed
    ? locale === 'es' ? 'Mostrar capas' : 'Show layers'
    : locale === 'es' ? 'Ocultar capas' : 'Hide layers'
  return (
    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-stone-200 p-2 z-10 max-w-[calc(100vw-1.5rem)] sm:max-w-[260px]">
      <div className="flex items-center justify-between px-2 pt-1 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
          {titleLabel}
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={toggleLabel}
          title={toggleLabel}
          className="text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded p-1 -m-1 transition-colors"
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
      {!collapsed && (
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const labelKey = `layer.${item.key}` as const
          const checked = visible[item.key]
          return (
            <li key={item.key}>
              <div
                role="presentation"
                onClick={() => toggle(item.key)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                  checked ? 'text-stone-900' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: LAYER_COLOR[item.key] }}
                  aria-hidden
                />
                <span className="shrink-0 text-stone-500">{item.icon}</span>
                <span className="flex-1 text-left truncate">{t(locale, labelKey)}</span>
                <span className="text-[11px] text-stone-500 tabular-nums mr-1">{item.count}</span>
                <ToggleSwitch
                  checked={checked}
                  onChange={() => toggle(item.key)}
                  ariaLabel={t(locale, labelKey)}
                />
              </div>
            </li>
          )
        })}
      </ul>
      )}
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onChange()
      }}
      className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 ${
        checked ? 'bg-brand-500' : 'bg-stone-300'
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-3.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
