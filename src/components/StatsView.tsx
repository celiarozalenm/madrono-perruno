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
import type { Datasets, Locale } from '../types'
import { t } from '../i18n'
import { aggregateByDistrict } from '../services/scoring'

interface Props {
  data: Datasets
  locale: Locale
}

type Metric = 'papeleras' | 'areasCaninas' | 'parques'

export default function StatsView({ data, locale }: Props) {
  const aggregates = useMemo(() => aggregateByDistrict(data), [data])
  const [metric, setMetric] = useState<Metric>('papeleras')

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

      <div className="grid grid-cols-3 gap-3">
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
        </div>

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
      </div>
    </div>
  )
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
