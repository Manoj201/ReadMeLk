import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Crown, Globe, Link2 } from 'lucide-react'
import { CoverFallback } from '@/components/artwork'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RatingStars } from '@/components/RatingStars'
import { LoadingBlock } from '@/components/StateBlocks'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { formatRating } from '@/lib/format'
import { genreLabel } from '@/lib/genres'
import type { Author, Book } from '@/types'

function PillLink({
  to,
  external,
  gold,
  children,
}: {
  to: string
  external?: boolean
  gold?: boolean
  children: ReactNode
}) {
  const className = gold
    ? 'inline-flex items-center gap-1.5 rounded-full bg-brand-accent px-4 py-1.5 text-sm font-medium text-[hsl(var(--header-gradient-2))] transition-colors hover:bg-brand-accent-deep'
    : 'inline-flex items-center gap-1.5 rounded-full border border-brand-accent/50 px-4 py-1.5 text-sm font-medium text-brand-accent transition-colors hover:bg-brand-accent/10'
  return external ? (
    <a href={to} target="_blank" rel="noreferrer noopener" className={className}>
      {children}
    </a>
  ) : (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}

function SpotlightBlock({
  eyebrow,
  to,
  image,
  imageFallback,
  avatar,
  overlayLabel,
  overlayTitle,
  badgeValue,
  badgeCaption,
  description,
  quote,
  actions,
}: {
  eyebrow: string
  to: string
  image: string | null
  imageFallback: ReactNode
  avatar?: { src: string | null; fallback: string }
  overlayLabel?: string
  overlayTitle: string
  badgeValue: string
  badgeCaption: string
  description: string
  quote?: string
  actions: ReactNode
}) {
  return (
    <div className="group relative h-full">
      {/* ambient gold glow that lifts the card off the section background, brightening on hover */}
      <div className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-brand-accent/15 opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-brand-accent/25 bg-white/[0.05] p-5 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/70 to-transparent" />

        <span className="mb-5 inline-flex items-center gap-1.5 self-start rounded-full bg-brand-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--header-gradient-2))] shadow-sm">
          <Crown className="h-3.5 w-3.5" />
          {eyebrow}
        </span>

        <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          <Link to={to} className="relative mx-auto block w-full max-w-sm">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl ring-1 ring-brand-accent/40 transition-transform duration-300 group-hover:scale-[1.02]">
              {image ? (
                <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                imageFallback
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--header-gradient-2))]/90 via-transparent to-transparent" />
              {/* badge stays inset within the cover so it never overlaps the text column beside it */}
              <div className="absolute right-3 top-3 flex flex-col items-center gap-0.5 rounded-xl border border-white/10 bg-[hsl(var(--header-gradient-1))]/95 px-3 py-2 text-center shadow-lg backdrop-blur">
                <span className="font-serif text-lg font-bold text-brand-accent">{badgeValue}</span>
                <span className="text-[10px] text-white/60">{badgeCaption}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4">
                {avatar ? (
                  <Avatar className="h-12 w-12 shrink-0 border-2 border-white/80 shadow-md">
                    {avatar.src ? <AvatarImage src={avatar.src} alt="" /> : null}
                    <AvatarFallback className="font-serif text-sm">{avatar.fallback}</AvatarFallback>
                  </Avatar>
                ) : null}
                <div className="min-w-0">
                  {overlayLabel ? (
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      {overlayLabel}
                    </p>
                  ) : null}
                  <p className="truncate font-serif text-xl font-semibold text-white">
                    {overlayTitle}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <div className="flex h-full min-w-0 flex-col gap-3 xl:pt-1">
            <Link
              to={to}
              className="truncate font-serif text-2xl font-semibold text-white transition-colors hover:text-brand-accent"
            >
              {overlayTitle}
            </Link>
            <p className="break-words text-base leading-relaxed text-white/75">{description}</p>

            {quote ? (
              <blockquote className="break-words border-l-2 border-brand-accent/60 pl-4 font-serif text-base italic leading-relaxed text-white/85">
                {quote}
              </blockquote>
            ) : null}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">{actions}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SpotlightSection({
  book,
  author,
  bookLoading,
  authorLoading,
}: {
  book: Book | undefined
  author: Author | undefined
  bookLoading: boolean
  authorLoading: boolean
}) {
  const { t } = useTranslation('home')
  const { t: tBook } = useTranslation('book')
  const { t: tAuthor } = useTranslation('author')
  const { active, pick } = useLocalizedField()

  if (!bookLoading && !book && !authorLoading && !author) return null

  return (
    <section
      className="relative overflow-hidden py-16 text-white"
      style={{
        backgroundImage:
          'linear-gradient(180deg, hsl(var(--header-gradient-1)) 0%, hsl(var(--header-gradient-3)) 100%)',
      }}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[hsl(var(--header-gradient-2))]/40 blur-3xl" />

      <div className="container relative flex flex-col gap-3">
        <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
          {t('spotlight.title')}
        </h2>
        <div className="mx-auto h-0.5 w-16 rounded-full bg-brand-accent" />
      </div>

      <div className="container relative mt-12 grid gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-10">
        {bookLoading ? (
          <LoadingBlock rows={3} />
        ) : book ? (
          <SpotlightBlock
            eyebrow={t('spotlight.book.eyebrow')}
            to={`/books/${book.id}`}
            image={book.coverURL}
            imageFallback={
              <CoverFallback seed={book.id.charCodeAt(0) + book.id.length} className="h-full w-full" />
            }
            overlayLabel={book.genres[0] ? genreLabel(book.genres[0], active) : undefined}
            overlayTitle={pick(book.titleEn, book.titleSi).value || '—'}
            badgeValue={
              book.ratingCount > 0
                ? formatRating(book.ratingAvg, active)
                : book.pageCount
                  ? `${book.pageCount}`
                  : '—'
            }
            badgeCaption={
              book.ratingCount > 0 ? t('spotlight.ratingLabel') : t('spotlight.pagesLabel')
            }
            description={pick(book.descriptionEn, book.descriptionSi).value}
            quote={book.highlightSi ?? undefined}
            actions={
              <>
                {book.ratingCount > 0 ? (
                  <span className="inline-flex items-center gap-1 pr-2 text-sm text-white/70">
                    <RatingStars value={book.ratingAvg} size="sm" />
                    {tBook('card.ratingsCount', { count: book.ratingCount })}
                  </span>
                ) : null}
                <PillLink to={`/authors/${book.authorId}`}>
                  {tBook('detail.by', {
                    name: pick(book.authorNameEn, book.authorNameSi).value,
                  })}
                </PillLink>
                <PillLink to={`/books/${book.id}`} gold>
                  {t('spotlight.viewDetails')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </PillLink>
              </>
            }
          />
        ) : null}

        {authorLoading ? (
          <LoadingBlock rows={3} />
        ) : author ? (
          <SpotlightBlock
            eyebrow={t('spotlight.author.eyebrow')}
            to={`/authors/${author.id}`}
            image={author.coverURL ?? author.photoURL}
            imageFallback={
              <div
                className="flex h-full w-full items-center justify-center font-serif text-4xl font-semibold text-white/30"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, hsl(var(--header-gradient-1)), hsl(var(--header-gradient-3)))',
                }}
              >
                {(pick(author.nameEn, author.nameSi).value || '—').slice(0, 2).toUpperCase()}
              </div>
            }
            avatar={{
              src: author.photoURL,
              fallback: (pick(author.nameEn, author.nameSi).value || '—').slice(0, 2).toUpperCase(),
            }}
            overlayLabel={author.genres[0] ? genreLabel(author.genres[0], active) : undefined}
            overlayTitle={pick(author.nameEn, author.nameSi).value || '—'}
            badgeValue={
              author.ratingCount > 0
                ? formatRating(author.ratingAvg, active)
                : `${author.bookCount}`
            }
            badgeCaption={
              author.ratingCount > 0 ? t('spotlight.ratingLabel') : t('spotlight.booksLabel')
            }
            description={pick(author.bioEn, author.bioSi).value}
            actions={
              <>
                {author.website ? (
                  <PillLink to={author.website} external>
                    <Globe className="h-3.5 w-3.5" />
                    {tAuthor('profile.website')}
                  </PillLink>
                ) : null}
                {author.socialLinks.map((link) => (
                  <PillLink key={link.url} to={link.url} external>
                    <Link2 className="h-3.5 w-3.5" />
                    {link.label}
                  </PillLink>
                ))}
                <PillLink to={`/authors/${author.id}`} gold>
                  {tBook('card.viewProfile')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </PillLink>
              </>
            }
          />
        ) : null}
      </div>
    </section>
  )
}
