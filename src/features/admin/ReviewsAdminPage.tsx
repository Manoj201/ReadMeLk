import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { RatingStars } from '@/components/RatingStars'
import { toast } from '@/hooks/use-toast'
import type { Review } from '@/types'
import { setReviewRemoved } from './api'
import { useActor, useAdminReviews } from './hooks'

type Filter = 'all' | 'published' | 'removed'

export function ReviewsAdminPage() {
  const { t } = useTranslation('admin')
  const actor = useActor()
  const qc = useQueryClient()
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const { data, isLoading } = useAdminReviews(filter === 'all' ? undefined : filter)

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return data ?? []
    return (data ?? []).filter(
      (r) =>
        r.body.toLowerCase().includes(needle) || r.reviewerName.toLowerCase().includes(needle),
    )
  }, [data, q])

  async function act(review: Review, removed: boolean) {
    await setReviewRemoved(actor, review, removed)
    toast({
      description: t(removed ? 'reviews.remove' : 'reviews.restore'),
      variant: 'success',
    })
    await qc.invalidateQueries({ queryKey: ['admin'] })
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-xl font-semibold">{t('reviews.title')}</h1>
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">{t('reviews.filter.all')}</TabsTrigger>
            <TabsTrigger value="published">{t('reviews.filter.published')}</TabsTrigger>
            <TabsTrigger value="removed">{t('reviews.filter.removed')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          className="max-w-xs"
          placeholder={t('reviews.searchPlaceholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {isLoading ? (
        <LoadingBlock rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState title={t('reviews.title')} />
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-card p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <RatingStars value={r.rating} size="sm" />
                <span className="font-medium">{r.reviewerName}</span>
                <Badge variant={r.isGuest ? 'muted' : 'success'}>
                  {r.isGuest ? 'guest' : 'verified'}
                </Badge>
                <Badge variant={r.status === 'removed' ? 'muted' : 'outline'}>
                  {t(`reviews.status.${r.status}`)}
                </Badge>
                <Link
                  to={`/${r.targetType === 'book' ? 'books' : 'authors'}/${r.targetId}`}
                  className="ml-auto underline underline-offset-2"
                >
                  →
                </Link>
              </div>
              <p className="mt-1 line-clamp-3 whitespace-pre-line text-foreground/90">
                {r.body}
              </p>
              <div className="mt-2">
                {r.status === 'removed' ? (
                  <Button size="sm" variant="outline" onClick={() => act(r, false)}>
                    {t('reviews.restore')}
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => act(r, true)}>
                    {t('reviews.remove')}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
