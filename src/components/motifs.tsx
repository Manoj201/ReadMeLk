import { cn } from '@/lib/utils'

/**
 * Small decorative marks used across the shell (logo, dividers, textures). All are
 * aria-hidden and use currentColor so callers control the tint.
 */

export function MotifDivider({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 16"
      className={cn('h-4 w-full text-border', className)}
      preserveAspectRatio="none"
    >
      <path d="M0 8 H90 M150 8 H240" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="120" cy="8" r="4" fill="currentColor" className="text-brand-accent" />
      <path
        d="M96 8c6-5 12-5 12 0-6 5-12 5-12 0Zm48 0c-6-5-12-5-12 0 6 5 12 5 12 0Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  )
}

/** App logo mark: a simple open book. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={cn('h-7 w-7 text-primary', className)}
      fill="none"
    >
      <path
        d="M16 9c-3-2-7-2.6-10-2v17c3-.6 7 0 10 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 9c3-2 7-2.6 10-2v17c-3-.6-7 0-10 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 9v17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-brand-accent"
      />
    </svg>
  )
}

/** Faint tiling line texture for large empty backdrops (auth pages, profile covers). */
export function SubtleTexture({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="subtle-texture" width="48" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 7h48" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path
            d="M12 3v8M24 3v8M36 3v8"
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.3"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#subtle-texture)" />
    </svg>
  )
}

export function WovenStrip({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 8"
      className={cn('h-2 w-full text-border', className)}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="weave" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4h8M4 0v8" stroke="currentColor" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="40" height="8" fill="url(#weave)" />
    </svg>
  )
}
