import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CoverFallback } from '@/components/artwork'
import { RatingStars } from '@/components/RatingStars'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { formatRating } from '@/lib/format'
import type { Book } from '@/types'

export function BookCard({ book }: { book: Book }) {
  const { t } = useTranslation('book')
  const { active, pick } = useLocalizedField()
  const title = pick(book.titleEn, book.titleSi).value || '—'
  const author = pick(book.authorNameEn, book.authorNameSi).value

  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
        {book.coverURL ? (
          <img
            src={book.coverURL}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <CoverFallback
            seed={book.id.charCodeAt(0) + book.id.length}
            className="transition-transform group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 font-serif font-medium leading-tight">{title}</p>
        {author ? (
          <p className="text-xs text-muted-foreground">{t('detail.by', { name: author })}</p>
        ) : null}
        <div className="mt-auto flex items-center gap-1 pt-1 text-xs text-muted-foreground">
          {book.ratingCount > 0 ? (
            <>
              <RatingStars value={book.ratingAvg} size="sm" />
              <span>{formatRating(book.ratingAvg, active)}</span>
              <span>· {t('card.ratingsCount', { count: book.ratingCount })}</span>
            </>
          ) : (
            <span>{t('card.noRatings')}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
