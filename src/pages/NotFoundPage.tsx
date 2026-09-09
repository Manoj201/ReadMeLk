import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LotusMark, MotifDivider } from '@/components/motifs'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <LotusMark className="h-10 w-10" />
      <h1 className="font-serif text-3xl font-semibold">{t('notFound.title')}</h1>
      <MotifDivider className="max-w-xs" />
      <p className="text-muted-foreground">{t('notFound.body')}</p>
      <Button asChild>
        <Link to="/">{t('notFound.cta')}</Link>
      </Button>
    </div>
  )
}
