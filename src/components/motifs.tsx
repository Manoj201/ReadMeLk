import { cn } from '@/lib/utils'

/**
 * Decorative heritage motifs. All are aria-hidden and use currentColor so callers
 * control the tint. See .claude/planning/06-design-system.md.
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
      <path
        d="M120 2c-6 0-9 4-9 6s3 6 9 6 9-4 9-6-3-6-9-6Zm0 2.5c4 0 6 2 6 3.5s-2 3.5-6 3.5-6-2-6-3.5 2-3.5 6-3.5Z"
        fill="currentColor"
        className="text-secondary"
      />
      <path
        d="M96 8c6-5 12-5 12 0-6 5-12 5-12 0Zm48 0c-6-5-12-5-12 0 6 5 12 5 12 0Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  )
}

export function LotusMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={cn('h-7 w-7 text-primary', className)}
      fill="none"
    >
      <path
        d="M16 3c2.6 3.2 3.9 6.7 3.9 10.4 0 1.4-.2 2.7-.6 4M16 3c-2.6 3.2-3.9 6.7-3.9 10.4 0 1.4.2 2.7.6 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 12c3.7.6 6.7 2.3 9 5 .9 1.1 1.6 2.3 2 3.6M26 12c-3.7.6-6.7 2.3-9 5-.9 1.1-1.6 2.3-2 3.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-secondary"
      />
      <path
        d="M16 29c5-2 8-6 8-11-3.5 0-6.5 1.4-8 4-1.5-2.6-4.5-4-8-4 0 5 3 9 8 11Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function OlaLeafTexture({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="ola" width="48" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 7h48" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path
            d="M12 3v8M24 3v8M36 3v8"
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.3"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ola)" />
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
