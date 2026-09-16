import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { serverTimestamp, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GenreCheckboxes, ImageField } from '@/components/forms'
import { toast } from '@/hooks/use-toast'
import { authorDoc } from '@/lib/firestore'
import { authorPhotoDir, AVATAR_IMAGE, COVER_IMAGE, uploadImage } from '@/lib/storage'
import type { AuthorInput } from '@/features/authors/api'
import type { SocialLink } from '@/types'
import { adminCreateAuthor } from './api'
import { useActor } from './hooks'

const empty: AuthorInput = {
  nameEn: '',
  nameSi: '',
  bioEn: '',
  bioSi: '',
  birthYear: null,
  location: null,
  website: null,
  genres: [],
  socialLinks: [],
}

/** Admin-only: create an author profile with no linked user yet (auto-approved). */
export function AdminAuthorCreatePage() {
  const { t } = useTranslation('author')
  const { t: ta } = useTranslation('admin')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const actor = useActor()

  const [form, setForm] = useState<AuthorInput>(empty)
  const [claimEmail, setClaimEmail] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof AuthorInput>(key: K, value: AuthorInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const updateLink = (i: number, patch: Partial<SocialLink>) =>
    set(
      'socialLinks',
      form.socialLinks.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    )

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.nameEn.trim() && !form.nameSi.trim()) {
      setError(t('form.atLeastOneName'))
      return
    }
    setBusy(true)
    try {
      const clean: AuthorInput = {
        ...form,
        location: form.location?.trim() || null,
        website: form.website?.trim() || null,
        socialLinks: form.socialLinks.filter((l) => l.label.trim() && l.url.trim()),
      }
      const id = await adminCreateAuthor(actor, clean, claimEmail.trim() || null)
      const patch: Record<string, unknown> = {}
      if (photo) {
        patch.photoURL = await uploadImage(authorPhotoDir(id), 'profile', photo, AVATAR_IMAGE)
      }
      if (cover) {
        patch.coverURL = await uploadImage(authorPhotoDir(id), 'cover', cover, COVER_IMAGE)
      }
      if (Object.keys(patch).length) {
        await updateDoc(authorDoc(id), { ...patch, updatedAt: serverTimestamp() })
      }
      await qc.invalidateQueries({ queryKey: ['admin'] })
      toast({ description: ta('authors.created'), variant: 'success' })
      navigate('/admin/authors')
    } catch (err) {
      console.error(err)
      setError(t('form.atLeastOneName'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{ta('authors.new')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nameEn">{t('form.nameEn')}</Label>
                <Input
                  id="nameEn"
                  value={form.nameEn}
                  onChange={(e) => set('nameEn', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nameSi">{t('form.nameSi')}</Label>
                <Input
                  id="nameSi"
                  value={form.nameSi}
                  onChange={(e) => set('nameSi', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bioEn">{t('form.bioEn')}</Label>
                <Textarea
                  id="bioEn"
                  rows={4}
                  value={form.bioEn}
                  onChange={(e) => set('bioEn', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bioSi">{t('form.bioSi')}</Label>
                <Textarea
                  id="bioSi"
                  rows={4}
                  value={form.bioSi}
                  onChange={(e) => set('bioSi', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField label={t('form.photo')} onSelect={setPhoto} />
              <ImageField label={t('form.cover')} onSelect={setCover} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="birthYear">{t('form.birthYear')}</Label>
                <Input
                  id="birthYear"
                  type="number"
                  value={form.birthYear ?? ''}
                  onChange={(e) =>
                    set('birthYear', e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">{t('form.location')}</Label>
                <Input
                  id="location"
                  value={form.location ?? ''}
                  onChange={(e) => set('location', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">{t('form.website')}</Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website ?? ''}
                  onChange={(e) => set('website', e.target.value)}
                />
              </div>
            </div>

            <GenreCheckboxes
              label={t('form.genres')}
              value={form.genres}
              onChange={(g) => set('genres', g)}
            />

            <div className="space-y-2">
              <Label>{t('form.socialLinks')}</Label>
              {form.socialLinks.map((l, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder={t('form.linkLabel')}
                    value={l.label}
                    onChange={(e) => updateLink(i, { label: e.target.value })}
                  />
                  <Input
                    placeholder={t('form.linkUrl')}
                    value={l.url}
                    onChange={(e) => updateLink(i, { url: e.target.value })}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  set('socialLinks', [...form.socialLinks, { label: '', url: '' }])
                }
              >
                {t('form.addLink')}
              </Button>
            </div>

            <div className="space-y-1.5 border-t border-border pt-4">
              <Label htmlFor="claimEmail">{ta('authors.claimEmail')}</Label>
              <Input
                id="claimEmail"
                type="email"
                value={claimEmail}
                onChange={(e) => setClaimEmail(e.target.value)}
                placeholder="author@example.com"
              />
              <p className="text-xs text-muted-foreground">{ta('authors.claimEmailHint')}</p>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" loading={busy}>
              {ta('authors.new')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
