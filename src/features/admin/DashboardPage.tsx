import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { formatRelative } from '@/lib/format'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { useAdminStats, useRecentActions } from './hooks'

export function DashboardPage() {
  const { t } = useTranslation('admin')
  const { active } = useLocalizedField()
  const stats = useAdminStats()
  const actions = useRecentActions()

  const cards: { key: string; value?: number }[] = [
    { key: 'counts.users', value: stats.data?.users },
    { key: 'counts.authors', value: stats.data?.authors },
    { key: 'counts.books', value: stats.data?.books },
    { key: 'counts.reviews', value: stats.data?.reviews },
    { key: 'counts.openReports', value: stats.data?.openReports },
    { key: 'counts.pendingReviews', value: stats.data?.pendingReviews },
    { key: 'counts.pendingAuthors', value: stats.data?.pendingAuthors },
    { key: 'counts.pendingBooks', value: stats.data?.pendingBooks },
  ]

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-semibold">{t('dashboard.title')}</h1>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.key}>
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold tabular-nums">
                {stats.isLoading ? '—' : (c.value ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">{t(c.key)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          {actions.isLoading ? (
            <LoadingBlock />
          ) : actions.data && actions.data.length > 0 ? (
            <ul className="divide-y divide-border text-sm">
              {actions.data.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    <span className="font-medium">{a.actorName}</span>{' '}
                    <span className="text-muted-foreground">{a.action}</span>{' '}
                    <span className="text-muted-foreground">
                      {a.targetType}/{a.targetId.slice(0, 6)}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelative(a.createdAt, active)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t('dashboard.noActions')} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
