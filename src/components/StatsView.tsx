import { useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Map as MapIcon,
  BarChart3,
  Dog,
  Trash2,
  Fence,
  Trees,
  Trophy,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react'
import type {
  Datasets,
  DistrictAggregate,
  Locale,
  PerrosCensusEntry,
  ProteccionAnimalEntry,
} from '../types'
import type { StatsSection } from './Sidebar'
import { t } from '../i18n'
import { aggregateByDistrict } from '../services/scoring'
import DistrictChoropleth from './DistrictChoropleth'
import ChartActions from './ChartActions'

interface Props {
  data: Datasets
  locale: Locale
  section: StatsSection
}

type Metric = 'papeleras' | 'areasCaninas' | 'parques' | 'perros'
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

export default function StatsView({ data, locale, section }: Props) {
  const censoYears = data.perros.years ?? []
  const [censoYear, setCensoYear] = useState<number | null>(null)
  const effectiveCensoYear = censoYear ?? data.perros.year ?? null
  const aggregates = useMemo(
    () => aggregateByDistrict(data, effectiveCensoYear),
    [data, effectiveCensoYear],
  )

  const numFmt = useMemo(
    () => new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US'),
    [locale],
  )

  const showCensoSelector =
    censoYears.length > 1 &&
    (section === 'overview' || section === 'ranking' || section === 'needs')

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-stone-900">{t(locale, 'stats.title')}</h1>
        <p className="text-sm text-stone-600">
          {locale === 'es'
            ? `${aggregates.length} distritos analizados con datos del Portal de Datos Abiertos del Ayuntamiento de Madrid.`
            : `${aggregates.length} districts analysed with data from Madrid City Council Open Data Portal.`}
        </p>
      </header>

      {showCensoSelector && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="censo-year-select"
            className="text-xs font-medium uppercase tracking-wide text-stone-500"
          >
            {t(locale, 'stats.censoYear')}
          </label>
          <select
            id="censo-year-select"
            value={effectiveCensoYear ?? ''}
            onChange={(e) => {
              const v = Number(e.target.value)
              setCensoYear(Number.isFinite(v) ? v : null)
            }}
            className="text-sm bg-white border border-stone-200 rounded-md px-2 py-1 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {[...censoYears].reverse().map((y) => (
              <option key={y} value={y}>
                {y}
                {y === data.perros.year ? ` · ${locale === 'es' ? 'último' : 'latest'}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {section === 'overview' && (
        <OverviewPanel
          aggregates={aggregates}
          perrosEntries={data.perros.entries}
          locale={locale}
          numFmt={numFmt}
        />
      )}
      {section === 'ranking' && <RankingPanel aggregates={aggregates} locale={locale} />}
      {section === 'needs' && (
        <NeedsPanel
          aggregates={aggregates}
          year={effectiveCensoYear}
          locale={locale}
          numFmt={numFmt}
        />
      )}
      {section === 'proteccion' && (
        <ProteccionPanel data={data.proteccionAnimal} locale={locale} />
      )}
    </div>
  )
}

function OverviewPanel({
  aggregates,
  perrosEntries,
  locale,
  numFmt,
}: {
  aggregates: DistrictAggregate[]
  perrosEntries: PerrosCensusEntry[]
  locale: Locale
  numFmt: Intl.NumberFormat
}) {
  const trendRef = useRef<HTMLDivElement | null>(null)
  const totalPapeleras = aggregates.reduce((s, a) => s + a.papeleras, 0)
  const totalAreas = aggregates.reduce((s, a) => s + a.areasCaninas, 0)
  const totalParques = aggregates.reduce((s, a) => s + a.parques, 0)
  const totalPerros = aggregates.reduce((s, a) => s + a.perros, 0)
  const totalSuperficie = aggregates.reduce((s, a) => s + a.superficieAreasM2, 0)

  const perrosPorPapelera = totalPapeleras > 0 ? totalPerros / totalPapeleras : null
  const perrosPorArea = totalAreas > 0 ? totalPerros / totalAreas : null
  const perrosPorParque = totalParques > 0 ? totalPerros / totalParques : null

  const districtsWithPerros = aggregates.filter((a) => a.perros > 0)
  const districtsWithRatio = districtsWithPerros.filter((a) => a.papeleras > 0)

  const mostDogs = districtsWithPerros.length
    ? [...districtsWithPerros].sort((a, b) => b.perros - a.perros)[0]
    : null
  const bestCoverage = districtsWithRatio.length
    ? [...districtsWithRatio].sort(
        (a, b) => a.perros / a.papeleras - b.perros / b.papeleras,
      )[0]
    : null
  const worstCoverage = districtsWithRatio.length
    ? [...districtsWithRatio].sort(
        (a, b) => b.perros / b.papeleras - a.perros / a.papeleras,
      )[0]
    : null

  const yearTotals = useMemo(() => {
    const byYear = new Map<number, number>()
    for (const e of perrosEntries) {
      byYear.set(e.year, (byYear.get(e.year) ?? 0) + e.perros)
    }
    return Array.from(byYear.entries())
      .map(([year, perros]) => ({ year, perros }))
      .sort((a, b) => a.year - b.year)
  }, [perrosEntries])

  const showTrend = yearTotals.length > 1
  const trendDelta =
    showTrend && yearTotals[0].perros > 0
      ? yearTotals[yearTotals.length - 1].perros - yearTotals[0].perros
      : 0
  const trendDeltaPct =
    showTrend && yearTotals[0].perros > 0
      ? (trendDelta / yearTotals[0].perros) * 100
      : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label={t(locale, 'stats.perros')}
          value={totalPerros}
          color="#7a3b14"
          icon={Dog}
        />
        <KPICard
          label={t(locale, 'layer.papeleras')}
          value={totalPapeleras}
          color="#ed731f"
          icon={Trash2}
        />
        <KPICard
          label={t(locale, 'layer.areas')}
          value={totalAreas}
          color="#3d6e3a"
          icon={Fence}
        />
        <KPICard
          label={t(locale, 'layer.parques')}
          value={totalParques}
          color="#5b3a1e"
          icon={Trees}
        />
      </div>

      <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 space-y-4">
        <div className="space-y-1">
          <h2 className="font-semibold text-stone-900 text-sm sm:text-base">
            {t(locale, 'stats.overview.cifras.title')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            {t(locale, 'stats.overview.cifras.lede')}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <RatioCard
            label={t(locale, 'stats.overview.cifras.perrosPorPapelera')}
            value={perrosPorPapelera}
            numFmt={numFmt}
          />
          <RatioCard
            label={t(locale, 'stats.overview.cifras.perrosPorArea')}
            value={perrosPorArea}
            numFmt={numFmt}
          />
          <RatioCard
            label={t(locale, 'stats.overview.cifras.perrosPorParque')}
            value={perrosPorParque}
            numFmt={numFmt}
          />
          <RatioCard
            label={t(locale, 'stats.overview.cifras.superficie')}
            value={totalSuperficie}
            numFmt={numFmt}
            unit={t(locale, 'stats.overview.cifras.superficie.unit')}
          />
        </div>
      </section>

      {(mostDogs || bestCoverage || worstCoverage) && (
        <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 space-y-4">
          <h2 className="font-semibold text-stone-900 text-sm sm:text-base">
            {t(locale, 'stats.overview.spotlight.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {mostDogs && (
              <SpotlightCard
                icon={Trophy}
                color="#7a3b14"
                title={t(locale, 'stats.overview.spotlight.mostDogs')}
                district={mostDogs.distrito}
                value={numFmt.format(mostDogs.perros)}
                unit={t(locale, 'stats.overview.spotlight.dogsLabel')}
              />
            )}
            {bestCoverage && (
              <SpotlightCard
                icon={ShieldCheck}
                color="#3d6e3a"
                title={t(locale, 'stats.overview.spotlight.bestCoverage')}
                subtitle={t(locale, 'stats.overview.spotlight.bestCoverage.sub')}
                district={bestCoverage.distrito}
                value={numFmt.format(
                  Math.round(bestCoverage.perros / bestCoverage.papeleras),
                )}
                unit={t(locale, 'stats.overview.spotlight.ratioLabel')}
              />
            )}
            {worstCoverage && (
              <SpotlightCard
                icon={AlertTriangle}
                color="#ed731f"
                title={t(locale, 'stats.overview.spotlight.worstCoverage')}
                subtitle={t(locale, 'stats.overview.spotlight.worstCoverage.sub')}
                district={worstCoverage.distrito}
                value={numFmt.format(
                  Math.round(worstCoverage.perros / worstCoverage.papeleras),
                )}
                unit={t(locale, 'stats.overview.spotlight.ratioLabel')}
              />
            )}
          </div>
        </section>
      )}

      {showTrend && (
        <section className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <h2 className="font-semibold text-stone-900 text-sm sm:text-base">
                {t(locale, 'stats.overview.trend.title')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                {t(locale, 'stats.overview.trend.lede')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {trendDelta !== 0 && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    trendDelta > 0
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                  }`}
                >
                  {trendDelta > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {t(locale, 'stats.overview.trend.delta')
                    .replace(
                      '{value}',
                      `${trendDelta > 0 ? '+' : ''}${numFmt.format(trendDelta)} (${
                        trendDeltaPct > 0 ? '+' : ''
                      }${trendDeltaPct.toFixed(1)}%)`,
                    )
                    .replace('{year}', String(yearTotals[0].year))}
                </div>
              )}
              <ChartActions
                title={t(locale, 'stats.overview.trend.title')}
                subtitle={t(locale, 'stats.overview.trend.lede')}
                filename="censo-canino-evolucion"
                locale={locale}
                targetRef={trendRef}
              />
            </div>
          </div>
          <div ref={trendRef} className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearTotals} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  width={56}
                  tickFormatter={(v) => numFmt.format(v as number)}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e7e5e4',
                    fontSize: 13,
                  }}
                  formatter={(value) => [
                    numFmt.format(value as number),
                    t(locale, 'stats.overview.trend.label'),
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="perros"
                  stroke="#5a3f2a"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#5a3f2a' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  )
}

function RatioCard({
  label,
  value,
  numFmt,
  unit,
}: {
  label: string
  value: number | null
  numFmt: Intl.NumberFormat
  unit?: string
}) {
  return (
    <div className="bg-stone-50 rounded-lg border border-stone-100 p-3">
      <div className="text-2xl font-bold tabular-nums text-stone-900">
        {value === null ? '—' : numFmt.format(Math.round(value))}
      </div>
      <div className="text-xs text-stone-500 mt-1 leading-tight">{label}</div>
      {unit && <div className="text-[11px] text-stone-400 mt-0.5">{unit}</div>}
    </div>
  )
}

function SpotlightCard({
  icon: Icon,
  color,
  title,
  subtitle,
  district,
  value,
  unit,
}: {
  icon: LucideIcon
  color: string
  title: string
  subtitle?: string
  district: string
  value: string
  unit: string
}) {
  return (
    <div className="bg-stone-50 rounded-lg border border-stone-100 p-4">
      <div className="flex items-start gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, color }}
          aria-hidden
        >
          <Icon size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-stone-700 leading-tight">{title}</div>
          {subtitle && (
            <div className="text-[11px] text-stone-500 mt-0.5 leading-tight">{subtitle}</div>
          )}
        </div>
      </div>
      <div className="text-base font-semibold text-stone-900 truncate">{district}</div>
      <div className="text-xs text-stone-500 mt-1 tabular-nums">
        <span className="font-semibold text-stone-700">{value}</span> {unit}
      </div>
    </div>
  )
}

function RankingPanel({
  aggregates,
  locale,
}: {
  aggregates: DistrictAggregate[]
  locale: Locale
}) {
  const [metric, setMetric] = useState<Metric>('papeleras')
  const [mode, setMode] = useState<DisplayMode>('map')
  const barRef = useRef<HTMLDivElement | null>(null)

  const sorted = useMemo(
    () =>
      aggregates
        .filter((a) => a[metric] > 0)
        .sort((a, b) => b[metric] - a[metric]),
    [aggregates, metric],
  )

  const colorByMetric: Record<Metric, string> = {
    papeleras: '#ed731f',
    areasCaninas: '#3d6e3a',
    parques: '#5b3a1e',
    perros: '#7a3b14',
  }
  const labelByMetric: Record<Metric, string> = {
    papeleras: t(locale, 'stats.papelerasRanking'),
    areasCaninas: t(locale, 'stats.areasRanking'),
    parques: t(locale, 'stats.parquesRanking'),
    perros: t(locale, 'stats.perrosRanking'),
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-semibold text-stone-900 text-sm sm:text-base flex-1">
          {labelByMetric[metric]}
        </h2>
        <div className="flex bg-stone-100 rounded-lg p-1 text-xs">
          {(['perros', 'papeleras', 'areasCaninas', 'parques'] as Metric[]).map((m) => (
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
              {m === 'perros'
                ? locale === 'es'
                  ? 'Perros'
                  : 'Dogs'
                : m === 'papeleras'
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
        <div className="space-y-3">
          <div className="flex justify-end">
            <ChartActions
              title={labelByMetric[metric]}
              filename={`ranking-${metric}`}
              locale={locale}
              targetRef={barRef}
            />
          </div>
          <div ref={barRef} className="h-[460px] -mx-1 sm:-mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
              <XAxis type="number" stroke="#78716c" fontSize={11} />
              <YAxis
                type="category"
                dataKey="distrito"
                stroke="#44403c"
                fontSize={11}
                width={92}
                tick={{ fontSize: 10 }}
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
      )}
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
  locale,
  numFmt,
}: {
  aggregates: DistrictAggregate[]
  year: number | null
  locale: Locale
  numFmt: Intl.NumberFormat
}) {
  const [field, setField] = useState<NeedsField>('papeleras')
  const rowsWithPerros = useMemo(
    () => aggregates.filter((a) => a.perros > 0),
    [aggregates],
  )

  const rows: NeedsRow[] = useMemo(() => {
    const data = rowsWithPerros
      .map((a) => {
        const recurso = a[field]
        return {
          distrito: a.distrito,
          perros: a.perros,
          recurso,
          ratio: recurso > 0 ? a.perros / recurso : null,
        }
      })
      .filter((r) => r.ratio !== null)
    return data.sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
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
            onClick={() => setField(f)}
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
                    {r.recurso > 0 ? numFmt.format(r.recurso) : <span className="text-stone-400">—</span>}
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

function ProteccionPanel({
  data,
  locale,
}: {
  data: ProteccionAnimalEntry[]
  locale: Locale
}) {
  const flowRef = useRef<HTMLDivElement | null>(null)
  const rateRef = useRef<HTMLDivElement | null>(null)

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5">
        <h2 className="font-semibold text-stone-900 text-sm sm:text-base">
          {t(locale, 'stats.proteccion.title')}
        </h2>
        <p className="text-sm text-stone-500 mt-2">{t(locale, 'stats.proteccion.empty')}</p>
      </div>
    )
  }

  const seriesColors = {
    dogIntakes: '#a13d1f',
    catIntakes: '#7a3b14',
    dogAdoptions: '#3d6e3a',
    catAdoptions: '#3a5a6e',
  }
  const seriesLabels: Record<keyof typeof seriesColors, string> = {
    dogIntakes: t(locale, 'stats.proteccion.dogIntakes'),
    catIntakes: t(locale, 'stats.proteccion.catIntakes'),
    dogAdoptions: t(locale, 'stats.proteccion.dogAdoptions'),
    catAdoptions: t(locale, 'stats.proteccion.catAdoptions'),
  }

  // Adoption rate per year — adoptions ÷ intakes, expressed as %.
  // Filtered to years with positive intakes so we don't divide by zero.
  const rateData = useMemo(
    () =>
      data
        .map((d) => ({
          year: d.year,
          dogs: d.dogIntakes > 0 ? Math.round((d.dogAdoptions / d.dogIntakes) * 1000) / 10 : null,
          cats: d.catIntakes > 0 ? Math.round((d.catAdoptions / d.catIntakes) * 1000) / 10 : null,
        }))
        .filter((d) => d.dogs !== null || d.cats !== null),
    [data],
  )

  return (
    <div className="space-y-6">
      {/* Chart 1 — annual flows */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-stone-900 text-sm sm:text-base">
              {t(locale, 'stats.proteccion.title')}
            </h2>
            <p className="text-sm text-stone-600 mt-1">{t(locale, 'stats.proteccion.lede')}</p>
          </div>
          <ChartActions
            title={t(locale, 'stats.proteccion.title')}
            subtitle={t(locale, 'stats.proteccion.lede')}
            filename="proteccion-animal-flujos"
            locale={locale}
            targetRef={flowRef}
          />
        </div>

        <div ref={flowRef} className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11 }}
                label={{
                  value: t(locale, 'stats.proteccion.year'),
                  position: 'insideBottom',
                  offset: -2,
                  fontSize: 11,
                  fill: '#78716c',
                }}
              />
              <YAxis tick={{ fontSize: 11 }} width={48} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e7e5e4',
                  fontSize: 13,
                }}
                formatter={(value, name) => [
                  Number(value).toLocaleString(locale === 'es' ? 'es-ES' : 'en-US'),
                  seriesLabels[name as keyof typeof seriesColors] ?? String(name),
                ]}
                labelFormatter={(label) => `${t(locale, 'stats.proteccion.year')} ${label}`}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) =>
                  seriesLabels[value as keyof typeof seriesColors] ?? value
                }
              />
              {(Object.keys(seriesColors) as (keyof typeof seriesColors)[]).map((k) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={seriesColors[k]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-stone-500">{t(locale, 'stats.proteccion.note')}</p>
      </div>

      {/* Chart 2 — adoption rate */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-stone-900 text-sm sm:text-base">
              {t(locale, 'stats.proteccion.rate.title')}
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              {t(locale, 'stats.proteccion.rate.lede')}
            </p>
          </div>
          <ChartActions
            title={t(locale, 'stats.proteccion.rate.title')}
            subtitle={t(locale, 'stats.proteccion.rate.lede')}
            filename="tasa-adopcion"
            locale={locale}
            targetRef={rateRef}
          />
        </div>

        <div ref={rateRef} className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rateData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                width={42}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e7e5e4',
                  fontSize: 13,
                }}
                formatter={(value, name) => {
                  if (value === null || value === undefined) return ['—', String(name)]
                  const label =
                    name === 'dogs'
                      ? t(locale, 'stats.proteccion.rate.dogs')
                      : t(locale, 'stats.proteccion.rate.cats')
                  return [`${value}%`, label]
                }}
                labelFormatter={(label) => `${t(locale, 'stats.proteccion.year')} ${label}`}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) =>
                  value === 'dogs'
                    ? t(locale, 'stats.proteccion.rate.dogs')
                    : t(locale, 'stats.proteccion.rate.cats')
                }
              />
              <Line
                type="monotone"
                dataKey="dogs"
                stroke="#3d6e3a"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="cats"
                stroke="#3a5a6e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function KPICard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string
  value: number
  color: string
  icon: LucideIcon
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
        style={{ background: `${color}15`, color }}
        aria-hidden
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="text-2xl sm:text-3xl font-bold tabular-nums text-stone-900">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-stone-500 mt-1 truncate">{label}</div>
    </div>
  )
}
