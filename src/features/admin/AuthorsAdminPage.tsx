import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { toast } from '@/hooks/use-toast'
import { adminDeleteAuthor, setAuthorFeatured, setAuthorVerified } from './api'
import { useActor, useAdminAuthors } from './hooks'

export function AuthorsAdminPage() {
  const { t } = useTranslation('admin')
  const actor = useActor()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const { data, isLoading } = useAdminAuthors()

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

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-xl font-semibold">{t('authors.title')}</h1>
      <Input
        className="max-w-xs"
        placeholder={t('authors.searchPlaceholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
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
              {a.verified ? <BadgeCheck className="h-4 w-4 text-primary" /> : null}
              {a.featured ? <Star className="h-4 w-4 text-rating" /> : null}
              <span className="text-muted-foreground">· {a.bookCount} books</span>
              <div className="ml-auto flex gap-2">
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
