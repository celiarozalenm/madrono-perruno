import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, MapPin, Search, MessageSquareHeart } from 'lucide-react'
import type { AreaCanina, Datasets, Locale, Papelera, Parque } from '../types'
import { t } from '../i18n'
import EntityCommentForm from './participar/EntityCommentForm'
import PapeleraReportForm from './participar/PapeleraReportForm'

type Tab = 'parques' | 'areas' | 'papeleras'

const PAGE_SIZE = 50

interface Props {
  data: Datasets
  locale: Locale
  onLocateOnMap: (lat: number, lng: number) => void
}

export default function ParticiparView({ data, locale, onLocateOnMap }: Props) {
  const [tab, setTab] = useState<Tab>('parques')
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState<string>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE)

  function changeTab(next: Tab) {
    setTab(next)
    setOpenId(null)
    setPageSize(PAGE_SIZE)
  }

  const districts = useMemo(() => {
    const set = new Set<string>()
    if (tab === 'parques') data.parques.forEach((p) => set.add(p.distrito))
    if (tab === 'areas') data.areas.forEach((a) => set.add(a.distrito))
    if (tab === 'papeleras') data.papeleras.forEach((p) => set.add(p.distrito))
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b, 'es'))
  }, [tab, data])

  const needsDistrictFirst = tab === 'papeleras' && district === 'all'

  const filtered = useMemo(() => {
    if (needsDistrictFirst) return [] as (Parque | AreaCanina | Papelera)[]
    const q = search.trim().toLowerCase()
    if (tab === 'parques') {
      return data.parques.filter((p) => {
        if (district !== 'all' && p.distrito !== district) return false
        if (!q) return true
        return (
          p.nombre.toLowerCase().includes(q) ||
          p.direccion.toLowerCase().includes(q)
        )
      })
    }
    if (tab === 'areas') {
      return data.areas.filter((a) => {
        if (district !== 'all' && a.distrito !== district) return false
        if (!q) return true
        return a.direccion.toLowerCase().includes(q)
      })
    }
    return data.papeleras.filter((p) => {
      if (district !== 'all' && p.distrito !== district) return false
      if (!q) return true
      return (
        p.direccion.toLowerCase().includes(q) ||
        p.barrio?.toLowerCase().includes(q) ||
        p.modelo.toLowerCase().includes(q)
      )
    })
  }, [tab, district, search, data, needsDistrictFirst])

  const visible = filtered.slice(0, pageSize)
  const totalLabel =
    tab === 'parques'
      ? t(locale, 'participar.resultsParques')
      : tab === 'areas'
      ? t(locale, 'participar.resultsAreas')
      : t(locale, 'participar.resultsPapeleras')

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <header className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquareHeart size={20} className="text-brand-500" />
            <h1 className="text-xl font-bold text-stone-900">{t(locale, 'participar.title')}</h1>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{t(locale, 'participar.intro')}</p>
        </header>

        <div role="tablist" className="flex gap-1 mb-4 border-b border-stone-200">
          {(['parques', 'areas', 'papeleras'] as Tab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => changeTab(key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key
                  ? 'border-brand-500 text-brand-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              {t(locale, `participar.tab.${key}` as const)}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPageSize(PAGE_SIZE)
              }}
              placeholder={t(locale, 'participar.search.placeholder')}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-stone-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <select
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value)
              setOpenId(null)
              setPageSize(PAGE_SIZE)
            }}
            className="text-sm rounded-md border border-stone-200 px-2 py-2 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
          >
            <option value="all">{t(locale, 'participar.filter.allDistricts')}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {!needsDistrictFirst && (
          <div className="text-xs text-stone-500 mb-3">
            {filtered.length} {totalLabel}
          </div>
        )}

        {needsDistrictFirst ? (
          <div className="rounded-md bg-stone-50 border border-stone-200 px-4 py-6 text-sm text-stone-600 text-center">
            {t(locale, 'participar.filter.chooseDistrict')}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-md bg-stone-50 border border-stone-200 px-4 py-6 text-sm text-stone-500 text-center italic">
            {t(locale, 'participar.empty')}
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {visible.map((item) => {
              const id = item.id
              const isOpen = openId === id
              return (
                <li key={id} className="rounded-md border border-stone-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-stone-50 transition-colors"
                  >
                    <span className="shrink-0 mt-0.5 text-stone-400">
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <RowSummary item={item} tab={tab} locale={locale} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-1 border-t border-stone-100 bg-stone-50/40">
                      <div className="flex justify-end mb-2">
                        <button
                          type="button"
                          onClick={() => onLocateOnMap(item.lat, item.lng)}
                          className="inline-flex items-center gap-1.5 text-xs text-brand-700 hover:text-brand-600 hover:underline"
                        >
                          <MapPin size={12} />
                          {t(locale, 'participar.locateOnMap')}
                        </button>
                      </div>
                      {tab === 'papeleras' ? (
                        <PapeleraReportForm binId={id} locale={locale} />
                      ) : (
                        <EntityCommentForm
                          entityType={tab === 'parques' ? 'parque' : 'area'}
                          entityId={id}
                          locale={locale}
                        />
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {!needsDistrictFirst && filtered.length > pageSize && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setPageSize((s) => s + PAGE_SIZE)}
              className="px-4 py-2 text-sm font-medium rounded-md border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              {t(locale, 'participar.loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface RowSummaryProps {
  item: Parque | AreaCanina | Papelera
  tab: Tab
  locale: Locale
}

function RowSummary({ item, tab, locale }: RowSummaryProps) {
  if (tab === 'parques') {
    const p = item as Parque
    return (
      <span className="block">
        <span className="block text-sm font-medium text-stone-900 truncate">{p.nombre}</span>
        <span className="block text-xs text-stone-500 truncate">
          {p.direccion}
          {p.distrito ? ` · ${p.distrito}` : ''}
        </span>
      </span>
    )
  }
  if (tab === 'areas') {
    const a = item as AreaCanina
    const surface = a.superficieM2 ? `${a.superficieM2.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US')} m²` : null
    return (
      <span className="block">
        <span className="block text-sm font-medium text-stone-900 truncate">
          {a.direccion || (locale === 'es' ? 'Área canina' : 'Dog area')}
        </span>
        <span className="block text-xs text-stone-500 truncate">
          {a.distrito}
          {surface ? ` · ${surface}` : ''}
          {a.juegos ? ` · ${t(locale, 'participar.areaGames')}` : ''}
        </span>
      </span>
    )
  }
  const p = item as Papelera
  return (
    <span className="block">
      <span className="block text-sm font-medium text-stone-900 truncate">
        {p.direccion || p.modelo}
      </span>
      <span className="block text-xs text-stone-500 truncate">
        {p.barrio ? `${p.barrio} · ` : ''}
        {p.distrito}
        {p.modelo ? ` · ${p.modelo}` : ''}
      </span>
    </span>
  )
}
