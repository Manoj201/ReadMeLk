import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RatingStars } from '@/components/RatingStars'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { formatRating } from '@/lib/format'
import { genreLabel } from '@/lib/genres'
import type { Author } from '@/types'

export function AuthorCard({ author }: { author: Author }) {
  const { t } = useTranslation('book')
  const { active, pick } = useLocalizedField()
  const name = pick(author.nameEn, author.nameSi).value || '—'
  const bio = pick(author.bioEn, author.bioSi).value
  const primaryGenre = author.genres[0]
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <Link
      to={`/authors/${author.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
    >
      <div className="relative h-28 w-full overflow-hidden">
        {author.coverURL ? (
          <img
            src={author.coverURL}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(135deg, hsl(var(--header-gradient-1)), hsl(var(--header-gradient-3)))',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--header-gradient-2))]/60 via-transparent to-transparent" />

        {author.featured || author.verified ? (
          <span className="absolute left-3 top-3 rounded-full border border-brand-accent/60 bg-black/30 px-3 py-1 text-xs font-medium text-brand-accent backdrop-blur">
            {author.featured ? t('card.featured') : t('card.verified')}
          </span>
        ) : null}
      </div>

      <div className="relative px-4">
        <Avatar className="absolute -top-8 left-4 h-16 w-16 border-4 border-card shadow-md">
          {author.photoURL ? <AvatarImage src={author.photoURL} alt="" /> : null}
          <AvatarFallback className="font-serif text-base">{initials}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 pt-10">
        <div>
          {primaryGenre ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {genreLabel(primaryGenre, active)}
            </p>
          ) : null}
          <p className="truncate font-serif text-xl font-semibold">{name}</p>
        </div>

        {author.location ? (
          <p className="font-serif text-sm italic text-brand-accent-deep">{author.location}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {t('card.bookCount', { count: author.bookCount })}
          </span>
          {author.ratingCount > 0 ? (
            <span className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              <RatingStars value={author.ratingAvg} size="sm" />
              {formatRating(author.ratingAvg, active)}
            </span>
          ) : (
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {t('card.noRatings')}
            </span>
          )}
        </div>

        {bio ? <p className="line-clamp-3 text-sm text-muted-foreground">{bio}</p> : null}

        <span className="mt-auto flex items-center gap-1 pt-1 text-sm font-medium text-primary">
          {t('card.viewProfile')}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
