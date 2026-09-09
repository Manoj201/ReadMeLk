import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { toast } from '@/hooks/use-toast'
import { adminDeleteBook, setBookFeatured } from './api'
import { useActor, useAdminBooks } from './hooks'

export function BooksAdminPage() {
  const { t } = useTranslation('admin')
  const actor = useActor()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const { data, isLoading } = useAdminBooks()

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return data ?? []
    return (data ?? []).filter(
      (b) =>
        b.titleEn.toLowerCase().includes(needle) || b.titleSi.toLowerCase().includes(needle),
    )
  }, [data, q])

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-xl font-semibold">{t('books.title')}</h1>
      <Input
        className="max-w-xs"
        placeholder={t('books.searchPlaceholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {isLoading ? (
        <LoadingBlock rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState title={t('books.title')} />
      ) : (
        <ul className="space-y-2">
          {rows.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm"
            >
              <Link to={`/books/${b.id}`} className="font-medium underline underline-offset-2">
                {b.titleEn || b.titleSi || b.id}
              </Link>
              {b.featured ? <Star className="h-4 w-4 text-rating" /> : null}
              <span className="text-muted-foreground">
                · {b.ratingAvg.toFixed(1)} ({b.ratingCount})
              </span>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await setBookFeatured(actor, b.id, !b.featured)
                    toast({
                      description: t(b.featured ? 'books.unfeature' : 'books.feature'),
                      variant: 'success',
                    })
                    await qc.invalidateQueries({ queryKey: ['admin'] })
                  }}
                >
                  {b.featured ? t('books.unfeature') : t('books.feature')}
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/books/${b.id}/edit`}>{t('books.edit')}</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={async () => {
                    if (!window.confirm(t('books.deleteConfirm'))) return
                    await adminDeleteBook(actor, b)
                    toast({ description: t('books.delete'), variant: 'success' })
                    await qc.invalidateQueries({ queryKey: ['admin'] })
                  }}
                >
                  {t('books.delete')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
