// Capture a Recharts chart container as a PNG and either trigger a native
// share sheet (mobile) or fall back to a direct download. Works because
// Recharts renders an inline <svg> inside the container — we serialize it
// and rasterise on a canvas, no external libraries needed.

const PADDING = 32
const TITLE_BAND = 88
const FOOTER_BAND = 56
const BG = '#faf7f2'
const ACCENT = '#ed731f'
const TEXT = '#1a1a1a'
const TEXT_DIM = '#6b7280'

interface CaptureArgs {
  container: HTMLElement
  title: string
  subtitle?: string
  filename: string
}

/**
 * Render the chart inside `container` to a PNG Blob, with a branded
 * title strip on top and a tiny footer with the project URL.
 */
export async function captureChartAsBlob({
  container,
  title,
  subtitle,
}: CaptureArgs): Promise<Blob> {
  const svg = container.querySelector('svg')
  if (!svg) throw new Error('No SVG chart found inside container')

  const rect = svg.getBoundingClientRect()
  const baseW = Math.max(720, Math.round(rect.width))
  const baseH = Math.max(320, Math.round(rect.height))
  const dpr = window.devicePixelRatio > 1 ? 2 : 1

  const W = baseW + PADDING * 2
  const H = baseH + PADDING * 2 + TITLE_BAND + FOOTER_BAND

  // Serialize the SVG. We need explicit width/height for the rasteriser.
  const cloned = svg.cloneNode(true) as SVGSVGElement
  cloned.setAttribute('width', String(baseW))
  cloned.setAttribute('height', String(baseH))
  cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const svgStr = new XMLSerializer().serializeToString(cloned)
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  const img = await loadImage(svgUrl)

  const canvas = document.createElement('canvas')
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    URL.revokeObjectURL(svgUrl)
    throw new Error('Canvas not supported')
  }
  ctx.scale(dpr, dpr)

  // Background
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)

  // Top accent bar
  ctx.fillStyle = ACCENT
  ctx.fillRect(0, 0, W, 6)

  // Title band
  ctx.fillStyle = TEXT
  ctx.font = 'bold 26px "DM Sans", system-ui, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText(title, PADDING, 28)
  if (subtitle) {
    ctx.fillStyle = TEXT_DIM
    ctx.font = '14px "DM Sans", system-ui, sans-serif'
    ctx.fillText(subtitle, PADDING, 62)
  }

  // Chart
  ctx.drawImage(img, PADDING, TITLE_BAND, baseW, baseH)

  // Footer
  ctx.fillStyle = TEXT_DIM
  ctx.font = '12px "DM Sans", system-ui, sans-serif'
  ctx.fillText('madrono-perruno.vercel.app · datos: Ayuntamiento de Madrid', PADDING, H - FOOTER_BAND + 18)

  URL.revokeObjectURL(svgUrl)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/png')
  })
}

/**
 * Capture and trigger native share if available, else download.
 * Returns 'shared' or 'downloaded'.
 */
export async function shareOrDownloadChart(
  args: CaptureArgs,
): Promise<'shared' | 'downloaded'> {
  const blob = await captureChartAsBlob(args)
  const file = new File([blob], `${args.filename}.png`, { type: 'image/png' })
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean
    share?: (data: ShareData) => Promise<void>
  }
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    await nav.share({
      files: [file],
      title: args.title,
      text: `${args.title} · Madroño Perruno · https://madrono-perruno.vercel.app`,
    })
    return 'shared'
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${args.filename}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return 'downloaded'
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
