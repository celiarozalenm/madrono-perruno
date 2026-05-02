// Builds an interactive popup DOM node for áreas caninas and parques, with
// thumbs up/down + optional 140-char note. Uses /api/comment.

import { fetchComments, submitComment, type Comment, type EntityType } from '../services/comments'
import { formatRelativeTime } from './reportsTime'
import type { Locale } from '../types'

const COLOR: Record<EntityType, string> = {
  area: '#2f7d3a',
  parque: '#5b3a1e',
}

interface Args {
  entityType: EntityType
  entityId: string
  title: string
  address: string
  district: string
  extra: string
  url?: string
  lat: number
  lng: number
  locale: Locale
}

const t = (locale: Locale) => ({
  navigate: locale === 'es' ? 'Cómo llegar' : 'Directions',
  google: locale === 'es' ? 'Ver en Google Maps' : 'View on Google Maps',
  external: locale === 'es' ? 'Más información' : 'More info',
  comments: locale === 'es' ? 'Comentarios recientes' : 'Recent comments',
  noComments: locale === 'es' ? 'Aún no hay comentarios.' : 'No comments yet.',
  district: locale === 'es' ? 'Distrito' : 'District',
  good: locale === 'es' ? '👍 Está bien' : '👍 Looks good',
  bad: locale === 'es' ? '👎 Mal estado' : '👎 Bad state',
  placeholder:
    locale === 'es'
      ? 'Comentario opcional (140 caracteres)…'
      : 'Optional comment (140 chars)…',
  submit: locale === 'es' ? 'Comentar' : 'Submit',
  thanks: locale === 'es' ? '¡Gracias por tu comentario!' : 'Thanks for your comment!',
  rateLimit:
    locale === 'es'
      ? 'Demasiados comentarios. Inténtalo en una hora.'
      : 'Too many comments. Try in an hour.',
  error: locale === 'es' ? 'Error enviando comentario' : 'Error submitting',
  loading: locale === 'es' ? 'Cargando…' : 'Loading…',
  selectFirst:
    locale === 'es' ? 'Elige 👍 o 👎 antes de enviar' : 'Pick 👍 or 👎 before submitting',
})

