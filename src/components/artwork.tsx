import { cn } from '@/lib/utils'

/**
 * Decorative, theme-aware vector artwork. No photographs / external assets — every
 * scene is drawn with the heritage palette (see .claude/planning/06-design-system.md)
 * so it adapts to light and dark and scales cleanly on any screen.
 * All are aria-hidden; they never carry meaning.
 */

/** Full hero scene: dagoba, coconut palms, hills, a flock of birds, a stack of books. */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 520"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--brand-gold) / 0.28)' }} />
          <stop offset="55%" style={{ stopColor: 'hsl(var(--brand-orange) / 0.14)' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--background) / 0)' }} />
        </linearGradient>
        <pattern id="hero-ola" width="46" height="13" patternUnits="userSpaceOnUse">
          <path d="M0 6.5h46" className="stroke-foreground" strokeWidth="1" opacity="0.12" />
          <path d="M15 2v9M31 2v9" className="stroke-foreground" strokeWidth="0.6" opacity="0.08" />
        </pattern>
      </defs>

      <rect width="800" height="520" fill="url(#hero-sky)" />
      <rect width="800" height="520" fill="url(#hero-ola)" />

      {/* sun */}
      <circle cx="620" cy="150" r="64" className="fill-secondary" opacity="0.55" />
      <circle cx="620" cy="150" r="64" className="fill-none stroke-secondary" strokeWidth="2" opacity="0.5" />

      {/* birds */}
      <g className="stroke-foreground" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5">
        <path d="M120 90c8-9 16-9 24 0M150 104c6-7 12-7 18 0M96 118c6-7 12-7 18 0" />
      </g>

      {/* far hills */}
      <path d="M0 360c120-46 220-40 340 0s260 46 460-6v166H0Z" className="fill-muted" opacity="0.8" />
      <path d="M0 400c160-40 300-24 470 10s220 20 330-8v108H0Z" className="fill-primary" opacity="0.12" />

      {/* dagoba (stupa) */}
      <g>
        <rect x="352" y="330" width="96" height="14" rx="3" className="fill-card" stroke="currentColor" strokeOpacity="0.15" />
        <path d="M360 330c0-46 18-78 40-78s40 32 40 78Z" className="fill-card" stroke="currentColor" strokeOpacity="0.15" />
        <rect x="392" y="214" width="16" height="30" className="fill-secondary" />
        <path d="M400 196l9 20h-18Z" className="fill-secondary" />
      </g>

      {/* coconut palms */}
      <PalmTree x={130} y={352} scale={1.15} />
      <PalmTree x={690} y={356} scale={0.95} flip />
      <PalmTree x={230} y={360} scale={0.8} />

      {/* ground */}
      <path d="M0 452c200-26 420-26 800 0v68H0Z" className="fill-[hsl(var(--paper-sunk))]" />

      {/* foreground stack of books */}
      <g transform="translate(300 396)">
        <rect x="0" y="60" width="210" height="24" rx="4" className="fill-primary" />
        <rect x="8" y="64" width="194" height="4" className="fill-background" opacity="0.4" />
        <rect x="14" y="36" width="188" height="24" rx="4" className="fill-[hsl(var(--brand-green))]" />
        <rect x="22" y="40" width="172" height="4" className="fill-background" opacity="0.4" />
        <rect x="4" y="12" width="176" height="24" rx="4" className="fill-secondary" />
        <rect x="12" y="16" width="160" height="4" className="fill-[hsl(var(--ink))]" opacity="0.25" />
      </g>
    </svg>
  )
}

