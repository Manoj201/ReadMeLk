import { Skeleton } from '@/components/ui/skeleton'

/** Matches BookCard.tsx: aspect-[3/4] cover, then genre/title/author/rating lines. */
export function BookCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-2.5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
    </div>
  )
}

/** Matches AuthorCard.tsx: cover strip, overlapping avatar, name/location/badges/bio. */
export function AuthorCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="relative px-4">
        <Skeleton className="absolute -top-8 left-4 h-16 w-16 rounded-full border-4 border-card" />
      </div>
      <div className="flex flex-col gap-2 p-4 pt-10">
        <Skeleton className="h-2.5 w-1/4" />
        <Skeleton className="h-5 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-1 h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

/** Matches BookHighlightCard.tsx: small cover on the left, text block on the right. */
export function BookHighlightSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4 sm:gap-5">
      <Skeleton className="aspect-[3/4] w-24 shrink-0 sm:w-32" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-1 h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

/** Matches ReviewList.tsx's ReviewItem: bordered card, stars/name row, title, body lines. */
export function ReviewItemSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="ml-auto h-3 w-14" />
      </div>
      <Skeleton className="mt-3 h-4 w-1/3" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  )
}

export function ReviewListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <ReviewItemSkeleton key={i} />
      ))}
    </div>
  )
}

/** A single bordered admin-table row: name/link, a couple of badge chips, right-aligned buttons. */
export function AdminRowSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-14 rounded-full" />
      <div className="ml-auto flex gap-2">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  )
}

export function AdminListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <AdminRowSkeleton key={i} />
      ))}
    </div>
  )
}

/** Matches ReviewsAdminPage.tsx's taller row: a badge/meta line, a body line, then buttons. */
export function AdminReviewRowSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="ml-auto h-4 w-4" />
      </div>
      <Skeleton className="mt-2 h-3 w-full" />
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  )
}

export function AdminReviewListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <AdminReviewRowSkeleton key={i} />
      ))}
    </div>
  )
}

/** A single thin, divided text row — for compact lists like "recent actions" or "my reviews". */
export function ThinRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="ml-auto h-3 w-16 shrink-0" />
    </div>
  )
}

export function ThinListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <ThinRowSkeleton key={i} />
      ))}
    </div>
  )
}

/** Matches BookDetailPage.tsx's overall layout: hero card + about card, plus a sidebar. */
export function BookDetailSkeleton() {
  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row">
          <Skeleton className="mx-auto aspect-[3/4] w-48 shrink-0 sm:mx-0 sm:w-64" />
          <div className="flex flex-1 flex-col gap-3 pt-1">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="mt-2 h-9 w-32" />
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  )
}

/** Matches AuthorProfilePage.tsx's cover+avatar header, then the two-column body below. */
export function AuthorProfileSkeleton() {
  return (
    <div>
      <div className="relative border-b border-border bg-card">
        <Skeleton className="h-40 w-full rounded-none sm:h-56" />
        <div className="container relative -mt-12 flex flex-col gap-4 pb-6 sm:flex-row sm:items-end">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
          <div className="flex-1 space-y-2 pb-1">
            <Skeleton className="h-7 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div className="space-y-3 rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/** Matches the shared AuthorFormPage/BookFormPage shell: a Card with a title and labeled fields. */
export function FormSkeleton() {
  return (
    <div className="container max-w-2xl space-y-4 py-10">
      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="mb-6 h-6 w-1/3" />
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  )
}
