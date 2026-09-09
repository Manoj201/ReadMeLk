import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GenreCheckboxes, ImageField } from '@/components/forms'
import { LoadingBlock } from '@/components/StateBlocks'
import { toast } from '@/hooks/use-toast'
import { uploadImage, authorPhotoDir } from '@/lib/storage'
import { updateDoc, serverTimestamp } from 'firebase/firestore'
import { authorDoc } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'
import type { SocialLink } from '@/types'
import {
  createAuthorProfile,
  updateAuthorProfile,
  type AuthorInput,
} from './api'
import { useAuthor } from './hooks'

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

export function AuthorFormPage() {
  const { authorId } = useParams()
  const editing = !!authorId
  const { t } = useTranslation('author')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const { data: existing, isLoading } = useAuthor(authorId)

  const [form, setForm] = useState<AuthorInput>(empty)
  const [photo, setPhoto] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (existing) {
      setForm({
        nameEn: existing.nameEn,
        nameSi: existing.nameSi,
        bioEn: existing.bioEn,
        bioSi: existing.bioSi,
        birthYear: existing.birthYear,
        location: existing.location,
        website: existing.website,
        genres: existing.genres,
        socialLinks: existing.socialLinks ?? [],
      })
    }
  }, [existing])

  if (editing && isLoading) return <LoadingBlock className="container py-12" />
  if (!user) return null
  if (!editing && user.authorProfileId) {
    return (
      <div className="container max-w-xl py-12">
        <p className="text-muted-foreground">{t('form.alreadyAuthor')}</p>
        <Button className="mt-4" onClick={() => navigate(`/authors/${user.authorProfileId}`)}>
          {t('profile.booksTitle')}
        </Button>
      </div>
    )
  }
  if (editing && existing && existing.ownerUid !== user.uid) {
    navigate(`/authors/${authorId}`, { replace: true })
    return null
  }

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
      let id = authorId as string
      if (editing) {
        await updateAuthorProfile(id, clean)
      } else {
        id = await createAuthorProfile(user!.uid, clean)
      }
      const patch: Record<string, unknown> = {}
      if (photo) patch.photoURL = await uploadImage(authorPhotoDir(id), 'profile', photo)
      if (cover) patch.coverURL = await uploadImage(authorPhotoDir(id), 'cover', cover)
      if (Object.keys(patch).length) {
        await updateDoc(authorDoc(id), { ...patch, updatedAt: serverTimestamp() })
      }
      await qc.invalidateQueries({ queryKey: ['author', id] })
      toast({ description: t(editing ? 'form.submitEdit' : 'form.submitRegister'), variant: 'success' })
      navigate(`/authors/${id}`)
    } catch (err) {
      console.error(err)
      setError(t('form.atLeastOneName'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? t('form.editTitle') : t('form.registerTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nameEn">{t('form.nameEn')}</Label>
                <Input id="nameEn" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nameSi">{t('form.nameSi')}</Label>
                <Input id="nameSi" value={form.nameSi} onChange={(e) => set('nameSi', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bioEn">{t('form.bioEn')}</Label>
                <Textarea id="bioEn" rows={4} value={form.bioEn} onChange={(e) => set('bioEn', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bioSi">{t('form.bioSi')}</Label>
                <Textarea id="bioSi" rows={4} value={form.bioSi} onChange={(e) => set('bioSi', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField label={t('form.photo')} currentUrl={existing?.photoURL} onSelect={setPhoto} />
              <ImageField label={t('form.cover')} currentUrl={existing?.coverURL} onSelect={setCover} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="birthYear">{t('form.birthYear')}</Label>
                <Input
                  id="birthYear"
                  type="number"
                  value={form.birthYear ?? ''}
                  onChange={(e) => set('birthYear', e.target.value ? Number(e.target.value) : null)}
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
                onClick={() => set('socialLinks', [...form.socialLinks, { label: '', url: '' }])}
              >
                {t('form.addLink')}
              </Button>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {editing ? t('form.submitEdit') : t('form.submitRegister')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
