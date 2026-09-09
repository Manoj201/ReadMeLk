import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { LanguageToggle } from '@/components/LanguageToggle'
import { MotifDivider } from '@/components/motifs'
import { HeroScene, ShelfBanner } from '@/components/artwork'
import { GENRES, genreLabel } from '@/lib/genres'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { BookCard } from '@/features/books/BookCard'
import { AuthorCard } from '@/features/authors/AuthorCard'
import { useBestBooks } from '@/features/books/hooks'
import { useTopAuthors } from '@/features/authors/hooks'
import { useRecentReviews } from '@/features/reviews/hooks'
import { formatRelative } from '@/lib/format'

function SectionHeading({
  title,
  subtitle,
  shelf,
}: {
  title: string
  subtitle?: string
  shelf?: boolean
}) {
  return (
    <div className="mb-4">
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      {shelf ? <ShelfBanner className="mt-2" /> : <MotifDivider className="mt-2 max-w-xs" />}
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
        {/* vector scene — sits behind the copy, full-height on desktop */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-3/4 md:w-3/5">
          <HeroScene className="h-full w-full" />
        </div>
        {/* readability wash: heavier on small screens where text overlaps the art */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-card via-card/90 to-card/40 sm:via-card/70 sm:to-transparent" />

        <div className="container relative py-16 sm:py-24">
          <div className="flex max-w-xl flex-col items-start gap-4 md:max-w-[600px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              සිංහල · English
            </span>
            <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              {t('hero.title')}
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">{t('hero.subtitle')}</p>
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
        </div>
      </section>

      <div className="container space-y-14 py-12">
        <section>
          <SectionHeading
            title={t('bestReviewed.title')}
            subtitle={t('bestReviewed.subtitle')}
            shelf
          />
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
