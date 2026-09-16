import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState, ErrorState } from '@/components/StateBlocks'
import { BookCardSkeleton } from '@/components/Skeletons'
import { ShelfBanner } from '@/components/artwork'
import { GENRES, genreLabel } from '@/lib/genres'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { hasRole, useAuthStore } from '@/stores/authStore'
import type { BookLang } from '@/types'
import { BookCard } from './BookCard'
import { useBooks } from './hooks'
import type { BookFilters } from './api'

const ANY = '__any__'

export function BooksBrowsePage() {
  const { t } = useTranslation('book')
  const { t: tc } = useTranslation('common')
  const { active } = useLocalizedField()
  const isAuthor = useAuthStore((s) => hasRole(s.user, 'author') && !!s.user?.authorProfileId)
  const [params, setParams] = useSearchParams()

  // genre/language/minRating/sort drive the actual query, so they're kept in the URL
  // (shareable, survives back/forward); `q` is an instant client-side filter, kept local
  const genre = params.get('genre') ?? ''
  const language = (params.get('language') as BookLang | null) ?? ''
  const minRating = Number(params.get('minRating') ?? 0)
  const sort = (params.get('sort') as 'top' | 'recent' | null) ?? 'top'
  const [q, setQ] = useState('')

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(params)
    if (value) p.set(key, value)
    else p.delete(key)
    setParams(p, { replace: true })
  }

  const hasActiveFilters = !!genre || !!language || minRating > 0 || sort !== 'top' || !!q

  function clearFilters() {
    setParams(new URLSearchParams(), { replace: true })
    setQ('')
  }

  const filters: BookFilters = useMemo(
    () => ({ genre: genre || undefined, language, minRating, sort }),
    [genre, language, minRating, sort],
  )
  const { data, isLoading, isError, refetch } = useBooks(filters)

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return data ?? []
    return (data ?? []).filter(
      (b) =>
        b.titleEn.toLowerCase().includes(needle) || b.titleSi.toLowerCase().includes(needle),
    )
  }, [data, q])

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4">
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">{t('browse.title')}</h1>
        {isAuthor ? (
          <Button asChild size="sm">
            <Link to="/books/new">
              <Plus className="h-4 w-4" />
              {tc('nav.addBook')}
            </Link>
          </Button>
        ) : (
          <ShelfBanner className="hidden max-w-[220px] shrink-0 sm:block" />
        )}
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
          <Input
            className="col-span-2 sm:w-56"
            placeholder={t('browse.searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select
            value={genre || ANY}
            onValueChange={(v) => updateParam('genre', v === ANY ? '' : v)}
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder={t('browse.filters.genre')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t('browse.filters.anyGenre')}</SelectItem>
              {GENRES.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {genreLabel(g.value, active)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={language || ANY}
            onValueChange={(v) => updateParam('language', v === ANY ? '' : v)}
          >
            <SelectTrigger className="sm:w-36">
              <SelectValue placeholder={t('browse.filters.language')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t('browse.filters.anyLanguage')}</SelectItem>
              <SelectItem value="si">{t('language.si')}</SelectItem>
              <SelectItem value="en">{t('language.en')}</SelectItem>
              <SelectItem value="bilingual">{t('language.bilingual')}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={String(minRating)}
            onValueChange={(v) => updateParam('minRating', v === '0' ? '' : v)}
          >
            <SelectTrigger className="sm:w-36">
              <SelectValue placeholder={t('browse.filters.minRating')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t('browse.filters.anyRating')}</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="4.5">4.5+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => updateParam('sort', v === 'top' ? '' : v)}>
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">{t('browse.sort.top')}</SelectItem>
              <SelectItem value="recent">{t('browse.sort.recent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm text-muted-foreground">
          <span>{isLoading ? ' ' : t('browse.resultsCount', { count: shown.length })}</span>
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" />
              {t('browse.clearFilters')}
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : shown.length === 0 ? (
        <EmptyState
          title={t('browse.empty')}
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {t('browse.clearFilters')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  )
}
