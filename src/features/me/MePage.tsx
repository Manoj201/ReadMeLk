import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { RatingStars } from '@/components/RatingStars'
import { useAuthStore, hasRole } from '@/stores/authStore'
import { useMyReviews } from '@/features/reviews/hooks'

export function MePage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useMyReviews(user?.uid)

  if (!user) return null

  return (
    <div className="container max-w-3xl space-y-6 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-2xl font-semibold">{user.displayName}</h1>
        {user.roles.map((r) => (
          <Badge key={r} variant="muted">
            {r}
          </Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('nav.becomeAuthor')}</CardTitle>
        </CardHeader>
        <CardContent>
          {hasRole(user, 'author') && user.authorProfileId ? (
            <Button asChild variant="outline">
              <Link to={`/authors/${user.authorProfileId}`}>{t('nav.myProfile')}</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/register/author">{t('nav.becomeAuthor')}</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('nav.myProfile')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingBlock />
          ) : data && data.length > 0 ? (
            <ul className="divide-y divide-border">
              {data.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3 text-sm">
                  <RatingStars value={r.rating} size="sm" />
                  <span className="line-clamp-1 flex-1">{r.body}</span>
                  <Link
                    to={`/${r.targetType === 'book' ? 'books' : 'authors'}/${r.targetId}`}
                    className="shrink-0 underline underline-offset-2"
                  >
                    {t('actions.viewAll')}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t('state.empty')} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
