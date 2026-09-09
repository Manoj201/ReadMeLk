import { useTranslation } from 'react-i18next'
import { RatingStars } from '@/components/RatingStars'
import { formatRating } from '@/lib/format'
import { useLocalizedField } from '@/hooks/useLocalizedField'

interface Props {
  ratingAvg: number
  ratingCount: number
  reviewCount: number
  distribution?: Record<1 | 2 | 3 | 4 | 5, number>
}

export function RatingSummary({ ratingAvg, ratingCount, reviewCount, distribution }: Props) {
  const { t } = useTranslation('review')
  const { active } = useLocalizedField()
  const total = ratingCount || 1

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex flex-col items-center">
        <span className="font-serif text-4xl font-semibold">
          {formatRating(ratingAvg, active)}
        </span>
        <RatingStars value={ratingAvg} />
        <span className="mt-1 text-xs text-muted-foreground">
          {t('summary.ratingsLabel', { count: ratingCount })}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('summary.reviewsLabel', { count: reviewCount })}
        </span>
      </div>
      {distribution ? (
        <ul className="flex-1 space-y-1" aria-label={t('summary.distribution')}>
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = distribution[star] ?? 0
            const pct = Math.round((count / total) * 100)
            return (
              <li key={star} className="flex items-center gap-2 text-xs">
                <span className="w-14 shrink-0 text-muted-foreground">
                  {t('summary.stars', { count: star })}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-rating"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">
                  {count}
                </span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
