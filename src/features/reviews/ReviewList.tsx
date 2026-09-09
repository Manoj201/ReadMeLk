import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RatingStars } from '@/components/RatingStars'
import { EmptyState } from '@/components/StateBlocks'
import { formatRelative } from '@/lib/format'
import { toast } from '@/hooks/use-toast'
import { useAuthStore, hasRole } from '@/stores/authStore'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import type { Review } from '@/types'
import { deleteReview } from './api'
import { reviewTitleFor } from './ReviewForm'
import { ReportDialog } from './ReportDialog'

function ReviewItem({ review }: { review: Review }) {
  const { t } = useTranslation('review')
  const { active } = useLocalizedField()
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const mine = !!user && review.authorUid === user.uid
  const canDelete = mine || hasRole(user, 'admin')
  const title = reviewTitleFor(review, active)

  async function onDelete() {
    if (!window.confirm(t('form.deleteConfirm'))) return
    try {
      await deleteReview(review)
      toast({ description: t('list.delete'), variant: 'success' })
      await qc.invalidateQueries({ queryKey: ['reviews', review.targetType, review.targetId] })
      await qc.invalidateQueries({ queryKey: [review.targetType, review.targetId] })
    } catch {
      toast({ description: t('list.delete'), variant: 'destructive' })
    }
  }

  return (
    <li className="border-b border-border py-4 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <RatingStars value={review.rating} size="sm" />
        <span className="font-medium">{review.reviewerName}</span>
        <Badge variant={review.isGuest ? 'muted' : 'success'}>
          {review.isGuest ? t('list.guestBadge') : t('list.verifiedBadge')}
        </Badge>
        {review.bodyLang !== active ? (
          <Badge variant="outline">{review.bodyLang === 'si' ? 'සිංහල' : 'English'}</Badge>
        ) : null}
        <span className="ml-auto text-xs text-muted-foreground">
          {formatRelative(review.updatedAt ?? review.createdAt, active)}
        </span>
      </div>
      {title ? <p className="mt-2 font-serif font-medium">{title}</p> : null}
      <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{review.body}</p>
      <div className="mt-2 flex items-center gap-1">
        <ReportDialog review={review} />
        {canDelete ? (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onDelete}>
            {t('list.delete')}
          </Button>
        ) : null}
      </div>
    </li>
  )
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const { t } = useTranslation('review')
  if (reviews.length === 0) return <EmptyState title={t('list.empty')} />
  return (
    <ul>
      {reviews.map((r) => (
        <ReviewItem key={r.id} review={r} />
      ))}
    </ul>
  )
}
