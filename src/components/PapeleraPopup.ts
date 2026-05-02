// Builds an interactive DOM node for a papelera popup, with live community reports
// fetched from /api/report and two buttons to submit a new report.
//
// Returns the DOM node ready to be passed to popup.setDOMContent(node).

import { fetchReports, submitReport, type BinReport } from '../services/reports'
import { formatRelativeTime } from './reportsTime'
import type { Locale } from '../types'

interface Args {
  binId: string
  title: string
  address: string
  district: string
  modelo: string
  lat: number
  lng: number
  locale: Locale
}

const t = (locale: Locale) => ({
  navigate: locale === 'es' ? 'Cómo llegar' : 'Directions',
  reports: locale === 'es' ? 'Reportes recientes' : 'Recent reports',
  noReports: locale === 'es' ? 'Sin reportes aún. ¡Sé el primero!' : 'No reports yet. Be the first!',
  district: locale === 'es' ? 'Distrito' : 'District',
  hasBags: locale === 'es' ? '✓ Hay bolsas' : '✓ Has bags',
  noBags: locale === 'es' ? '✗ Sin bolsas' : '✗ No bags',
  thanks: locale === 'es' ? '¡Gracias por reportar!' : 'Thanks for reporting!',
  rateLimit: locale === 'es' ? 'Demasiados reportes. Inténtalo en una hora.' : 'Too many reports. Try in an hour.',
  error: locale === 'es' ? 'Error enviando reporte' : 'Error submitting',
  yes: locale === 'es' ? 'con bolsas' : 'has bags',
  no: locale === 'es' ? 'sin bolsas' : 'no bags',
  loading: locale === 'es' ? 'Cargando reportes…' : 'Loading reports…',
})

export function buildPapeleraPopupContent(args: Args): HTMLDivElement {
  const tr = t(args.locale)
  const root = document.createElement('div')
  root.className = 'mp-popup mp-popup-pap'
  root.innerHTML = `
    <div class="mp-popup-bar" style="background:#ed731f"></div>
    <div class="mp-popup-body">
      <div class="mp-popup-title">${escapeHtml(args.title)}</div>
      ${args.address ? `<div class="mp-popup-row">${escapeHtml(args.address)}</div>` : ''}
      <div class="mp-popup-row mp-popup-meta">${tr.district}: ${escapeHtml(args.district)} · ${escapeHtml(args.modelo)}</div>
      <div class="mp-popup-actions">
        <a class="mp-popup-btn" target="_blank" rel="noopener"
           href="https://www.google.com/maps/dir/?api=1&destination=${args.lat},${args.lng}&travelmode=walking">
          ${tr.navigate}
        </a>
      </div>
      <div class="mp-popup-reports" data-reports>
        <div class="mp-popup-reports-title">${tr.reports}</div>
        <div class="mp-popup-reports-content" data-reports-content>${tr.loading}</div>
      </div>
      <div class="mp-popup-vote">
        <button type="button" class="mp-vote-yes" data-vote="yes">${tr.hasBags}</button>
        <button type="button" class="mp-vote-no" data-vote="no">${tr.noBags}</button>
      </div>
      <div class="mp-popup-flash" data-flash></div>
    </div>
  `

  const reportsContent = root.querySelector<HTMLDivElement>('[data-reports-content]')!
  const flash = root.querySelector<HTMLDivElement>('[data-flash]')!
  const btnYes = root.querySelector<HTMLButtonElement>('[data-vote="yes"]')!
  const btnNo = root.querySelector<HTMLButtonElement>('[data-vote="no"]')!

  function renderReports(latest: BinReport | null, all: BinReport[]) {
    if (!latest) {
      reportsContent.innerHTML = `<div class="mp-popup-empty">${tr.noReports}</div>`
      return
    }
    const yesCount = all.filter((r) => r.hasBags).length
    const noCount = all.length - yesCount
    const labelClass = latest.hasBags ? 'mp-r-yes' : 'mp-r-no'
    reportsContent.innerHTML = `
      <div class="mp-popup-latest ${labelClass}">
        <span class="mp-popup-rel">${formatRelativeTime(latest.ts, args.locale)}</span>
        <span class="mp-popup-state">${latest.hasBags ? '✓ ' + tr.yes : '✗ ' + tr.no}</span>
      </div>
      <div class="mp-popup-tally">
        <span class="mp-r-yes">✓ ${yesCount}</span>
        <span class="mp-r-no">✗ ${noCount}</span>
        <span class="mp-popup-meta">· ${all.length}</span>
      </div>
    `
  }

  async function load() {
    try {
      const summary = await fetchReports(args.binId)
      renderReports(summary.latest, summary.reports)
    } catch {
      reportsContent.innerHTML = `<div class="mp-popup-empty">—</div>`
    }
  }

  async function vote(hasBags: boolean) {
    btnYes.disabled = true
    btnNo.disabled = true
    flash.textContent = ''
    const result = await submitReport(args.binId, hasBags)
    if ('error' in result) {
      flash.textContent = result.error === 'rate_limited' ? tr.rateLimit : tr.error
      flash.className = 'mp-popup-flash error'
      btnYes.disabled = false
      btnNo.disabled = false
      return
    }
    flash.textContent = tr.thanks
    flash.className = 'mp-popup-flash ok'
    await load()
    setTimeout(() => {
      btnYes.disabled = false
      btnNo.disabled = false
    }, 2000)
  }

  btnYes.addEventListener('click', () => vote(true))
  btnNo.addEventListener('click', () => vote(false))

  // Kick off the initial load on next tick (popup must be in DOM first).
  queueMicrotask(load)

  return root
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
