import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { LanguageToggle } from '@/components/LanguageToggle'
import { MotifDivider, OlaLeafTexture } from '@/components/motifs'
import { GENRES, genreLabel } from '@/lib/genres'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { BookCard } from '@/features/books/BookCard'
import { AuthorCard } from '@/features/authors/AuthorCard'
import { useBestBooks } from '@/features/books/hooks'
import { useTopAuthors } from '@/features/authors/hooks'
import { useRecentReviews } from '@/features/reviews/hooks'
import { formatRelative } from '@/lib/format'

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      <MotifDivider className="mt-2 max-w-xs" />
    </div>
  )
}

export function HomePage() {
  const { t } = useTranslation('home')
  const { active } = useLocalizedField()
  const bestBooks = useBestBooks(10)
  const topAuthors = useTopAuthors(6)
  const recent = useRecentReviews(6)

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-card">
        <OlaLeafTexture className="text-secondary opacity-[0.06]" />
        <div className="container relative flex flex-col items-start gap-4 py-14">
          <h1 className="max-w-2xl font-serif text-3xl font-semibold sm:text-4xl">
            {t('hero.title')}
          </h1>
          <p className="max-w-xl text-muted-foreground">{t('hero.subtitle')}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/books">{t('hero.browseCta')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/register/author">{t('hero.becomeAuthorCta')}</Link>
            </Button>
            <LanguageToggle />
          </div>
        </div>
      </section>

      <div className="container space-y-14 py-12">
        <section>
          <SectionHeading title={t('bestReviewed.title')} subtitle={t('bestReviewed.subtitle')} />
          {bestBooks.isLoading ? (
            <LoadingBlock rows={2} />
          ) : bestBooks.data && bestBooks.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {bestBooks.data.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          ) : (
            <EmptyState title={t('bestReviewed.empty')} />
          )}
        </section>

        <section>
          <SectionHeading title={t('topAuthors.title')} />
          {topAuthors.isLoading ? (
            <LoadingBlock rows={2} />
          ) : topAuthors.data && topAuthors.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topAuthors.data.map((a) => (
                <AuthorCard key={a.id} author={a} />
              ))}
            </div>
          ) : (
            <EmptyState title={t('topAuthors.empty')} />
          )}
        </section>

        <section>
          <SectionHeading title={t('recentlyReviewed.title')} />
          {recent.isLoading ? (
            <LoadingBlock rows={3} />
          ) : recent.data && recent.data.length > 0 ? (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {recent.data.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                  <span>
                    <span className="font-medium">{r.reviewerName}</span>{' '}
                    <span className="text-muted-foreground">
                      {r.targetType === 'book'
                        ? t('recentlyReviewed.reviewedBook')
                        : t('recentlyReviewed.reviewedAuthor')}
                    </span>{' '}
                    <Link
                      to={`/${r.targetType === 'book' ? 'books' : 'authors'}/${r.targetId}`}
                      className="underline underline-offset-2"
                    >
                      →
                    </Link>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelative(r.updatedAt ?? r.createdAt, active)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t('recentlyReviewed.empty')} />
          )}
        </section>

        <section>
          <SectionHeading title={t('genres.title')} />
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <Button key={g.value} asChild variant="outline" size="sm">
                <Link to={`/books?genre=${g.value}`}>{genreLabel(g.value, active)}</Link>
              </Button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
