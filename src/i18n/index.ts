import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '@/locales/en/common.json'
import enAuth from '@/locales/en/auth.json'
import enBook from '@/locales/en/book.json'
import enAuthor from '@/locales/en/author.json'
import enReview from '@/locales/en/review.json'
import enHome from '@/locales/en/home.json'
import enAdmin from '@/locales/en/admin.json'

import siCommon from '@/locales/si/common.json'
import siAuth from '@/locales/si/auth.json'
import siBook from '@/locales/si/book.json'
import siAuthor from '@/locales/si/author.json'
import siReview from '@/locales/si/review.json'
import siHome from '@/locales/si/home.json'
import siAdmin from '@/locales/si/admin.json'

export const NS = ['common', 'auth', 'book', 'author', 'review', 'home', 'admin'] as const
export const SUPPORTED_LANGS = ['en', 'si'] as const

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    book: enBook,
    author: enAuthor,
    review: enReview,
    home: enHome,
    admin: enAdmin,
  },
  si: {
    common: siCommon,
    auth: siAuth,
    book: siBook,
    author: siAuthor,
    review: siReview,
    home: siHome,
    admin: siAdmin,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: [...NS],
    defaultNS: 'common',
    fallbackLng: { si: ['en'], default: ['en'] },
    supportedLngs: [...SUPPORTED_LANGS],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'readme.lang',
      caches: ['localStorage'],
    },
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: import.meta.env.DEV
      ? (lngs, ns, key) => console.warn(`[i18n] missing ${ns}:${key} for ${lngs.join(',')}`)
      : undefined,
  })

export default i18n
