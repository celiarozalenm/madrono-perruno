interface Props {
  className?: string
}

export default function HeroIllustration({ className = '' }: Props) {
  return (
    <img
      src="/hero.svg"
      alt=""
      className={`w-full h-auto select-none pointer-events-none ${className}`}
      aria-hidden
      draggable={false}
    />
  )
}
