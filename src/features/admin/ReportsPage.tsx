import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { RatingStars } from '@/components/RatingStars'
import { toast } from '@/hooks/use-toast'
import type { Report } from '@/types'
import { dismissReport, fetchReviewById, setReviewRemoved } from './api'
import { useActor, useOpenReports } from './hooks'

function ReportRow({ report }: { report: Report }) {
  const { t } = useTranslation('admin')
  const actor = useActor()
  const qc = useQueryClient()
  const { data: review, isLoading } = useQuery({
    queryKey: ['admin', 'review', report.reviewId],
    queryFn: () => fetchReviewById(report.reviewId),
  })

  async function invalidate() {
    await qc.invalidateQueries({ queryKey: ['admin'] })
  }

  return (
    <li className="space-y-2 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline">{report.reason}</Badge>
        <span className="text-muted-foreground">
          {t('reports.reportedBy')} {report.reporterUid ? report.reporterUid.slice(0, 6) : t('reports.guest')}
        </span>
        <Link
          to={`/${report.targetType === 'book' ? 'books' : 'authors'}/${report.targetId}`}
          className="ml-auto underline underline-offset-2"
        >
          {t('reports.viewTarget')}
        </Link>
      </div>
      {report.note ? <p className="text-sm text-muted-foreground">{report.note}</p> : null}

      {isLoading ? (
        <LoadingBlock rows={1} />
      ) : review ? (
        <div className="rounded-md bg-muted/50 p-3 text-sm">
          <div className="flex items-center gap-2">
            <RatingStars value={review.rating} size="sm" />
            <span className="font-medium">{review.reviewerName}</span>
            <Badge variant={review.status === 'removed' ? 'muted' : 'success'}>
              {t(`reviews.status.${review.status}`)}
            </Badge>
          </div>
          <p className="mt-1 whitespace-pre-line">{review.body}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          disabled={!review || review.status === 'removed'}
          onClick={async () => {
            if (!review) return
            await setReviewRemoved(actor, review, true, report.id)
            toast({ description: t('reports.removeReview'), variant: 'success' })
            await invalidate()
          }}
        >
          {t('reports.removeReview')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await dismissReport(actor, report.id)
            toast({ description: t('reports.dismiss'), variant: 'success' })
            await invalidate()
          }}
        >
          {t('reports.dismiss')}
        </Button>
      </div>
    </li>
  )
}

export function ReportsPage() {
  const { t } = useTranslation('admin')
  const { data, isLoading } = useOpenReports()

  if (isLoading) return <LoadingBlock rows={4} />
  if (!data || data.length === 0) return <EmptyState title={t('reports.empty')} />

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-xl font-semibold">{t('reports.title')}</h1>
      <ul className="space-y-3">
        {data.map((r) => (
          <ReportRow key={r.id} report={r} />
        ))}
      </ul>
    </div>
  )
}
