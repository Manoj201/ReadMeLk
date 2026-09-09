import type { Timestamp } from 'firebase/firestore'
import type { ContentLang } from '@/types'

function locale(lang: ContentLang): string {
  return lang === 'si' ? 'si-LK' : 'en-LK'
}

export function formatDate(ts: Timestamp | null | undefined, lang: ContentLang): string {
  if (!ts) return ''
  try {
    return new Intl.DateTimeFormat(locale(lang), { dateStyle: 'medium' }).format(ts.toDate())
  } catch {
    return ts.toDate().toLocaleDateString()
  }
}

export function formatRelative(ts: Timestamp | null | undefined, lang: ContentLang): string {
  if (!ts) return ''
  const diffMs = ts.toDate().getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat(locale(lang), { numeric: 'auto' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ]
  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms || unit === 'minute') {
      return rtf.format(Math.round(diffMs / ms), unit)
    }
  }
  return rtf.format(0, 'minute')
}

export function formatNumber(n: number, lang: ContentLang): string {
  return new Intl.NumberFormat(locale(lang)).format(n)
}

export function formatRating(n: number, lang: ContentLang): string {
  return new Intl.NumberFormat(locale(lang), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n)
}
