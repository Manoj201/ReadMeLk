import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { CoverFallback } from '@/components/artwork'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState } from '@/components/StateBlocks'
import { BookDetailSkeleton, ReviewListSkeleton } from '@/components/Skeletons'
import { BilingualChip, GenreBadges } from '@/components/forms'
import { RatingStars } from '@/components/RatingStars'
import { RatingSummary } from '@/components/RatingSummary'
import { MotifDivider } from '@/components/motifs'
import { ReviewForm } from '@/features/reviews/ReviewForm'
import { ReviewList } from '@/features/reviews/ReviewList'
import { useReviews } from '@/features/reviews/hooks'
import { buildDistribution } from '@/features/reviews/api'
import { useAuthStore } from '@/stores/authStore'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { formatRating } from '@/lib/format'
import { useBook } from './hooks'

export function BookDetailPage() {
  const { bookId } = useParams()
  const { t } = useTranslation('book')
  const { pick, active } = useLocalizedField()
  const uid = useAuthStore((s) => s.user?.uid ?? null)
  const isAdminClaim = useAuthStore((s) => s.isAdminClaim)

  const bookQ = useBook(bookId)
  const reviewsQ = useReviews('book', bookId)

  if (bookQ.isLoading) return <BookDetailSkeleton />
  if (bookQ.isError) return <ErrorState onRetry={() => bookQ.refetch()} />
  const book = bookQ.data
  if (!book) return <EmptyState title={t('detail.notFound')} />

  const title = pick(book.titleEn, book.titleSi)
  const desc = pick(book.descriptionEn, book.descriptionSi)
  const authorName = pick(book.authorNameEn, book.authorNameSi).value
  // !!uid guards against a signed-out visitor (uid === null) matching an unclaimed
  // book's ownerUid (also null)
  const isOwner = !!uid && uid === book.ownerUid
  const reviews = reviewsQ.data ?? []
  const canModeratePreview = isOwner || isAdminClaim

  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        {canModeratePreview && book.status !== 'approved' ? (
          <p className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            {t(book.status === 'rejected' ? 'detail.rejectedBanner' : 'detail.pendingBanner')}
          </p>
        ) : null}
        <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row">
          <div className="mx-auto aspect-[3/4] w-48 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:mx-0 sm:w-64">
            {book.coverURL ? (
              <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <CoverFallback seed={book.id.charCodeAt(0) + book.id.length} />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-semibold sm:text-3xl">
                {title.value || '—'}{' '}
                {title.isFallback ? <BilingualChip shown={title.lang!} /> : null}
              </h1>
              {authorName ? (
                <p className="text-muted-foreground">
                  {t('detail.by', { name: '' })}
                  <Link
                    to={`/authors/${book.authorId}`}
                    className="underline underline-offset-2"
                  >
                    {authorName}
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{t('detail.authorRemoved')}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <GenreBadges genres={book.genres} />
              {book.ratingCount > 0 ? (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <RatingStars value={book.ratingAvg} size="sm" />
                  <span className="font-medium text-foreground">
                    {formatRating(book.ratingAvg, active)}
                  </span>
                  <span>{t('card.ratingsCount', { count: book.ratingCount })}</span>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">{t('card.noRatings')}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm">
                <a href="#review-form">{t('detail.writeReview')}</a>
              </Button>
              {isOwner ? (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/books/${book.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    {t('form.editTitle')}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 font-serif text-lg font-semibold">
            {t('detail.about')} {desc.isFallback ? <BilingualChip shown={desc.lang!} /> : null}
          </h2>
          <p className="whitespace-pre-line text-foreground/90">{desc.value || '—'}</p>
        </section>

        {book.highlightSi ? (
          <section
            id="highlight"
            className="rounded-xl border-l-4 border-secondary bg-accent/60 p-6"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-accent-foreground">
              {t('highlight.badge')}
            </span>
            <p className="mt-2 whitespace-pre-line font-sinhala text-base leading-relaxed text-foreground/90">
              {book.highlightSi}
            </p>
          </section>
        ) : null}

        <section>
          <h2 className="mb-3 font-serif text-lg font-semibold">{t('detail.reviewsTitle')}</h2>
          <MotifDivider className="mb-4 max-w-xs" />
          {book.status === 'approved' ? (
            <div className="mb-6">
              <ReviewForm targetType="book" targetId={book.id} />
            </div>
          ) : null}
          {reviewsQ.isLoading ? <ReviewListSkeleton /> : <ReviewList reviews={reviews} />}
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-20 lg:h-fit">
        <div className="rounded-xl border border-border bg-card p-5">
          <RatingSummary
            ratingAvg={book.ratingAvg}
            ratingCount={book.ratingCount}
            reviewCount={book.reviewCount}
            distribution={buildDistribution(reviews)}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-serif text-lg font-semibold">{t('detail.details')}</h2>
          <dl className="space-y-2.5 text-sm">
            {book.publishedYear ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{t('detail.year')}</dt>
                <dd className="text-right font-medium">{book.publishedYear}</dd>
              </div>
            ) : null}
            {book.publisher ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{t('detail.publisher')}</dt>
                <dd className="text-right font-medium">{book.publisher}</dd>
              </div>
            ) : null}
            {book.pageCount ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{t('detail.pages')}</dt>
                <dd className="text-right font-medium">{book.pageCount}</dd>
              </div>
            ) : null}
            {book.isbn ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{t('detail.isbn')}</dt>
                <dd className="text-right font-medium">{book.isbn}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{t('detail.language')}</dt>
              <dd className="text-right font-medium">{t(`language.${book.language}`)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  )
}
