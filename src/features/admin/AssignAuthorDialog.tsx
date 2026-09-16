import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import type { Author } from '@/types'
import { claimAuthorProfile, findUserByEmail } from './api'
import { useActor } from './hooks'

/** Admin action: link an unclaimed author profile to a registered user by email. */
export function AssignAuthorDialog({ author }: { author: Author }) {
  const { t } = useTranslation('admin')
  const actor = useActor()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(author.claimEmail ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = email.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      const target = await findUserByEmail(trimmed)
      if (!target) {
        setError(t('authors.assignDialog.notFound'))
        return
      }
      if (target.authorProfileId) {
        setError(t('authors.assignDialog.alreadyAuthor'))
        return
      }
      await claimAuthorProfile(actor, author.id, target)
      toast({ description: t('authors.assignDialog.success'), variant: 'success' })
      setOpen(false)
      await qc.invalidateQueries({ queryKey: ['admin'] })
    } catch (err) {
      console.error(err)
      setError(t('authors.assignDialog.notFound'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="h-4 w-4" />
          {t('authors.assign')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('authors.assignDialog.title')}</DialogTitle>
          <DialogDescription>{author.nameEn || author.nameSi}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="assignEmail">{t('authors.assignDialog.emailLabel')}</Label>
            <Input
              id="assignEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" loading={busy}>
            {t('authors.assignDialog.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
