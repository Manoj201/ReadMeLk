import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { addDoc, serverTimestamp } from 'firebase/firestore'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { reportsCol } from '@/lib/firestore'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import type { Review, ReportReason } from '@/types'

const REASONS: { value: ReportReason; key: string }[] = [
  { value: 'spam', key: 'report.reason.spam' },
  { value: 'offensive', key: 'report.reason.offensive' },
  { value: 'off-topic', key: 'report.reason.offTopic' },
  { value: 'not-a-review', key: 'report.reason.notReview' },
  { value: 'other', key: 'report.reason.other' },
]

export function ReportDialog({ review }: { review: Review }) {
  const { t } = useTranslation('review')
  const uid = useAuthStore((s) => s.user?.uid ?? null)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>('spam')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await addDoc(reportsCol, {
        reviewId: review.id,
        targetType: review.targetType,
        targetId: review.targetId,
        reason,
        note: note.trim(),
        reporterUid: uid,
        status: 'open',
        actionedBy: null,
        actionedAt: null,
        createdAt: serverTimestamp(),
      })
      toast({ description: t('report.done'), variant: 'success' })
      setOpen(false)
      setNote('')
    } catch {
      toast({ description: t('report.title'), variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="h-3.5 w-3.5" />
          {t('list.report')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('report.title')}</DialogTitle>
          <DialogDescription>{review.reviewerName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reason">{t('report.reasonLabel')}</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {t(r.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">{t('report.note')}</Label>
            <Textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {t('report.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
