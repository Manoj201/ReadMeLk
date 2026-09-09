import { useState } from 'react'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { Rating } from '@/types'

interface DisplayProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-6 w-6' }

/** Read-only star rendering (supports halves visually by rounding). */
export function RatingStars({ value, size = 'md', className }: DisplayProps) {
  const rounded = Math.round(value)
  return (
    <span
      className={cn('inline-flex items-center gap-0.5 text-rating', className)}
      aria-hidden="true"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(sizes[size], n <= rounded ? 'fill-current' : 'opacity-30')}
        />
      ))}
    </span>
  )
}

interface InputProps {
  value: Rating | 0
  onChange: (value: Rating) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  id?: string
}

/** Interactive rating input — keyboard accessible via a radiogroup. */
export function RatingInput({ value, onChange, size = 'lg', className, id }: InputProps) {
  const { t } = useTranslation('review')
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value

  return (
    <div
      id={id}
      role="radiogroup"
      tabIndex={-1}
      aria-label={t('form.ratingLabel')}
      className={cn('inline-flex items-center gap-1', className)}
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={t('stars.set', { value: n })}
          className="rounded-sm p-0.5 text-rating focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(null)}
          onClick={() => onChange(n as Rating)}
        >
          <Star className={cn(sizes[size], n <= shown ? 'fill-current' : 'opacity-30')} />
        </button>
      ))}
    </div>
  )
}
