import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/stores/uiStore'
import type { ContentLang } from '@/types'

export function LanguageToggle({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const setLanguage = useUiStore((s) => s.setLanguage)
  const current = (i18n.language?.startsWith('si') ? 'si' : 'en') as ContentLang
  const next: ContentLang = current === 'si' ? 'en' : 'si'

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => {
        void i18n.changeLanguage(next)
        setLanguage(next)
      }}
      aria-label={t('lang.switchTo', { lang: t(`lang.${next}`) })}
    >
      <Languages className="h-4 w-4" />
      <span>{t(`lang.${next}`)}</span>
    </Button>
  )
}