export function buildEntityPopupContent(args: Args): HTMLDivElement {
  const tr = t(args.locale)
  const root = document.createElement('div')
  root.className = 'mp-popup mp-popup-entity'
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${args.lat},${args.lng}&travelmode=walking`
  const placeQuery = encodeURIComponent(`${args.title} ${args.address}`)
  const placeUrl = `https://www.google.com/maps/search/?api=1&query=${placeQuery}`
  const externalLink = args.url
    ? `<a href="${escape(args.url)}" target="_blank" rel="noopener" class="mp-popup-link">${tr.external}</a>`
    : ''

  root.innerHTML = `
    <div class="mp-popup-bar" style="background:${COLOR[args.entityType]}"></div>
    <div class="mp-popup-body">
      <div class="mp-popup-title">${escape(args.title)}</div>
      ${args.address ? `<div class="mp-popup-row">${escape(args.address)}</div>` : ''}
      ${args.district ? `<div class="mp-popup-row mp-popup-meta">${tr.district}: ${escape(args.district)}</div>` : ''}
      ${args.extra ? `<div class="mp-popup-row mp-popup-meta">${escape(args.extra)}</div>` : ''}
      <div class="mp-popup-actions">
        <a href="${navUrl}" target="_blank" rel="noopener" class="mp-popup-btn">${tr.navigate}</a>
        <a href="${placeUrl}" target="_blank" rel="noopener" class="mp-popup-link">${tr.google}</a>
        ${externalLink}
      </div>
      <div class="mp-popup-reports" data-comments>
        <div class="mp-popup-reports-title">${tr.comments}</div>
        <div class="mp-popup-comments-list" data-comments-list>${tr.loading}</div>
      </div>
      <div class="mp-popup-comment-form">
        <div class="mp-popup-vote">
          <button type="button" class="mp-vote-yes" data-sentiment="good" aria-pressed="false">${tr.good}</button>
          <button type="button" class="mp-vote-no" data-sentiment="bad" aria-pressed="false">${tr.bad}</button>
        </div>
        <textarea
          class="mp-popup-textarea"
          maxlength="140"
          placeholder="${tr.placeholder}"
          rows="2"
          data-text></textarea>
        <button type="button" class="mp-popup-submit" data-submit>${tr.submit}</button>
      </div>
      <div class="mp-popup-flash" data-flash></div>
    </div>
  `

  const list = root.querySelector<HTMLDivElement>('[data-comments-list]')!
  const flash = root.querySelector<HTMLDivElement>('[data-flash]')!
  const btnGood = root.querySelector<HTMLButtonElement>('[data-sentiment="good"]')!
  const btnBad = root.querySelector<HTMLButtonElement>('[data-sentiment="bad"]')!
  const textarea = root.querySelector<HTMLTextAreaElement>('[data-text]')!
  const submit = root.querySelector<HTMLButtonElement>('[data-submit]')!

  let chosenSentiment: 'good' | 'bad' | null = null

  function paintSentiment() {
    btnGood.setAttribute('aria-pressed', String(chosenSentiment === 'good'))
    btnBad.setAttribute('aria-pressed', String(chosenSentiment === 'bad'))
  }

  btnGood.addEventListener('click', () => {
    chosenSentiment = chosenSentiment === 'good' ? null : 'good'
    paintSentiment()
  })
  btnBad.addEventListener('click', () => {
    chosenSentiment = chosenSentiment === 'bad' ? null : 'bad'
    paintSentiment()
  })

  function renderList(comments: Comment[]) {
    if (comments.length === 0) {
      list.innerHTML = `<div class="mp-popup-empty">${tr.noComments}</div>`
      return
    }
    list.innerHTML = comments
      .map((c) => {
        const sentimentClass = c.sentiment === 'good' ? 'mp-r-yes' : 'mp-r-no'
        const sentimentIcon = c.sentiment === 'good' ? '👍' : '👎'
        const text = c.text ? `<div class="mp-popup-comment-text">${escape(c.text)}</div>` : ''
        return `
          <div class="mp-popup-comment ${sentimentClass}">
            <div class="mp-popup-comment-head">
              <span class="mp-popup-comment-icon">${sentimentIcon}</span>
              <span class="mp-popup-comment-rel">${formatRelativeTime(c.ts, args.locale)}</span>
            </div>
            ${text}
          </div>
        `
      })
      .join('')
  }

  async function load() {
    try {
      const summary = await fetchComments(args.entityType, args.entityId)
      renderList(summary.comments)
    } catch {
      list.innerHTML = `<div class="mp-popup-empty">—</div>`
    }
  }

  async function send() {
    flash.textContent = ''
    flash.className = 'mp-popup-flash'
    if (!chosenSentiment) {
      flash.textContent = tr.selectFirst
      flash.className = 'mp-popup-flash error'
      return
    }
    submit.disabled = true
    btnGood.disabled = true
    btnBad.disabled = true
    textarea.disabled = true
    const result = await submitComment(
      args.entityType,
      args.entityId,
      chosenSentiment,
      textarea.value,
    )
    if ('error' in result) {
      flash.textContent = result.error === 'rate_limited' ? tr.rateLimit : tr.error
      flash.className = 'mp-popup-flash error'
      submit.disabled = false
      btnGood.disabled = false
      btnBad.disabled = false
      textarea.disabled = false
      return
    }
    flash.textContent = tr.thanks
    flash.className = 'mp-popup-flash ok'
    textarea.value = ''
    chosenSentiment = null
    paintSentiment()
    await load()
    setTimeout(() => {
      submit.disabled = false
      btnGood.disabled = false
      btnBad.disabled = false
      textarea.disabled = false
    }, 2000)
  }

  submit.addEventListener('click', send)

  queueMicrotask(load)

  return root
}
