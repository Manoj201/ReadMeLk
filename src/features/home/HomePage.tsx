import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, ChevronDown, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, LoadingBlock } from '@/components/StateBlocks'
import { MotifDivider } from '@/components/motifs'
import { GENRES, genreLabel } from '@/lib/genres'
import { useLocalizedField } from '@/hooks/useLocalizedField'
import { BookCard } from '@/features/books/BookCard'
import { BookHighlightCard } from '@/features/books/BookHighlightCard'
import { AuthorCard } from '@/features/authors/AuthorCard'
import { SpotlightSection } from '@/features/home/SpotlightSection'
import { useBestBooks, useFeaturedBooks } from '@/features/books/hooks'
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
  const featuredBooks = useFeaturedBooks(3)
  const bestBooks = useBestBooks(10)
  const topAuthors = useTopAuthors(6)
  const recent = useRecentReviews(3)

  return (
    <div>
      <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden text-center sm:min-h-[66vh]">
        {/* background photo — slow cinematic zoom */}
        <div
          className="absolute inset-0 animate-hero-zoom bg-cover bg-center bg-no-repeat motion-reduce:animate-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80')",
          }}
        />
        {/* brand gradient wash — same tokens as the header, so header and hero read as one theme */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(135deg, hsl(var(--header-gradient-1) / 0.92) 0%, hsl(var(--header-gradient-2) / 0.88) 60%, hsl(var(--header-gradient-3) / 0.95) 100%)',
          }}
        />
        {/* vignette — darkens the edges so the center stays the focal point */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at center, transparent 35%, hsl(var(--header-gradient-3) / 0.85) 100%)',
          }}
        />
        {/* gilt hairline along the bottom edge, matching the header */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-accent to-transparent shadow-[0_0_20px_2px_hsl(var(--header-glow)/0.6)]" />
        {/* ambient glows */}
        <div className="pointer-events-none absolute right-6 top-6 h-56 w-56 rounded-full bg-brand-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-6 left-6 h-64 w-64 rounded-full bg-[hsl(var(--header-gradient-2))]/40 blur-3xl" />
        {/* soft gold spotlight behind the headline */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/10 blur-[110px]" />

        <div className="container relative flex flex-col items-center gap-4 py-14 sm:py-16">
          <h1 className="max-w-3xl text-balance font-serif text-4xl font-semibold leading-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="max-w-2xl text-lg text-white/75 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-xl">
            {t('hero.subtitle')}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand-accent text-[hsl(var(--header-gradient-2))] shadow-[0_4px_24px_-4px_hsl(var(--header-glow)/0.7)] transition-shadow hover:bg-brand-accent-deep hover:shadow-[0_4px_32px_-2px_hsl(var(--header-glow)/0.85)]"
            >
              <Link to="/books">
                <BookOpen className="h-4 w-4" />
                {t('hero.browseCta')}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/authors">
                <Users className="h-4 w-4" />
                {t('hero.authorsCta')}
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-white/70">
              <BookOpen className="h-4 w-4 text-brand-accent" />
              <span className="text-sm font-medium sm:text-base">
                {t('hero.features.reviewBooks')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Star className="h-4 w-4 text-brand-accent" />
              <span className="text-sm font-medium sm:text-base">
                {t('hero.features.rateAuthors')}
              </span>
            </div>
          </div>
        </div>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-1/2 h-5 w-5 -translate-x-1/2 animate-bounce text-brand-accent/70"
        />
      </section>

      <SpotlightSection
        book={bestBooks.data?.[0]}
        author={topAuthors.data?.[0]}
        bookLoading={bestBooks.isLoading}
        authorLoading={topAuthors.isLoading}
      />

      <div className="container space-y-14 py-12">
        {featuredBooks.isLoading || (featuredBooks.data && featuredBooks.data.length > 0) ? (
          <section>
            <SectionHeading title={t('featured.title')} subtitle={t('featured.subtitle')} />
            {featuredBooks.isLoading ? (
              <LoadingBlock rows={2} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(featuredBooks.data ?? []).map((b) => (
                  <BookHighlightCard key={b.id} book={b} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        <section>
          <SectionHeading
            title={t('bestReviewed.title')}
            subtitle={t('bestReviewed.subtitle')}
          />
          {bestBooks.isLoading ? (
            <LoadingBlock rows={2} />
          ) : bestBooks.data && bestBooks.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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

        <div className="grid gap-14 lg:grid-cols-2">
          <section>
            <SectionHeading title={t('recentlyReviewed.title')} />
            {recent.isLoading ? (
              <LoadingBlock rows={3} />
            ) : recent.data && recent.data.length > 0 ? (
              <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                {recent.data.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 p-4 text-sm"
                  >
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
    </div>
  )
}
