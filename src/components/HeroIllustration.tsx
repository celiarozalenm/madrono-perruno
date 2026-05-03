// Placeholder for the hero illustration. The user will provide the final
// asset — until then this just reserves the space with a soft cream tile
// so the bento layout doesn't collapse.

interface Props {
  className?: string
}

export default function HeroIllustration({ className = '' }: Props) {
  return (
    <div
      className={`flex items-center justify-center bg-stone-100 border border-dashed border-stone-300 rounded-xl text-stone-400 text-xs uppercase tracking-[0.18em] font-semibold ${className}`}
      aria-hidden
    >
      Hero illustration · pendiente
    </div>
  )
}
