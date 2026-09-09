import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RatingInput } from '@/components/RatingStars'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import type { ContentLang, Rating, Review, TargetType } from '@/types'
import { guestCooldownRemaining, submitReview } from './api'
import { useMyReview } from './hooks'

interface Props {
  targetType: TargetType
  targetId: string
}

export function ReviewForm({ targetType, targetId }: Props) {
  const { t } = useTranslation('review')
  const { active } = useLocalizedField()
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  const draftKey = `${targetType}:${targetId}`
  const draft = useUiStore((s) => s.reviewDrafts[draftKey])
  const setDraft = useUiStore((s) => s.setDraft)
  const clearDraft = useUiStore((s) => s.clearDraft)

  const { data: mine } = useMyReview(targetId, user?.uid)

  const [rating, setRating] = useState<Rating | 0>(draft?.rating ?? 0)
  const [bodyLang, setBodyLang] = useState<ContentLang>(draft?.bodyLang ?? active)
  const [titleEn, setTitleEn] = useState(draft?.titleEn ?? '')
  const [titleSi, setTitleSi] = useState(draft?.titleSi ?? '')
  const [body, setBody] = useState(draft?.body ?? '')
  const [guestName, setGuestName] = useState(draft?.guestName ?? '')
  const [honeypot, setHoneypot] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldownLeft, setCooldownLeft] = useState(0)

  // hydrate from an existing verified review
  useEffect(() => {
    if (mine) {
      setRating(mine.rating)
      setBodyLang(mine.bodyLang)
      setTitleEn(mine.titleEn ?? '')
      setTitleSi(mine.titleSi ?? '')
      setBody(mine.body)
    }
  }, [mine])

  useEffect(() => {
    if (user) return
    const tick = () => setCooldownLeft(guestCooldownRemaining(targetId))
    tick()
    const id = setInterval(tick, 15_000)
    return () => clearInterval(id)
  }, [user, targetId])

  // persist a lightweight draft as the user types (guests especially)
  useEffect(() => {
    setDraft(draftKey, { rating, bodyLang, titleEn, titleSi, body, guestName })
  }, [draftKey, rating, bodyLang, titleEn, titleSi, body, guestName, setDraft])

  const disabled = useMemo(
    () =>
      busy || rating === 0 || body.trim().length < 4 || (!user && guestName.trim().length < 2),
    [busy, rating, body, user, guestName],
  )

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (honeypot) return // bot
    if (rating === 0) return
    setBusy(true)
    try {
      await submitReview({
        targetType,
        targetId,
        rating: rating as Rating,
        titleEn: titleEn.trim() || null,
        titleSi: titleSi.trim() || null,
        body: body.trim(),
        bodyLang,
        user: user ? { uid: user.uid, displayName: user.displayName } : undefined,
        guestName: user ? undefined : guestName.trim(),
      })
      clearDraft(draftKey)
      toast({ description: t(mine ? 'form.update' : 'form.submit'), variant: 'success' })
      await qc.invalidateQueries({ queryKey: ['reviews', targetType, targetId] })
      await qc.invalidateQueries({ queryKey: ['reviews', 'mine', targetId] })
      await qc.invalidateQueries({ queryKey: [targetType, targetId] })
      if (!user) setCooldownLeft(guestCooldownRemaining(targetId))
    } catch (err) {
      const msg =
        err instanceof Error && err.message === 'cooldown'
          ? t('form.cooldown')
          : t('form.title')
      toast({ description: msg, variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card id="review-form">
      <CardHeader>
        <CardTitle>{mine ? t('form.editYours') : t('form.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rating">{t('form.ratingLabel')}</Label>
            <RatingInput id="rating" value={rating} onChange={setRating} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bodyLang">{t('form.bodyLang')}</Label>
              <Select value={bodyLang} onValueChange={(v) => setBodyLang(v as ContentLang)}>
                <SelectTrigger id="bodyLang">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="si">සිංහල</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reviewTitle">
                {bodyLang === 'si' ? t('form.reviewTitleSi') : t('form.reviewTitleEn')}
              </Label>
              <Input
                id="reviewTitle"
                value={bodyLang === 'si' ? titleSi : titleEn}
                onChange={(e) =>
                  bodyLang === 'si' ? setTitleSi(e.target.value) : setTitleEn(e.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">{t('form.body')}</Label>
            <Textarea
              id="body"
              rows={5}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {!user ? (
            <div className="space-y-1.5">
              <Label htmlFor="guestName">{t('form.guestName')}</Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                aria-describedby="guestNameHint"
                required
                minLength={2}
              />
              <p id="guestNameHint" className="text-xs text-muted-foreground">
                {t('form.guestNamePublicWarning')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('form.asUser', { name: user.displayName })}
            </p>
          )}

          {/* honeypot — visually hidden, ignored by humans */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />

          {!user ? (
            <p className="text-xs text-muted-foreground">
              {t('form.signInPrompt')}{' '}
              <Link to="/signin" className="underline underline-offset-4">
                {t('form.asGuest')}
              </Link>
            </p>
          ) : null}

          {cooldownLeft > 0 ? (
            <p className="text-sm text-destructive">{t('form.cooldown')}</p>
          ) : null}

          <Button type="submit" disabled={disabled || cooldownLeft > 0}>
            {mine ? t('form.update') : t('form.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function reviewTitleFor(review: Review, lang: ContentLang): string {
  return (
    (lang === 'si' ? review.titleSi : review.titleEn) ?? review.titleEn ?? review.titleSi ?? ''
  )
}
