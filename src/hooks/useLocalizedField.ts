import { useTranslation } from 'react-i18next'
import type { ContentLang } from '@/types'

export interface LocalizedValue {
  value: string
  /** the language the returned value is actually in, or null when nothing is set */
  lang: ContentLang | null
  /** true when we fell back to the other language */
  isFallback: boolean
}

/**
 * Pick the active-language value from a bilingual pair, falling back to the other
 * language. See .claude/planning/05-i18n.md.
 */
export function pickLocalized(
  active: ContentLang,
  en: string | null | undefined,
  si: string | null | undefined,
): LocalizedValue {
  const primary = active === 'si' ? si : en
  const secondary = active === 'si' ? en : si
  if (primary && primary.trim()) return { value: primary, lang: active, isFallback: false }
  if (secondary && secondary.trim()) {
    return { value: secondary, lang: active === 'si' ? 'en' : 'si', isFallback: true }
  }
  return { value: '', lang: null, isFallback: false }
}

export function useLocalizedField() {
  const { i18n } = useTranslation()
  const active = (i18n.language?.startsWith('si') ? 'si' : 'en') as ContentLang
  return {
    active,
    pick: (en: string | null | undefined, si: string | null | undefined) =>
      pickLocalized(active, en, si),
  }
}
