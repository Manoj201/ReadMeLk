import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, LoadingBlock } from '@/components/StateBlocks'
import { MotifDivider } from '@/components/motifs'
import { AuthorCard } from './AuthorCard'
import { useAuthors } from './hooks'

export function AuthorsBrowsePage() {
  const { t } = useTranslation('author')
  const { data, isLoading, isError, refetch } = useAuthors()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return data ?? []
    return (data ?? []).filter(
      (a) =>
        a.nameEn.toLowerCase().includes(needle) || a.nameSi.toLowerCase().includes(needle),
    )
  }, [data, q])

  return (
    <div className="container py-8">
      <h1 className="font-serif text-2xl font-semibold">{t('browse.title')}</h1>
      <MotifDivider className="my-4 max-w-xs" />
      <Input
        className="mb-6 max-w-sm"
        placeholder={t('browse.searchPlaceholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {isLoading ? (
        <LoadingBlock rows={6} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('browse.empty')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AuthorCard key={a.id} author={a} />
          ))}
        </div>
      )}
    </div>
  )
}
