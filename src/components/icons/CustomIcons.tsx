// Custom line icons — drawn to match the editorial style of the new
// landing. Stroke-based, 24x24, currentColor. They replace lucide-react
// where the meaning is dataset-specific (papelera, área canina, parque,
// veterinario, huella).

interface IconProps {
  size?: number
  strokeWidth?: number
  className?: string
}

const baseProps = (size: number, strokeWidth: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
})

// Bin with poop bag dispenser — lid + dispenser slot + bin body.
export function PapeleraIcon({ size = 22, strokeWidth = 1.7, className }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)} aria-hidden>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M3 8h18" />
      <path d="M9 5h6v3H9z" />
      <path d="M8 12v5M12 12v5M16 12v5" />
      <circle cx="19.5" cy="3.5" r="1.5" />
    </svg>
  )
}

// Off-leash dog area — fenced area with paw inside.
export function AreaCaninaIcon({ size = 22, strokeWidth = 1.7, className }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)} aria-hidden>
      <path d="M3 7v13M21 7v13" />
      <path d="M3 7l3-3h12l3 3" />
      <path d="M3 11h18M3 16h18" />
      <path d="M7 7v13M11 7v13M15 7v13M19 7v13" opacity="0.35" />
      {/* Tiny paw inside the fence */}
      <g transform="translate(8 13.5)">
        <ellipse cx="4" cy="3.6" rx="2.2" ry="1.6" />
        <circle cx="1" cy="1.2" r="0.8" />
        <circle cx="3.4" cy="0.2" r="0.8" />
        <circle cx="5.4" cy="0.2" r="0.8" />
        <circle cx="7" cy="1.2" r="0.8" />
      </g>
    </svg>
  )
}

// Urban park — tree silhouette + bench + ground line.
export function ParqueIcon({ size = 22, strokeWidth = 1.7, className }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)} aria-hidden>
      {/* Tree */}
      <path d="M8 14a4 4 0 1 1 8 0" />
      <path d="M6.5 11a4 4 0 1 1 7 1.5" />
      <path d="M10.5 14v4" />
      {/* Bench */}
      <path d="M3 19h6" />
      <path d="M3 19v2M9 19v2M3 17l6 1" />
      {/* Ground */}
      <path d="M2 22h20" />
      <path d="M14 22v-3M19 22v-3" />
    </svg>
  )
}

// Drinking fountain — water drop with a small dog snout cue at the base
// to hint that some fountains are pet-accessible. Stays single-color.
export function FuenteIcon({ size = 22, strokeWidth = 1.7, className }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)} aria-hidden>
      <path d="M12 3c2.5 3.5 5 6.5 5 10a5 5 0 0 1-10 0c0-3.5 2.5-6.5 5-10Z" />
      <path d="M10 13a2 2 0 0 0 4 0" />
    </svg>
  )
}

// Vet — cross + heart hint.
export function VetIcon({ size = 22, strokeWidth = 1.7, className }: IconProps) {
  return (
    <svg {...baseProps(size, strokeWidth, className)} aria-hidden>
      <path d="M5 8a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
      <path d="M12 8v8M8 12h8" />
      <circle cx="6.5" cy="6.5" r="0.6" fill="currentColor" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

// Paw stamp — used as a decorative bullet / numbered bullet alternative.
export function PawIcon({ size = 22, strokeWidth = 0, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke={strokeWidth ? 'currentColor' : 'none'}
      strokeWidth={strokeWidth || 0}
      className={className}
      aria-hidden
    >
      <ellipse cx="12" cy="16" rx="5.4" ry="4.2" />
      <ellipse cx="5.6" cy="10.5" rx="2" ry="2.6" />
      <ellipse cx="9.6" cy="7.5" rx="1.8" ry="2.4" />
      <ellipse cx="14.4" cy="7.5" rx="1.8" ry="2.4" />
      <ellipse cx="18.4" cy="10.5" rx="2" ry="2.6" />
    </svg>
  )
}

// Madrid bear-and-strawberry-tree mark — abstract, single-color.
export function MadronoMarkIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="14" y="11" width="2" height="9" rx="0.5" />
      <circle cx="15" cy="7" r="4" />
      <circle cx="19" cy="9" r="2.5" />
      <circle cx="11" cy="9" r="2.5" />
      <circle cx="17" cy="4" r="2.2" />
      <circle cx="13" cy="4.5" r="2.2" />
      {/* Bear hint at base */}
      <path d="M3 20c1-3 4-4 7-4s6 1 7 4H3Z" />
      <circle cx="7" cy="15" r="2.4" />
      <circle cx="6.4" cy="14.4" r="0.4" fill="#faf7f2" />
    </svg>
  )
}
