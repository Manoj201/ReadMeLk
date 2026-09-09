import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GENRES, genreLabel } from '@/lib/genres'
import { assertValidImage, ImageValidationError } from '@/lib/storage'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { cn } from '@/lib/utils'

export function GenreCheckboxes({
  value,
  onChange,
  label,
}: {
  value: string[]
  onChange: (next: string[]) => void
  label: string
}) {
  const { active } = useLocalizedField()
  const toggle = (g: string) =>
    onChange(value.includes(g) ? value.filter((v) => v !== g) : [...value, g])
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => {
          const on = value.includes(g.value)
          return (
            <button
              key={g.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(g.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                on
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border hover:bg-accent',
              )}
            >
              {genreLabel(g.value, active)}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function GenreBadges({ genres }: { genres: string[] }) {
  const { active } = useLocalizedField()
  if (!genres?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {genres.map((g) => (
        <Badge key={g} variant="genre">
          {genreLabel(g, active)}
        </Badge>
      ))}
    </div>
  )
}

export function BilingualChip({ shown }: { shown: 'si' | 'en' }) {
  const { t } = useTranslation()
  return (
    <Badge variant="outline" className="align-middle">
      {t('contentLang.shownIn', { lang: t(`contentLang.${shown}`) })}
    </Badge>
  )
}

/**
 * Local image picker. Holds the File in state and previews it; the parent uploads
 * it after the owning doc exists (Storage rules need the doc's ownerUid).
 */
export function ImageField({
  label,
  currentUrl,
  onSelect,
}: {
  label: string
  currentUrl?: string | null
  onSelect: (file: File | null) => void
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {preview ? (
          <img
            src={preview}
            alt=""
            className="h-16 w-16 rounded-md border border-border object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          {t('actions.edit')}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          setError(null)
          if (!file) {
            onSelect(null)
            return
          }
          try {
            assertValidImage(file)
            setPreview(URL.createObjectURL(file))
            onSelect(file)
          } catch (err) {
            if (err instanceof ImageValidationError) setError(t('validation.image'))
            onSelect(null)
          }
        }}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
