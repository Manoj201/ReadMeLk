import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BadgeCheck, Globe, Link2, MapPin, Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState } from '@/components/StateBlocks'
import {
  AuthorProfileSkeleton,
  BookCardSkeleton,
  ReviewListSkeleton,
} from '@/components/Skeletons'
import { GenreBadges, BilingualChip } from '@/components/forms'
import { RatingStars } from '@/components/RatingStars'
import { RatingSummary } from '@/components/RatingSummary'
import { MotifDivider, SubtleTexture } from '@/components/motifs'
import { ReviewForm } from '@/features/reviews/ReviewForm'
import { ReviewList } from '@/features/reviews/ReviewList'
import { BookCard } from '@/features/books/BookCard'
import { useReviews } from '@/features/reviews/hooks'
import { buildDistribution } from '@/features/reviews/api'
import { useBooksByAuthor } from '@/features/books/hooks'
import { useAuthStore } from '@/stores/authStore'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { formatRating } from '@/lib/format'
import { useAuthor } from './hooks'

export function AuthorProfilePage() {
  const { authorId } = useParams()
  const { t } = useTranslation('author')
  const { t: tc } = useTranslation('common')
  const { t: tBook } = useTranslation('book')
  const { pick, active } = useLocalizedField()
  const uid = useAuthStore((s) => s.user?.uid ?? null)
  const isAdminClaim = useAuthStore((s) => s.isAdminClaim)

  const authorQ = useAuthor(authorId)
  // !!uid guards against a signed-out visitor (uid === null) matching an unclaimed
  // author's ownerUid (also null) and triggering an unfiltered — and rule-rejected — query
  const canSeeAllBooks =
    !!authorQ.data && (isAdminClaim || (!!uid && authorQ.data.ownerUid === uid))
  const booksQ = useBooksByAuthor(authorId, canSeeAllBooks)
  const reviewsQ = useReviews('author', authorId)

  if (authorQ.isLoading) return <AuthorProfileSkeleton />
  if (authorQ.isError) return <ErrorState onRetry={() => authorQ.refetch()} />
  const author = authorQ.data
  if (!author) return <EmptyState title={t('profile.notFound')} />

  const name = pick(author.nameEn, author.nameSi)
  const bio = pick(author.bioEn, author.bioSi)
  const isOwner = !!uid && uid === author.ownerUid
  const reviews = reviewsQ.data ?? []
  const showModerationBanner = (isOwner || isAdminClaim) && author.status !== 'approved'

  return (
    <div>
      <div className="relative border-b border-border bg-card">
        {author.coverURL ? (
          <img src={author.coverURL} alt="" className="h-40 w-full object-cover sm:h-56" />
        ) : (
          <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/10 sm:h-40">
            <SubtleTexture className="text-foreground opacity-[0.06]" />
          </div>
        )}
        <div className="container relative pb-6 pt-16 sm:pt-6">
          <Avatar className="absolute -top-12 left-4 h-24 w-24 border-4 border-background">
            {author.photoURL ? <AvatarImage src={author.photoURL} alt="" /> : null}
            <AvatarFallback className="text-xl">
              {name.value.slice(0, 2).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:pl-32">
            <div className="flex-1">
              <h1 className="flex items-center gap-2 font-serif text-2xl font-semibold sm:text-3xl">
                {name.value || '—'}
                {author.verified ? (
                  <span className="inline-flex items-center gap-1 text-sm font-normal text-primary">
                    <BadgeCheck className="h-4 w-4" />
                    {t('profile.verified')}
                  </span>
                ) : null}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <GenreBadges genres={author.genres} />
                {author.ratingCount > 0 ? (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <RatingStars value={author.ratingAvg} size="sm" />
                    <span className="font-medium text-foreground">
                      {formatRating(author.ratingAvg, active)}
                    </span>
                    <span>{tBook('card.ratingsCount', { count: author.ratingCount })}</span>
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {tBook('card.noRatings')}
                  </span>
                )}
              </div>
            </div>
            {isOwner ? (
              <Button asChild variant="outline" size="sm">
                <Link to={`/authors/${author.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  {t('form.editTitle')}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {showModerationBanner ? (
            <p className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
              {t(
                author.status === 'rejected'
                  ? 'profile.rejectedBanner'
                  : 'profile.pendingBanner',
              )}
            </p>
          ) : null}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 font-serif text-lg font-semibold">
              {t('profile.about')} {bio.isFallback ? <BilingualChip shown={bio.lang!} /> : null}
            </h2>
            {bio.value ? (
              <p className="whitespace-pre-line text-foreground/90">{bio.value}</p>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold">{t('profile.booksTitle')}</h2>
              {isOwner ? (
                <Button asChild size="sm">
                  <Link to="/books/new">
                    <Plus className="h-4 w-4" />
                    {tc('nav.addBook')}
                  </Link>
                </Button>
              ) : null}
            </div>
            {booksQ.isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <BookCardSkeleton key={i} />
                ))}
              </div>
            ) : booksQ.data && booksQ.data.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {booksQ.data.map((b) => (
                  <div key={b.id} className="space-y-1">
                    <BookCard book={b} />
                    {b.status !== 'approved' ? (
                      <Badge variant="muted">{t(`profile.bookStatus.${b.status}`)}</Badge>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title={t('profile.noBooks')}
                action={
                  isOwner ? (
                    <Button asChild size="sm">
                      <Link to="/books/new">{tc('nav.addBook')}</Link>
                    </Button>
                  ) : undefined
                }
              />
            )}
          </section>

          <section>
            <h2 className="mb-3 font-serif text-lg font-semibold">
              {t('profile.reviewsTitle')}
            </h2>
            <MotifDivider className="mb-4 max-w-xs" />
            {author.status === 'approved' ? (
              <div className="mb-6">
                <ReviewForm targetType="author" targetId={author.id} />
              </div>
            ) : null}
            {reviewsQ.isLoading ? <ReviewListSkeleton /> : <ReviewList reviews={reviews} />}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-xl border border-border bg-card p-5">
            <RatingSummary
              ratingAvg={author.ratingAvg}
              ratingCount={author.ratingCount}
              reviewCount={author.reviewCount}
              distribution={buildDistribution(reviews)}
            />
          </div>

          {author.location ||
          author.birthYear ||
          author.bookCount > 0 ||
          author.website ||
          author.socialLinks.length > 0 ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 font-serif text-lg font-semibold">
                {tBook('detail.details')}
              </h2>
              <dl className="space-y-2.5 text-sm">
                {author.location ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {t('profile.location')}
                    </dt>
                    <dd className="text-right font-medium">{author.location}</dd>
                  </div>
                ) : null}
                {author.birthYear ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{t('profile.born')}</dt>
                    <dd className="text-right font-medium">{author.birthYear}</dd>
                  </div>
                ) : null}
                {author.bookCount > 0 ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{t('profile.booksTitle')}</dt>
                    <dd className="text-right font-medium">
                      {tBook('card.bookCount', { count: author.bookCount })}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {author.website || author.socialLinks.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  {author.website ? (
                    <a
                      href={author.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {t('profile.website')}
                    </a>
                  ) : null}
                  {author.socialLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
