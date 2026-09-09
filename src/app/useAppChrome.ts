import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'

/**
 * Keeps <html> and <body> in sync with the active language and theme:
 *  - html[lang], body.lang-si / body.lang-en   (fonts + line-height, see 05-i18n.md)
 *  - html[data-theme] for the explicit light/dark choice ('system' clears it)
 */
export function useAppChrome() {
  const { i18n } = useTranslation()
  const theme = useUiStore((s) => s.theme)
  const language = useUiStore((s) => s.language)

  // language -> i18next + DOM
  useEffect(() => {
    if (i18n.language !== language) void i18n.changeLanguage(language)
  }, [language, i18n])

  useEffect(() => {
    const lang = i18n.language?.startsWith('si') ? 'si' : 'en'
    document.documentElement.lang = lang
    document.body.classList.toggle('lang-si', lang === 'si')
    document.body.classList.toggle('lang-en', lang === 'en')
  }, [i18n.language])

  // theme -> data-theme (+ react to system changes when in 'system' mode)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])
}
