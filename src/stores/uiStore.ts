import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ContentLang, Rating } from '@/types'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ReviewDraft {
  rating: Rating | 0
  titleEn: string
  titleSi: string
  body: string
  bodyLang: ContentLang
  guestName: string
}

interface UiState {
  language: ContentLang
  theme: ThemeMode
  mobileNavOpen: boolean
  /** review drafts keyed by `${targetType}:${targetId}` */
  reviewDrafts: Record<string, ReviewDraft>

  setLanguage: (lang: ContentLang) => void
  toggleLanguage: () => void
  setTheme: (theme: ThemeMode) => void
  setMobileNavOpen: (open: boolean) => void
  getDraft: (key: string) => ReviewDraft
  setDraft: (key: string, draft: Partial<ReviewDraft>) => void
  clearDraft: (key: string) => void
}

export const emptyDraft: ReviewDraft = {
  rating: 0,
  titleEn: '',
  titleSi: '',
  body: '',
  bodyLang: 'en',
  guestName: '',
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      language: 'en',
      theme: 'system',
      mobileNavOpen: false,
      reviewDrafts: {},

      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set({ language: get().language === 'en' ? 'si' : 'en' }),
      setTheme: (theme) => set({ theme }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),

      getDraft: (key) => get().reviewDrafts[key] ?? emptyDraft,
      setDraft: (key, draft) =>
        set((s) => ({
          reviewDrafts: {
            ...s.reviewDrafts,
            [key]: { ...(s.reviewDrafts[key] ?? emptyDraft), ...draft },
          },
        })),
      clearDraft: (key) =>
        set((s) => {
          const next = { ...s.reviewDrafts }
          delete next[key]
          return { reviewDrafts: next }
        }),
    }),
    {
      name: 'readme.ui',
      partialize: (s) => ({
        language: s.language,
        theme: s.theme,
        reviewDrafts: s.reviewDrafts,
      }),
    },
  ),
)
