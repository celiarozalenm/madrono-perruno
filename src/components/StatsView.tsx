import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Map as MapIcon, BarChart3 } from 'lucide-react'
import type { Datasets, DistrictAggregate, Locale } from '../types'
import { t } from '../i18n'
import { aggregateByDistrict } from '../services/scoring'
import DistrictChoropleth from './DistrictChoropleth'

interface Props {
  data: Datasets
  locale: Locale
}

type Metric = 'papeleras' | 'areasCaninas' | 'parques'
type NeedsField = 'papeleras' | 'areasCaninas' | 'parques'

type DisplayMode = 'map' | 'bars'

const NEEDS_LABEL_KEY: Record<
  NeedsField,
  'stats.needs.metric.papeleras' | 'stats.needs.metric.areas' | 'stats.needs.metric.parques'
> = {
  papeleras: 'stats.needs.metric.papeleras',
  areasCaninas: 'stats.needs.metric.areas',
  parques: 'stats.needs.metric.parques',
}

export default function StatsView({ data, locale }: Props) {
  const aggregates = useMemo(() => aggregateByDistrict(data), [data])
  const [metric, setMetric] = useState<Metric>('papeleras')
  const [mode, setMode] = useState<DisplayMode>('map')
  const [needsField, setNeedsField] = useState<NeedsField>('papeleras')

  const sorted = useMemo(
    () => [...aggregates].sort((a, b) => b[metric] - a[metric]),
    [aggregates, metric],
  )

  const colorByMetric: Record<Metric, string> = {
    papeleras: '#ed731f',
    areasCaninas: '#2f7d3a',
    parques: '#5b3a1e',
  }
  const labelByMetric: Record<Metric, string> = {
    papeleras: t(locale, 'stats.papelerasRanking'),
    areasCaninas: t(locale, 'stats.areasRanking'),
    parques: t(locale, 'stats.parquesRanking'),
  }

  const totalPapeleras = aggregates.reduce((s, a) => s + a.papeleras, 0)
  const totalAreas = aggregates.reduce((s, a) => s + a.areasCaninas, 0)
  const totalParques = aggregates.reduce((s, a) => s + a.parques, 0)
  const totalPerros = aggregates.reduce((s, a) => s + a.perros, 0)

  const numFmt = useMemo(
    () => new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US'),
    [locale],
  )

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{t(locale, 'stats.title')}</h1>
        <p className="text-sm text-stone-600 mt-1">
          {locale === 'es'
            ? `${aggregates.length} distritos analizados con datos del Portal de Datos Abiertos del Ayuntamiento de Madrid.`
            : `${aggregates.length} districts analysed with data from Madrid City Council Open Data Portal.`}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label={t(locale, 'stats.perros')}
          value={totalPerros}
          color="#1f4d7a"
        />
        <KPICard
          label={t(locale, 'layer.papeleras')}
          value={totalPapeleras}
          color="#ed731f"
        />
        <KPICard label={t(locale, 'layer.areas')} value={totalAreas} color="#2f7d3a" />
        <KPICard label={t(locale, 'layer.parques')} value={totalParques} color="#5b3a1e" />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-stone-900 text-sm sm:text-base flex-1">
            {labelByMetric[metric]}
          </h2>
          <div className="flex bg-stone-100 rounded-lg p-1 text-xs">
            {(['papeleras', 'areasCaninas', 'parques'] as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                aria-pressed={metric === m}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  metric === m
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {m === 'papeleras'
                  ? locale === 'es'
                    ? 'Papeleras'
                    : 'Bins'
                  : m === 'areasCaninas'
                  ? locale === 'es'
                    ? 'Áreas'
                    : 'Areas'
                  : locale === 'es'
                  ? 'Parques'
                  : 'Parks'}
              </button>
            ))}
          </div>
          <div className="flex bg-stone-100 rounded-lg p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode('map')}
              aria-pressed={mode === 'map'}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                mode === 'map'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapIcon size={13} />
              {locale === 'es' ? 'Mapa' : 'Map'}
            </button>
            <button
              type="button"
              onClick={() => setMode('bars')}
              aria-pressed={mode === 'bars'}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                mode === 'bars'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 size={13} />
              {locale === 'es' ? 'Lista' : 'List'}
            </button>
          </div>
        </div>

        {mode === 'map' && (
          <DistrictChoropleth
            metric={metric}
            aggregates={aggregates}
            locale={locale}
            metricLabel={labelByMetric[metric]}
          />
        )}

        {mode === 'bars' && (
        <div className="h-[460px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
              <XAxis type="number" stroke="#78716c" fontSize={12} />
              <YAxis
                type="category"
                dataKey="distrito"
                stroke="#44403c"
                fontSize={12}
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e7e5e4',
                  fontSize: 13,
                }}
                formatter={(value) => [
                  Number(value).toLocaleString(locale === 'es' ? 'es-ES' : 'en-US'),
                  '',
                ]}
              />
              <Bar dataKey={metric} radius={[0, 4, 4, 0]}>
                {sorted.map((_, idx) => (
                  <Cell key={idx} fill={colorByMetric[metric]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </div>

      <NeedsPanel
        aggregates={aggregates}
        year={data.perros.year}
        field={needsField}
        onFieldChange={setNeedsField}
        locale={locale}
        numFmt={numFmt}
      />
    </div>
  )
}

interface NeedsRow {
  distrito: string
  perros: number
  recurso: number
  ratio: number | null
}

function NeedsPanel({
  aggregates,
  year,
  field,
  onFieldChange,
  locale,
  numFmt,
}: {
  aggregates: DistrictAggregate[]
  year: number | null
  field: NeedsField
  onFieldChange: (f: NeedsField) => void
  locale: Locale
  numFmt: Intl.NumberFormat
}) {
  const rowsWithPerros = useMemo(
    () => aggregates.filter((a) => a.perros > 0),
    [aggregates],
  )

  const rows: NeedsRow[] = useMemo(() => {
    const data = rowsWithPerros.map((a) => {
      const recurso = a[field]
      return {
        distrito: a.distrito,
        perros: a.perros,
        recurso,
        ratio: recurso > 0 ? a.perros / recurso : null,
      }
    })
    return data.sort((a, b) => {
      if (a.ratio === null && b.ratio === null) return b.perros - a.perros
      if (a.ratio === null) return -1
      if (b.ratio === null) return 1
      return b.ratio - a.ratio
    })
  }, [rowsWithPerros, field])

  const ratios = useMemo(
    () => rows.map((r) => r.ratio).filter((r): r is number => r !== null),
    [rows],
  )
  const highCutoff = ratios.length ? quantile(ratios, 0.66) : 0
  const midCutoff = ratios.length ? quantile(ratios, 0.33) : 0

  const titleTpl = t(locale, 'stats.needs.lede')
  const lede = year
    ? titleTpl.replace('{year}', String(year))
    : titleTpl.replace(' ({year})', '')

  if (!rowsWithPerros.length) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5">
        <h2 className="font-semibold text-stone-900 text-sm sm:text-base">
          {t(locale, 'stats.needs.title')}
        </h2>
        <p className="text-sm text-stone-500 mt-2">{t(locale, 'stats.needs.empty')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 space-y-4">
      <div className="space-y-1">
        <h2 className="font-semibold text-stone-900 text-sm sm:text-base">
          {t(locale, 'stats.needs.title')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600">{lede}</p>
      </div>

      <div className="flex bg-stone-100 rounded-lg p-1 text-xs flex-wrap w-fit">
        {(['papeleras', 'areasCaninas', 'parques'] as NeedsField[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFieldChange(f)}
            aria-pressed={field === f}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              field === f
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t(locale, NEEDS_LABEL_KEY[f])}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-stone-500 text-xs uppercase tracking-wide">
              <th className="px-3 py-2 font-medium">
                {t(locale, 'stats.needs.col.distrito')}
              </th>
              <th className="px-3 py-2 font-medium text-right tabular-nums">
                {t(locale, 'stats.needs.col.perros')}
              </th>
              <th className="px-3 py-2 font-medium text-right tabular-nums">
                {t(locale, 'stats.needs.col.recurso')}
              </th>
              <th className="px-3 py-2 font-medium text-right tabular-nums">
                {t(locale, 'stats.needs.col.ratio')}
              </th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const priority = ratioPriority(r.ratio, highCutoff, midCutoff)
              const ratioLabel =
                r.ratio === null
                  ? t(locale, 'stats.needs.unavailable')
                  : numFmt.format(Math.round(r.ratio))
              return (
                <tr key={r.distrito} className="border-t border-stone-100">
                  <td className="px-3 py-2 font-medium text-stone-900">{r.distrito}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-stone-700">
                    {numFmt.format(r.perros)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-stone-700">
                    {numFmt.format(r.recurso)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-stone-900">
                    {ratioLabel}
                  </td>
                  <td className="px-3 py-2">
                    <PriorityBadge level={priority} locale={locale} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-stone-500 leading-relaxed">
        {t(locale, 'stats.needs.note')}
      </p>
    </div>
  )
}

type PriorityLevel = 'high' | 'mid' | 'low'

function ratioPriority(
  ratio: number | null,
  highCutoff: number,
  midCutoff: number,
): PriorityLevel {
  if (ratio === null) return 'high'
  if (ratio >= highCutoff) return 'high'
  if (ratio >= midCutoff) return 'mid'
  return 'low'
}

function PriorityBadge({
  level,
  locale,
}: {
  level: PriorityLevel
  locale: Locale
}) {
  const styles: Record<PriorityLevel, string> = {
    high: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    mid: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    low: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  }
  const labels: Record<PriorityLevel, string> = {
    high: t(locale, 'stats.needs.priority.high'),
    mid: t(locale, 'stats.needs.priority.mid'),
    low: t(locale, 'stats.needs.priority.low'),
  }
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${styles[level]}`}
    >
      {labels[level]}
    </span>
  )
}

function quantile(values: number[], q: number): number {
  if (!values.length) return 0
  const arr = [...values].sort((a, b) => a - b)
  const pos = (arr.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  if (arr[base + 1] !== undefined) {
    return arr[base] + rest * (arr[base + 1] - arr[base])
  }
  return arr[base]
}

function KPICard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div
        className="w-2 h-8 rounded-full mb-2"
        style={{ background: color }}
        aria-hidden
      />
      <div className="text-2xl sm:text-3xl font-bold tabular-nums text-stone-900">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-stone-500 mt-1 truncate">{label}</div>
    </div>
  )
}
