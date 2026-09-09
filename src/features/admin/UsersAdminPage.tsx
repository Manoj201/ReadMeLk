import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { toast } from '@/hooks/use-toast'
import { setUserAuthorRole } from './api'
import { useActor, useAdminUsers } from './hooks'

export function UsersAdminPage() {
  const { t } = useTranslation('admin')
  const actor = useActor()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const { data, isLoading } = useAdminUsers()

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return data ?? []
    return (data ?? []).filter(
      (u) =>
        u.displayName.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle),
    )
  }, [data, q])

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-xl font-semibold">{t('users.title')}</h1>
      <p className="text-xs text-muted-foreground">{t('users.adminNote')}</p>
      <Input
        className="max-w-xs"
        placeholder={t('users.searchPlaceholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {isLoading ? (
        <LoadingBlock rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState title={t('users.title')} />
      ) : (
        <ul className="space-y-2">
          {rows.map((u) => {
            const isAuthor = u.roles.includes('author')
            return (
              <li
                key={u.uid}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm"
              >
                <span className="font-medium">{u.displayName}</span>
                {u.roles.map((r) => (
                  <Badge key={r} variant="muted">
                    {r}
                  </Badge>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={async () => {
                    await setUserAuthorRole(actor, u, !isAuthor)
                    toast({
                      description: t(isAuthor ? 'users.revokeAuthor' : 'users.grantAuthor'),
                      variant: 'success',
                    })
                    await qc.invalidateQueries({ queryKey: ['admin'] })
                  }}
                >
                  {isAuthor ? t('users.revokeAuthor') : t('users.grantAuthor')}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