function PalmTree({
  x,
  y,
  scale = 1,
  flip = false,
}: {
  x: number
  y: number
  scale?: number
  flip?: boolean
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * scale} ${scale})`}>
      <path
        d="M0 0C-6 -40 -4 -78 4 -112"
        className="stroke-[hsl(var(--brand-gold-deep))]"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <g className="fill-[hsl(var(--brand-green))]">
        <path d="M4 -112c-30 -6 -52 8 -64 30 26 -8 46 -8 64 -4Z" />
        <path d="M4 -112c30 -6 52 8 64 30 -26 -8 -46 -8 -64 -4Z" />
        <path d="M4 -112c-14 -26 -8 -52 6 -70 -2 26 -4 46 -6 66Z" />
        <path d="M4 -112c14 -24 34 -34 56 -34 -22 12 -38 22 -54 34Z" />
        <path d="M4 -112c-16 -22 -40 -30 -62 -26 24 10 42 16 58 28Z" />
      </g>
    </g>
  )
}

/** Slim banner of book spines — used on section / page headers. */
export function ShelfBanner({ className }: { className?: string }) {
  const spines = [
    'fill-primary',
    'fill-secondary',
    'fill-[hsl(var(--brand-green))]',
    'fill-[hsl(var(--brand-orange))]',
    'fill-primary',
    'fill-secondary',
    'fill-[hsl(var(--brand-green))]',
  ]
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 40"
      preserveAspectRatio="xMidYMid meet"
      className={cn('h-10 w-full max-w-[320px]', className)}
    >
      {spines.map((cls, i) => {
        const w = 12 + ((i * 7) % 16)
        const x = i * 34 + 6
        const h = 22 + ((i * 5) % 12)
        return (
          <g key={i}>
            <rect x={x} y={38 - h} width={w} height={h} rx="2" className={cls} opacity="0.9" />
            <rect x={x + 2} y={38 - h + 4} width={w - 4} height="2" className="fill-background" opacity="0.5" />
          </g>
        )
      })}
      <path d="M0 38h320" className="stroke-border" strokeWidth="2" />
    </svg>
  )
}

/** Themed stand-in for a missing book cover (keeps the grid looking designed). */
export function CoverFallback({ seed = 0, className }: { seed?: number; className?: string }) {
  const tints = [
    ['hsl(var(--primary))', 'hsl(var(--brand-crimson-deep))'],
    ['hsl(var(--brand-green))', 'hsl(var(--brand-gold-deep))'],
    ['hsl(var(--secondary))', 'hsl(var(--brand-orange))'],
    ['hsl(var(--brand-orange))', 'hsl(var(--primary))'],
  ]
  const [a, b] = tints[Math.abs(seed) % tints.length]
  const gid = `cf-${Math.abs(seed) % tints.length}`
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 90 120"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: a }} />
          <stop offset="100%" style={{ stopColor: b }} />
        </linearGradient>
      </defs>
      <rect width="90" height="120" fill={`url(#${gid})`} />
      <path d="M0 92c22-10 46-10 90 0v28H0Z" fill="#000" opacity="0.12" />
      <g className="stroke-background" strokeWidth="1.4" fill="none" opacity="0.5">
        <path d="M18 30c8-8 16-8 24 0M46 24c6-6 12-6 18 0" />
      </g>
      <path
        d="M45 58c9 0 15 4 20 9-5 5-11 9-20 9s-15-4-20-9c5-5 11-9 20-9Z"
        className="fill-background"
        opacity="0.25"
      />
      <circle cx="45" cy="67" r="4.5" className="fill-background" opacity="0.55" />
    </svg>
  )
}

/** An open book whose pages lift into a flock of birds. */
export function OpenBookBanner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 90"
      preserveAspectRatio="xMidYMid meet"
      className={cn('h-16 w-full max-w-[240px]', className)}
    >
      <path d="M20 66c26-14 52-14 78 0V22c-26-12-52-12-78 0Z" className="fill-card stroke-border" strokeWidth="1.5" />
      <path d="M118 66c26-14 52-14 78 0V22c-26-12-52-12-78 0Z" className="fill-card stroke-border" strokeWidth="1.5" />
      <path d="M108 20v46" className="stroke-border" strokeWidth="2" />
      <g className="stroke-primary" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M150 26c6-6 12-6 18 0M172 18c5-5 10-5 15 0M196 30c5-5 10-5 15 0M186 44c5-5 10-5 15 0" />
      </g>
    </svg>
  )
}
