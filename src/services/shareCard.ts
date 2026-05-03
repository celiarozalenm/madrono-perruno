// Generates a share card (PNG, 1200x630) with the user's "Mi barrio canino"
// score, drawn entirely client-side on a canvas. No server, no third-party
// service.

import type { BarrioScore } from '../types'

interface Args {
  score: BarrioScore
  locale: 'es' | 'en'
}

const W = 1200
const H = 630

const COLOR = {
  bg: '#faf7f2',
  brand: '#ed731f',
  brandDark: '#b84314',
  green: '#3d6e3a',
  brown: '#5b3a1e',
  cyan: '#3a5a6e',
  text: '#1a1a1a',
  textDim: '#4b5563',
  textFaint: '#6b7280',
  madrono: '#5a3f2a',
} as const

const SCORE_COLOR: Record<BarrioScore['scoreLabel'], string> = {
  excelente: '#3d6e3a',
  bueno: '#7a8a2a',
  mejorable: '#d97706',
  pobre: '#b8431b',
}

const LABEL: Record<BarrioScore['scoreLabel'], { es: string; en: string }> = {
  excelente: { es: 'Excelente para perros', en: 'Excellent for dogs' },
  bueno: { es: 'Buen barrio canino', en: 'Dog-friendly' },
  mejorable: { es: 'Mejorable', en: 'Could improve' },
  pobre: { es: 'Pobre cobertura', en: 'Poor coverage' },
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function generateShareCard(args: Args): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas not supported')

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#fef7ee')
  grad.addColorStop(1, COLOR.bg)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Top bar with brand + tagline
  ctx.fillStyle = COLOR.brand
  ctx.fillRect(0, 0, W, 8)

  // Logo — load the brand SVG so the share card matches the live icon exactly.
  try {
    const img = await loadIcon()
    ctx.drawImage(img, 60, 60, 80, 80)
  } catch {
    drawLogo(ctx, 60, 60, 80)
  }
  ctx.fillStyle = COLOR.text
  ctx.font = 'bold 38px "DM Sans", system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('Madroño Perruno', 160, 90)
  ctx.fillStyle = COLOR.textDim
  ctx.font = '500 18px "DM Sans", system-ui, sans-serif'
  ctx.fillText(args.locale === 'es' ? 'Portal perruno de Madrid' : 'Madrid Dog Portal', 160, 122)

  // Big score block (left side)
  const scoreColor = SCORE_COLOR[args.score.scoreLabel]
  roundRect(ctx, 60, 200, 460, 360, 28)
  ctx.fillStyle = scoreColor
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 220px "DM Sans", system-ui, sans-serif'
  ctx.textBaseline = 'top'
  const scoreStr = String(args.score.scoreOver100)
  const scoreWidth = ctx.measureText(scoreStr).width
  ctx.fillText(scoreStr, 90, 230)
  ctx.font = 'bold 64px "DM Sans", system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('/100', 100 + scoreWidth, 295)

  ctx.font = 'bold 28px "DM Sans", system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(LABEL[args.score.scoreLabel][args.locale], 90, 480)

  // Stats column (right side)
  const x0 = 580
  let y = 220
  ctx.fillStyle = COLOR.textFaint
  ctx.font = '600 16px "DM Sans", system-ui, sans-serif'
  ctx.fillText(
    (args.locale === 'es' ? 'A 10 MINUTOS ANDANDO' : 'WITHIN 10 MIN WALK').toUpperCase(),
    x0,
    y,
  )
  y += 36

  drawStatRow(ctx, x0, y, COLOR.brand, args.score.papeleras, args.locale === 'es' ? 'papeleras con bolsas' : 'bag dispensers')
  y += 56
  drawStatRow(ctx, x0, y, COLOR.green, args.score.areasCaninas, args.locale === 'es' ? 'áreas caninas' : 'dog areas')
  y += 56
  drawStatRow(ctx, x0, y, COLOR.brown, args.score.parques, args.locale === 'es' ? 'parques cercanos' : 'parks nearby')
  y += 56
  drawStatRow(
    ctx,
    x0,
    y,
    COLOR.cyan,
    args.score.veterinariosDistrito,
    args.locale === 'es' ? 'veterinarios registrados en el distrito' : 'registered vets in the district',
  )

  // Distrito line (only neighborhood / distrito name)
  ctx.fillStyle = COLOR.textDim
  ctx.font = '600 20px "DM Sans", system-ui, sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(args.score.distrito || (args.locale === 'es' ? 'Madrid' : 'Madrid'), 60, 588)

  // Brand badge bottom-right
  ctx.fillStyle = COLOR.madrono
  roundRect(ctx, W - 320, 558, 260, 44, 22)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 16px "DM Sans", system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('Madroño Perruno', W - 300, 580)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/png',
      0.92,
    )
  })
}

function loadIcon(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('icon load failed'))
    img.src = '/icon.svg'
  })
}

function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cx = x + size / 2
  const cy = y + size / 2
  ctx.save()
  // Background disc
  ctx.fillStyle = '#fdecd6'
  ctx.beginPath()
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2)
  ctx.fill()
  // Trunk
  ctx.fillStyle = COLOR.brown
  ctx.fillRect(cx + 6, cy - 4, 6, 22)
  // Canopy
  ctx.fillStyle = '#8c6a44'
  ctx.beginPath()
  ctx.arc(cx + 9, cy - 12, 16, 0, Math.PI * 2)
  ctx.arc(cx + 18, cy - 6, 11, 0, Math.PI * 2)
  ctx.arc(cx + 1, cy - 6, 11, 0, Math.PI * 2)
  ctx.fill()
  // Fruits
  ctx.fillStyle = COLOR.brand
  for (const [px, py] of [
    [cx + 4, cy - 14],
    [cx + 14, cy - 8],
    [cx + 19, cy - 14],
    [cx, cy - 4],
  ]) {
    ctx.beginPath()
    ctx.arc(px, py, 2, 0, Math.PI * 2)
    ctx.fill()
  }
  // Dog
  ctx.fillStyle = COLOR.brand
  ctx.beginPath()
  ctx.ellipse(cx - 14, cy + 10, 9, 13, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx - 6, cy - 6, 8, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx, cy - 4, 4, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawStatRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  value: number,
  label: string,
) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x + 12, y + 14, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLOR.text
  ctx.font = 'bold 38px "DM Sans", system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  const valStr = String(value)
  ctx.fillText(valStr, x + 36, y + 18)
  const valW = ctx.measureText(valStr).width
  ctx.fillStyle = COLOR.textDim
  ctx.font = '500 22px "DM Sans", system-ui, sans-serif'
  ctx.fillText(label, x + 48 + valW, y + 20)
  ctx.restore()
}

