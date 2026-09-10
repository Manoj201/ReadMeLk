import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { toast } from '@/hooks/use-toast'
import {
  adminDeleteAuthor,
  setAuthorApproval,
  setAuthorFeatured,
  setAuthorVerified,
} from './api'
import { useActor, useAdminAuthors } from './hooks'

type Filter = 'pending' | 'approved' | 'rejected' | 'all'

export function AuthorsAdminPage() {
  const { t } = useTranslation('admin')
  const actor = useActor()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('pending')
  const { data, isLoading } = useAdminAuthors(filter === 'all' ? undefined : filter)

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return data ?? []
    return (data ?? []).filter(
      (a) => a.nameEn.toLowerCase().includes(needle) || a.nameSi.toLowerCase().includes(needle),
    )
  }, [data, q])

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ['admin'] })
  }

  async function approval(id: string, status: 'approved' | 'rejected') {
    await setAuthorApproval(actor, id, status)
    toast({ description: t(`authors.${status}`), variant: 'success' })
    await refresh()
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-xl font-semibold">{t('authors.title')}</h1>
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="pending">{t('authors.filter.pending')}</TabsTrigger>
            <TabsTrigger value="approved">{t('authors.filter.approved')}</TabsTrigger>
            <TabsTrigger value="rejected">{t('authors.filter.rejected')}</TabsTrigger>
            <TabsTrigger value="all">{t('authors.filter.all')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          className="max-w-xs"
          placeholder={t('authors.searchPlaceholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {isLoading ? (
        <LoadingBlock rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState title={t('authors.title')} />
      ) : (
        <ul className="space-y-2">
          {rows.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm"
            >
              <Link
                to={`/authors/${a.id}`}
                className="font-medium underline underline-offset-2"
              >
                {a.nameEn || a.nameSi || a.id}
              </Link>
              <Badge variant={a.status === 'approved' ? 'success' : 'muted'}>
                {t(`authors.status.${a.status ?? 'pending'}`)}
              </Badge>
              {a.verified ? <BadgeCheck className="h-4 w-4 text-primary" /> : null}
              {a.featured ? <Star className="h-4 w-4 text-rating" /> : null}
              <span className="text-muted-foreground">· {a.bookCount} books</span>
              <div className="ml-auto flex flex-wrap gap-2">
                {a.status !== 'approved' ? (
                  <Button size="sm" onClick={() => approval(a.id, 'approved')}>
                    {t('authors.approve')}
                  </Button>
                ) : null}
                {a.status !== 'rejected' ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => approval(a.id, 'rejected')}
                  >
                    {t('authors.reject')}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await setAuthorVerified(actor, a.id, !a.verified)
                    toast({
                      description: t(a.verified ? 'authors.unverify' : 'authors.verify'),
                      variant: 'success',
                    })
                    await refresh()
                  }}
                >
                  {a.verified ? t('authors.unverify') : t('authors.verify')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await setAuthorFeatured(actor, a.id, !a.featured)
                    toast({
                      description: t(a.featured ? 'authors.unfeature' : 'authors.feature'),
                      variant: 'success',
                    })
                    await refresh()
                  }}
                >
                  {a.featured ? t('authors.unfeature') : t('authors.feature')}
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/authors/${a.id}/edit`}>{t('authors.editProfile')}</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={async () => {
                    if (!window.confirm(t('authors.deleteConfirm'))) return
                    await adminDeleteAuthor(actor, a)
                    toast({ description: t('authors.delete'), variant: 'success' })
                    await refresh()
                  }}
                >
                  {t('authors.delete')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
