import type { Rating } from '@/types'

/**
 * Home-page ranking constants. See .claude/planning/02-architecture.md.
 *  m = minimum votes before an item's own average dominates
 *  C = prior mean (seeded site-wide average); revisit once real data exists
 */
export const RATING_M = 5
export const RATING_C = 3.5

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** Bayesian (damped) average used for ranking. */
export function bayesianScore(
  ratingAvg: number,
  ratingCount: number,
  m = RATING_M,
  c = RATING_C,
): number {
  const v = ratingCount
  if (v <= 0) return 0
  return round1((v / (v + m)) * ratingAvg + (m / (v + m)) * c)
}

export interface AggregateFields {
  ratingSum: number
  ratingCount: number
  ratingAvg: number
  bayesianScore: number
  reviewCount: number
}

export interface ReviewDelta {
  /** previous rating, if this is an edit or delete */
  oldRating?: Rating | null
  /** new rating, omitted / null on delete */
  newRating?: Rating | null
  isCreate?: boolean
  isDelete?: boolean
  /** whether the review is a guest review — guest reviews do not move reviewCount */
  isGuest: boolean
}

/**
 * Single source of truth for how a review create/edit/delete moves a target's
 * denormalized aggregates. Pure — the Firestore transaction just persists the result.
 */
export function applyReviewDelta(current: AggregateFields, delta: ReviewDelta): AggregateFields {
  const old = delta.oldRating ?? 0
  const next = delta.isDelete ? 0 : (delta.newRating ?? 0)

  const ratingSum = Math.max(0, current.ratingSum - old + next)
  const ratingCount = Math.max(
    0,
    current.ratingCount + (delta.isCreate ? 1 : delta.isDelete ? -1 : 0),
  )
  const ratingAvg = ratingCount > 0 ? round1(ratingSum / ratingCount) : 0
  const reviewCount = delta.isGuest
    ? current.reviewCount
    : Math.max(0, current.reviewCount + (delta.isCreate ? 1 : delta.isDelete ? -1 : 0))

  return {
    ratingSum,
    ratingCount,
    ratingAvg,
    bayesianScore: bayesianScore(ratingAvg, ratingCount),
    reviewCount,
  }
}

export const ZERO_AGGREGATE: AggregateFields = {
  ratingSum: 0,
  ratingCount: 0,
  ratingAvg: 0,
  bayesianScore: 0,
  reviewCount: 0,
}
