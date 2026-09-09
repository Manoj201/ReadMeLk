import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { serverTimestamp, updateDoc } from 'firebase/firestore'
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
import { GenreCheckboxes, ImageField } from '@/components/forms'
import { LoadingBlock } from '@/components/StateBlocks'
import { toast } from '@/hooks/use-toast'
import { bookDoc } from '@/lib/firestore'
import { bookCoverDir, uploadImage } from '@/lib/storage'
import { useAuthStore } from '@/stores/authStore'
import type { BookLang } from '@/types'
import { createBook, deleteBook, updateBook, type BookInput } from './api'
import { useBook } from './hooks'

const empty: BookInput = {
  titleEn: '',
  titleSi: '',
  descriptionEn: '',
  descriptionSi: '',
  isbn: null,
  language: 'si',
  genres: [],
  publishedYear: null,
  publisher: null,
  pageCount: null,
}

export function BookFormPage() {
  const { bookId } = useParams()
  const editing = !!bookId
  const { t } = useTranslation('book')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const { data: existing, isLoading } = useBook(bookId)

  const [form, setForm] = useState<BookInput>(empty)
  const [cover, setCover] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (existing) {
      setForm({
        titleEn: existing.titleEn,
        titleSi: existing.titleSi,
        descriptionEn: existing.descriptionEn,
        descriptionSi: existing.descriptionSi,
        isbn: existing.isbn,
        language: existing.language,
        genres: existing.genres,
        publishedYear: existing.publishedYear,
        publisher: existing.publisher,
        pageCount: existing.pageCount,
      })
    }
  }, [existing])

  if (editing && isLoading) return <LoadingBlock className="container py-12" />
  if (!user) return null

  if (!editing && !user.authorProfileId) {
    return (
      <div className="container max-w-xl py-12">
        <p className="text-muted-foreground">{t('form.needAuthorProfile')}</p>
        <Button asChild className="mt-4">
          <Link to="/register/author">{t('form.needAuthorProfile')}</Link>
        </Button>
      </div>
    )
  }
  if (editing && existing && existing.ownerUid !== user.uid) {
    navigate(`/books/${bookId}`, { replace: true })
    return null
  }

  const set = <K extends keyof BookInput>(key: K, value: BookInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.titleEn.trim() && !form.titleSi.trim()) {
      setError(t('form.atLeastOneTitle'))
      return
    }
    setBusy(true)
    try {
      const clean: BookInput = {
        ...form,
        isbn: form.isbn?.trim() || null,
        publisher: form.publisher?.trim() || null,
      }
      let id = bookId as string
      if (editing) await updateBook(id, clean)
      else id = await createBook(user!.uid, user!.authorProfileId, clean)
      if (cover) {
        const coverURL = await uploadImage(bookCoverDir(id), 'cover', cover)
        await updateDoc(bookDoc(id), { coverURL, updatedAt: serverTimestamp() })
      }
      await qc.invalidateQueries({ queryKey: ['book', id] })
      await qc.invalidateQueries({ queryKey: ['books'] })
      toast({ description: t(editing ? 'form.submitEdit' : 'form.submitNew'), variant: 'success' })
      navigate(`/books/${id}`)
    } catch (err) {
      const msg = err instanceof Error && err.message === 'needAuthorProfile'
        ? t('form.needAuthorProfile')
        : t('form.atLeastOneTitle')
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!existing || !window.confirm(t('form.deleteConfirm'))) return
    await deleteBook(existing.id, existing.authorId)
    await qc.invalidateQueries({ queryKey: ['books'] })
    toast({ description: t('form.deleteConfirm'), variant: 'success' })
    navigate(`/authors/${existing.authorId}`)
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? t('form.editTitle') : t('form.newTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="titleEn">{t('form.titleEn')}</Label>
                <Input id="titleEn" value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="titleSi">{t('form.titleSi')}</Label>
                <Input id="titleSi" value={form.titleSi} onChange={(e) => set('titleSi', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="descEn">{t('form.descriptionEn')}</Label>
                <Textarea
                  id="descEn"
                  rows={4}
                  value={form.descriptionEn}
                  onChange={(e) => set('descriptionEn', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="descSi">{t('form.descriptionSi')}</Label>
                <Textarea
                  id="descSi"
                  rows={4}
                  value={form.descriptionSi}
                  onChange={(e) => set('descriptionSi', e.target.value)}
                />
              </div>
            </div>

            <ImageField label={t('form.cover')} currentUrl={existing?.coverURL} onSelect={setCover} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="language">{t('form.language')}</Label>
                <Select value={form.language} onValueChange={(v) => set('language', v as BookLang)}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">{t('language.si')}</SelectItem>
                    <SelectItem value="en">{t('language.en')}</SelectItem>
                    <SelectItem value="bilingual">{t('language.bilingual')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="isbn">{t('form.isbn')}</Label>
                <Input id="isbn" value={form.isbn ?? ''} onChange={(e) => set('isbn', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="year">{t('form.year')}</Label>
                <Input
                  id="year"
                  type="number"
                  value={form.publishedYear ?? ''}
                  onChange={(e) => set('publishedYear', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="publisher">{t('form.publisher')}</Label>
                <Input
                  id="publisher"
                  value={form.publisher ?? ''}
                  onChange={(e) => set('publisher', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pages">{t('form.pageCount')}</Label>
                <Input
                  id="pages"
                  type="number"
                  value={form.pageCount ?? ''}
                  onChange={(e) => set('pageCount', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>

            <GenreCheckboxes
              label={t('form.genres')}
              value={form.genres}
              onChange={(g) => set('genres', g)}
            />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={busy}>
                {editing ? t('form.submitEdit') : t('form.submitNew')}
              </Button>
              {editing ? (
                <Button type="button" variant="destructive" onClick={onDelete}>
                  {t('form.deleteConfirm')}
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
