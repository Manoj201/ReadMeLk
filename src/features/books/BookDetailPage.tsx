import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { CoverFallback } from '@/components/artwork'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingBlock } from '@/components/StateBlocks'
import { BilingualChip, GenreBadges } from '@/components/forms'
import { RatingSummary } from '@/components/RatingSummary'
import { MotifDivider } from '@/components/motifs'
import { ReviewForm } from '@/features/reviews/ReviewForm'
import { ReviewList } from '@/features/reviews/ReviewList'
import { useReviews } from '@/features/reviews/hooks'
import { buildDistribution } from '@/features/reviews/api'
import { useAuthStore } from '@/stores/authStore'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { useBook } from './hooks'

export function BookDetailPage() {
  const { bookId } = useParams()
  const { t } = useTranslation('book')
  const { pick } = useLocalizedField()
  const uid = useAuthStore((s) => s.user?.uid ?? null)

  const bookQ = useBook(bookId)
  const reviewsQ = useReviews('book', bookId)

  if (bookQ.isLoading) return <LoadingBlock className="container py-12" />
  if (bookQ.isError) return <ErrorState onRetry={() => bookQ.refetch()} />
  const book = bookQ.data
  if (!book) return <EmptyState title={t('detail.notFound')} />

  const title = pick(book.titleEn, book.titleSi)
  const desc = pick(book.descriptionEn, book.descriptionSi)
  const authorName = pick(book.authorNameEn, book.authorNameSi).value
  const isOwner = uid === book.ownerUid
  const reviews = reviewsQ.data ?? []

  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="mx-auto aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:mx-0">
            {book.coverURL ? (
              <img src={book.coverURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <CoverFallback seed={book.id.charCodeAt(0) + book.id.length} />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <h1 className="font-serif text-2xl font-semibold">
              {title.value || '—'}{' '}
              {title.isFallback ? <BilingualChip shown={title.lang!} /> : null}
            </h1>
            {authorName ? (
              <p className="text-muted-foreground">
                {t('detail.by', { name: '' })}
                <Link to={`/authors/${book.authorId}`} className="underline underline-offset-2">
                  {authorName}
                </Link>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">{t('detail.authorRemoved')}</p>
            )}
            <GenreBadges genres={book.genres} />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm" className="lg:hidden">
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

        <section>
          <h2 className="mb-2 font-serif text-lg font-semibold">
            {t('detail.about')} {desc.isFallback ? <BilingualChip shown={desc.lang!} /> : null}
          </h2>
          <p className="whitespace-pre-line text-foreground/90">{desc.value || '—'}</p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-lg font-semibold">{t('detail.details')}</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            {book.publishedYear ? (
              <div>
                <dt className="text-muted-foreground">{t('detail.year')}</dt>
                <dd>{book.publishedYear}</dd>
              </div>
            ) : null}
            {book.publisher ? (
              <div>
                <dt className="text-muted-foreground">{t('detail.publisher')}</dt>
                <dd>{book.publisher}</dd>
              </div>
            ) : null}
            {book.pageCount ? (
              <div>
                <dt className="text-muted-foreground">{t('detail.pages')}</dt>
                <dd>{book.pageCount}</dd>
              </div>
            ) : null}
            {book.isbn ? (
              <div>
                <dt className="text-muted-foreground">{t('detail.isbn')}</dt>
                <dd>{book.isbn}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">{t('detail.language')}</dt>
              <dd>{t(`language.${book.language}`)}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="mb-3 font-serif text-lg font-semibold">{t('detail.reviewsTitle')}</h2>
          <MotifDivider className="mb-4 max-w-xs" />
          {reviewsQ.isLoading ? <LoadingBlock /> : <ReviewList reviews={reviews} />}
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <RatingSummary
            ratingAvg={book.ratingAvg}
            ratingCount={book.ratingCount}
            reviewCount={book.reviewCount}
            distribution={buildDistribution(reviews)}
          />
        </div>
        <ReviewForm targetType="book" targetId={book.id} />
      </aside>
    </div>
  )
}
