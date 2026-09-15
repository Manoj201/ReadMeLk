import { cn } from '@/lib/utils'

/**
 * Decorative, theme-aware vector artwork. No photographs / external assets — every
 * scene is drawn with the current theme tokens (see .claude/planning/06-design-system.md)
 * so it adapts to light and dark and scales cleanly on any screen. Deliberately
 * book-focused rather than any cultural iconography — the platform's identity is
 * "a great place to find your next book," not a themed backdrop.
 * All are aria-hidden; they never carry meaning.
 */

/** Hero illustration: an open book, a small stack beside it, soft brand-color glow. */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 520"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
    >
      <defs>
        <linearGradient id="hero-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--brand-primary) / 0.12)' }} />
          <stop offset="55%" style={{ stopColor: 'hsl(var(--brand-accent) / 0.08)' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--background) / 0)' }} />
        </linearGradient>
        <pattern id="hero-grid" width="42" height="42" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className="fill-foreground" opacity="0.1" />
        </pattern>
      </defs>

      <rect width="800" height="520" fill="url(#hero-glow)" />
      <rect width="800" height="520" fill="url(#hero-grid)" />

      {/* soft depth blobs */}
      <circle cx="640" cy="140" r="150" className="fill-primary" opacity="0.05" />
      <circle cx="520" cy="360" r="120" className="fill-brand-accent" opacity="0.08" />

      {/* rating sparkles, drifting above the book */}
      <g className="fill-brand-accent" opacity="0.8">
        <Star x={470} y={110} s={14} />
        <Star x={520} y={70} s={10} />
        <Star x={430} y={60} s={8} />
      </g>

      {/* open book */}
      <g transform="translate(430 330)">
        <path
          d="M0 -6C-64-24-118-18-156 0L-156 96C-118 78-64 84 0 100Z"
          className="fill-card stroke-border"
          strokeWidth="1.5"
        />
        <path
          d="M0 -6C64-24 118-18 156 0L156 96C118 78 64 84 0 100Z"
          className="fill-card stroke-border"
          strokeWidth="1.5"
        />
        <path d="M0 -6V100" className="stroke-border" strokeWidth="1.5" />
        <g
          className="stroke-muted-foreground"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        >
          <path d="M-128 18h86M-128 34h70M-128 50h78M-128 66h56" />
          <path d="M42 18h86M42 34h70M42 50h78M42 66h56" />
        </g>
      </g>

      {/* small stack of books beside it */}
      <g transform="translate(560 372)">
        <rect y="46" width="166" height="22" rx="4" className="fill-primary" />
        <rect x="8" y="50" width="150" height="4" className="fill-background" opacity="0.35" />
        <rect y="22" width="146" height="22" rx="4" className="fill-brand-accent" />
        <rect x="8" y="26" width="130" height="4" className="fill-background" opacity="0.35" />
        <rect y="0" width="122" height="20" rx="4" className="fill-secondary stroke-border" />
      </g>

      {/* ground line */}
      <path d="M0 452c200-14 420-14 800 0v68H0Z" className="fill-[hsl(var(--paper-sunk))]" />
    </svg>
  )
}

function Star({ x, y, s }: { x: number; y: number; s: number }) {
  const p = s * 0.42
  return (
    <path
      d={`M${x} ${y - s}L${x + p} ${y - p}L${x + s} ${y}L${x + p} ${y + p}L${x} ${y + s}L${x - p} ${y + p}L${x - s} ${y}L${x - p} ${y - p}Z`}
    />
  )
}

/** Slim banner of book spines — used on section / page headers. */
export function ShelfBanner({ className }: { className?: string }) {
  const spines = [
    'fill-primary',
    'fill-brand-accent',
    'fill-secondary',
    'fill-primary',
    'fill-brand-accent',
    'fill-secondary',
    'fill-primary',
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
            <rect
              x={x + 2}
              y={38 - h + 4}
              width={w - 4}
              height="2"
              className="fill-background"
              opacity="0.5"
            />
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
    ['hsl(var(--primary))', 'hsl(var(--brand-primary-deep))'],
    ['hsl(var(--brand-accent))', 'hsl(var(--brand-accent-deep))'],
    ['hsl(var(--info))', 'hsl(var(--primary))'],
    ['hsl(var(--brand-accent))', 'hsl(var(--primary))'],
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

/** An open book whose pages lift into rating sparkles. */
export function OpenBookBanner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 90"
      preserveAspectRatio="xMidYMid meet"
      className={cn('h-16 w-full max-w-[240px]', className)}
    >
      <path
        d="M20 66c26-14 52-14 78 0V22c-26-12-52-12-78 0Z"
        className="fill-card stroke-border"
        strokeWidth="1.5"
      />
      <path
        d="M118 66c26-14 52-14 78 0V22c-26-12-52-12-78 0Z"
        className="fill-card stroke-border"
        strokeWidth="1.5"
      />
      <path d="M108 20v46" className="stroke-border" strokeWidth="2" />
      <g
        className="stroke-primary"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      >
        <path d="M150 26c6-6 12-6 18 0M172 18c5-5 10-5 15 0M196 30c5-5 10-5 15 0M186 44c5-5 10-5 15 0" />
      </g>
    </svg>
  )
}
