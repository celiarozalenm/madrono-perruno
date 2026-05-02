import type { Locale } from '../types'

type Kind = 'papelera' | 'area' | 'parque'

interface PopupData {
  title: string
  address: string
  district: string
  extra: string
  url?: string
  lat: number
  lng: number
  locale: Locale
}

const COLOR: Record<Kind, string> = {
  papelera: '#ed731f',
  area: '#2f7d3a',
  parque: '#5b3a1e',
}

export function renderPopupHtml(kind: Kind, d: PopupData): string {
  const navText = d.locale === 'es' ? 'Cómo llegar' : 'Directions'
  const districtLabel = d.locale === 'es' ? 'Distrito' : 'District'
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}&travelmode=walking`
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const externalUrl = d.url
    ? `<a href="${escape(d.url)}" target="_blank" rel="noopener" class="mp-popup-link">${
        d.locale === 'es' ? 'Más información' : 'More info'
      }</a>`
    : ''
  return `
<div class="mp-popup">
  <div class="mp-popup-bar" style="background:${COLOR[kind]}"></div>
  <div class="mp-popup-body">
    <div class="mp-popup-title">${escape(d.title)}</div>
    ${d.address ? `<div class="mp-popup-row">${escape(d.address)}</div>` : ''}
    ${d.district ? `<div class="mp-popup-row mp-popup-meta">${districtLabel}: ${escape(d.district)}</div>` : ''}
    ${d.extra ? `<div class="mp-popup-row mp-popup-meta">${escape(d.extra)}</div>` : ''}
    <div class="mp-popup-actions">
      <a href="${navUrl}" target="_blank" rel="noopener" class="mp-popup-btn">${navText}</a>
      ${externalUrl}
    </div>
  </div>
</div>`
}
