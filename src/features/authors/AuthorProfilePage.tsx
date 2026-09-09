import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BadgeCheck, Globe, MapPin, Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState, ErrorState, LoadingBlock } from '@/components/StateBlocks'
import { GenreBadges, BilingualChip } from '@/components/forms'
import { RatingSummary } from '@/components/RatingSummary'
import { OlaLeafTexture } from '@/components/motifs'
import { ReviewForm } from '@/features/reviews/ReviewForm'
import { ReviewList } from '@/features/reviews/ReviewList'
import { BookCard } from '@/features/books/BookCard'
import { useReviews } from '@/features/reviews/hooks'
import { buildDistribution } from '@/features/reviews/api'
import { useBooksByAuthor } from '@/features/books/hooks'
import { useAuthStore } from '@/stores/authStore'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { useAuthor } from './hooks'

export function AuthorProfilePage() {
  const { authorId } = useParams()
  const { t } = useTranslation('author')
  const { t: tc } = useTranslation('common')
  const { pick } = useLocalizedField()
  const uid = useAuthStore((s) => s.user?.uid ?? null)

  const authorQ = useAuthor(authorId)
  const booksQ = useBooksByAuthor(authorId)
  const reviewsQ = useReviews('author', authorId)

  if (authorQ.isLoading) return <LoadingBlock className="container py-12" />
  if (authorQ.isError) return <ErrorState onRetry={() => authorQ.refetch()} />
  const author = authorQ.data
  if (!author) return <EmptyState title={t('browse.empty')} />

  const name = pick(author.nameEn, author.nameSi)
  const bio = pick(author.bioEn, author.bioSi)
  const isOwner = uid === author.ownerUid
  const reviews = reviewsQ.data ?? []

  return (
    <div>
      <div className="relative border-b border-border bg-card">
        {author.coverURL ? (
          <img src={author.coverURL} alt="" className="h-40 w-full object-cover sm:h-56" />
        ) : (
          <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/10 sm:h-40">
            <OlaLeafTexture className="text-foreground opacity-[0.06]" />
          </div>
        )}
        <div className="container relative -mt-12 flex flex-col gap-4 pb-6 sm:flex-row sm:items-end">
          <Avatar className="h-24 w-24 border-4 border-background">
            {author.photoURL ? <AvatarImage src={author.photoURL} alt="" /> : null}
            <AvatarFallback className="text-xl">
              {name.value.slice(0, 2).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 font-serif text-2xl font-semibold">
              {name.value || '—'}
              {author.verified ? (
                <span className="inline-flex items-center gap-1 text-sm font-normal text-primary">
                  <BadgeCheck className="h-4 w-4" />
                  {t('profile.verified')}
                </span>
              ) : null}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {author.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {author.location}
                </span>
              ) : null}
              {author.birthYear ? (
                <span>
                  {t('profile.born')} {author.birthYear}
                </span>
              ) : null}
              {author.website ? (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {t('profile.website')}
                </a>
              ) : null}
            </div>
            <div className="mt-2">
              <GenreBadges genres={author.genres} />
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

      <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-2 font-serif text-lg font-semibold">
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
              <LoadingBlock />
            ) : booksQ.data && booksQ.data.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {booksQ.data.map((b) => (
                  <BookCard key={b.id} book={b} />
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
            {reviewsQ.isLoading ? <LoadingBlock /> : <ReviewList reviews={reviews} />}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <RatingSummary
              ratingAvg={author.ratingAvg}
              ratingCount={author.ratingCount}
              reviewCount={author.reviewCount}
              distribution={buildDistribution(reviews)}
            />
          </div>
          <Tabs defaultValue="write">
            <TabsList className="w-full">
              <TabsTrigger value="write" className="flex-1">
                {t('profile.writeReview')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="write">
              <ReviewForm targetType="author" targetId={author.id} />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  )
}
