import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { bookDoc } from '@/lib/firestore'
import { bookCoverDir, COVER_IMAGE, uploadImage } from '@/lib/storage'
import type { BookInput } from '@/features/books/api'
import type { BookLang } from '@/types'
import { adminCreateBook } from './api'
import { useActor, useAdminAuthors } from './hooks'

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
  highlightSi: null,
}

/** Admin-only: register a book for any author (claimed or not), auto-approved. */
export function AdminBookCreatePage() {
  const { t } = useTranslation('book')
  const { t: ta } = useTranslation('admin')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const actor = useActor()
  const [searchParams] = useSearchParams()

  const { data: authors, isLoading: authorsLoading } = useAdminAuthors()
  const [authorId, setAuthorId] = useState(searchParams.get('authorId') ?? '')
  const [form, setForm] = useState<BookInput>(empty)
  const [cover, setCover] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authorOptions = useMemo(
    () => (authors ?? []).map((a) => ({ id: a.id, name: a.nameEn || a.nameSi || a.id })),
    [authors],
  )

  const set = <K extends keyof BookInput>(key: K, value: BookInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!authorId) {
      setError(ta('books.selectAuthor'))
      return
    }
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
        highlightSi: form.highlightSi?.trim() || null,
      }
      const id = await adminCreateBook(actor, authorId, clean)
      if (cover) {
        const coverURL = await uploadImage(bookCoverDir(id), 'cover', cover, COVER_IMAGE)
        await updateDoc(bookDoc(id), { coverURL, updatedAt: serverTimestamp() })
      }
      await qc.invalidateQueries({ queryKey: ['admin'] })
      toast({ description: ta('books.created'), variant: 'success' })
      navigate('/admin/books')
    } catch (err) {
      console.error(err)
      setError(t('form.atLeastOneTitle'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{ta('books.new')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="author">{ta('books.selectAuthor')}</Label>
              {authorsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={authorId} onValueChange={setAuthorId}>
                  <SelectTrigger id="author">
                    <SelectValue placeholder={ta('books.selectAuthor')} />
                  </SelectTrigger>
                  <SelectContent>
                    {authorOptions.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="titleEn">{t('form.titleEn')}</Label>
                <Input
                  id="titleEn"
                  value={form.titleEn}
                  onChange={(e) => set('titleEn', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="titleSi">{t('form.titleSi')}</Label>
                <Input
                  id="titleSi"
                  value={form.titleSi}
                  onChange={(e) => set('titleSi', e.target.value)}
                />
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

            <div className="space-y-1.5 rounded-lg border border-dashed border-border p-3">
              <Label htmlFor="highlightSi">{t('form.highlightSi')}</Label>
              <Textarea
                id="highlightSi"
                rows={3}
                className="font-sinhala"
                value={form.highlightSi ?? ''}
                onChange={(e) => set('highlightSi', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t('form.highlightSiHint')}</p>
            </div>

            <ImageField label={t('form.cover')} onSelect={setCover} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="language">{t('form.language')}</Label>
                <Select
                  value={form.language}
                  onValueChange={(v) => set('language', v as BookLang)}
                >
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
                <Input
                  id="isbn"
                  value={form.isbn ?? ''}
                  onChange={(e) => set('isbn', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="year">{t('form.year')}</Label>
                <Input
                  id="year"
                  type="number"
                  value={form.publishedYear ?? ''}
                  onChange={(e) =>
                    set('publishedYear', e.target.value ? Number(e.target.value) : null)
                  }
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
                  onChange={(e) =>
                    set('pageCount', e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>
            </div>

            <GenreCheckboxes
              label={t('form.genres')}
              value={form.genres}
              onChange={(g) => set('genres', g)}
            />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" loading={busy}>
              {ta('books.new')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
