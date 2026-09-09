import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BadgeCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RatingStars } from '@/components/RatingStars'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { formatRating } from '@/lib/format'
import type { Author } from '@/types'

export function AuthorCard({ author }: { author: Author }) {
  const { t } = useTranslation('book')
  const { active, pick } = useLocalizedField()
  const name = pick(author.nameEn, author.nameSi).value || '—'

  return (
    <Link
      to={`/authors/${author.id}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <Avatar className="h-12 w-12">
        {author.photoURL ? <AvatarImage src={author.photoURL} alt="" /> : null}
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="flex items-center gap-1 font-medium">
          <span className="truncate">{name}</span>
          {author.verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-primary" /> : null}
        </p>
        {author.ratingCount > 0 ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <RatingStars value={author.ratingAvg} size="sm" />
            {formatRating(author.ratingAvg, active)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{t('card.noRatings')}</span>
        )}
      </div>
    </Link>
  )
}
