import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { CoverFallback } from '@/components/artwork'
import { RatingStars } from '@/components/RatingStars'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { formatRating } from '@/lib/format'
import type { Book } from '@/types'

/**
 * Spotlight card for the home page "Featured Books" section — larger than the plain
 * grid `BookCard`, and surfaces the book's Sinhala-only highlight excerpt (if the
 * author wrote one) as a teaser with a "Read more" link to the full text on the book
 * page (`#highlight`, which `:target` in index.css already scrolls to under the header).
 */
export function BookHighlightCard({ book }: { book: Book }) {
  const { t } = useTranslation('book')
  const { active, pick } = useLocalizedField()
  const title = pick(book.titleEn, book.titleSi).value || '—'
  const author = pick(book.authorNameEn, book.authorNameSi).value

  return (
    <div className="group flex gap-4 overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:gap-5">
      <Link
        to={`/books/${book.id}`}
        className="aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-md bg-muted sm:w-32"
      >
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
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Link
          to={`/books/${book.id}`}
          className="font-serif text-lg font-semibold leading-snug hover:underline"
        >
          {title}
        </Link>
        {author ? (
          <p className="text-sm text-muted-foreground">{t('detail.by', { name: author })}</p>
        ) : null}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {book.ratingCount > 0 ? (
            <>
              <RatingStars value={book.ratingAvg} size="sm" />
              <span>{formatRating(book.ratingAvg, active)}</span>
            </>
          ) : (
            <span>{t('card.noRatings')}</span>
          )}
        </div>
        {book.highlightSi ? (
          <>
            <p className="mt-1 line-clamp-3 font-sinhala text-sm leading-relaxed text-foreground/90">
              {book.highlightSi}
            </p>
            <Link
              to={`/books/${book.id}#highlight`}
              className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-primary hover:underline"
            >
              {t('highlight.readMore')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        ) : null}
      </div>
    </div>
  )
}
