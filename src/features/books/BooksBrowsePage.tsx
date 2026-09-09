import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState, ErrorState, LoadingBlock } from '@/components/StateBlocks'
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

  const [genre, setGenre] = useState(params.get('genre') ?? '')
  const [language, setLanguage] = useState<BookLang | ''>('')
  const [minRating, setMinRating] = useState(0)
  const [sort, setSort] = useState<'top' | 'recent'>('top')
  const [q, setQ] = useState('')

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

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <Input
          className="w-full max-w-xs"
          placeholder={t('browse.searchPlaceholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          value={genre || ANY}
          onValueChange={(v) => {
            const next = v === ANY ? '' : v
            setGenre(next)
            const p = new URLSearchParams(params)
            if (next) p.set('genre', next)
            else p.delete('genre')
            setParams(p, { replace: true })
          }}
        >
          <SelectTrigger className="w-40">
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
          onValueChange={(v) => setLanguage(v === ANY ? '' : (v as BookLang))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t('browse.filters.language')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t('browse.filters.anyLanguage')}</SelectItem>
            <SelectItem value="si">{t('language.si')}</SelectItem>
            <SelectItem value="en">{t('language.en')}</SelectItem>
            <SelectItem value="bilingual">{t('language.bilingual')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(minRating)} onValueChange={(v) => setMinRating(Number(v))}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t('browse.filters.minRating')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">{t('browse.filters.anyRating')}</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="4.5">4.5+</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as 'top' | 'recent')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">{t('browse.sort.top')}</SelectItem>
            <SelectItem value="recent">{t('browse.sort.recent')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingBlock rows={4} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : shown.length === 0 ? (
        <EmptyState title={t('browse.empty')} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  )
}
