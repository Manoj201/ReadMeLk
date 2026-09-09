import { describe, expect, it } from 'vitest'
import {
  applyReviewDelta,
  bayesianScore,
  RATING_C,
  RATING_M,
  ZERO_AGGREGATE,
  round1,
} from './rating'

describe('bayesianScore', () => {
  it('returns 0 with no votes', () => {
    expect(bayesianScore(5, 0)).toBe(0)
  })

  it('pulls a lone 5-star rating toward the prior mean', () => {
    const score = bayesianScore(5, 1)
    expect(score).toBeLessThan(5)
    expect(score).toBeGreaterThan(RATING_C)
  })

  it('approaches the true average as votes grow', () => {
    const few = bayesianScore(4.8, 3)
    const many = bayesianScore(4.8, 500)
    expect(many).toBeGreaterThan(few)
    expect(many).toBeCloseTo(4.8, 1)
  })

  it('uses m and C as documented', () => {
    // with ratingAvg == C, score is exactly C regardless of votes
    expect(bayesianScore(RATING_C, RATING_M)).toBe(round1(RATING_C))
  })
})

describe('applyReviewDelta', () => {
  it('adds a new verified review', () => {
    const next = applyReviewDelta(ZERO_AGGREGATE, {
      newRating: 4,
      isCreate: true,
      isGuest: false,
    })
    expect(next.ratingSum).toBe(4)
    expect(next.ratingCount).toBe(1)
    expect(next.ratingAvg).toBe(4)
    expect(next.reviewCount).toBe(1)
  })

  it('counts a guest rating but not toward reviewCount', () => {
    const next = applyReviewDelta(ZERO_AGGREGATE, {
      newRating: 5,
      isCreate: true,
      isGuest: true,
    })
    expect(next.ratingCount).toBe(1)
    expect(next.ratingSum).toBe(5)
    expect(next.reviewCount).toBe(0)
  })

  it('applies an edit as a delta without changing counts', () => {
    const base = applyReviewDelta(ZERO_AGGREGATE, {
      newRating: 2,
      isCreate: true,
      isGuest: false,
    })
    const edited = applyReviewDelta(base, { oldRating: 2, newRating: 5, isGuest: false })
    expect(edited.ratingCount).toBe(1)
    expect(edited.ratingSum).toBe(5)
    expect(edited.ratingAvg).toBe(5)
  })

  it('unwinds a deleted review', () => {
    const a = applyReviewDelta(ZERO_AGGREGATE, { newRating: 4, isCreate: true, isGuest: false })
    const b = applyReviewDelta(a, { newRating: 2, isCreate: true, isGuest: false })
    const afterDelete = applyReviewDelta(b, { oldRating: 4, isDelete: true, isGuest: false })
    expect(afterDelete.ratingCount).toBe(1)
    expect(afterDelete.ratingSum).toBe(2)
    expect(afterDelete.reviewCount).toBe(1)
  })

  it('never goes negative', () => {
    const next = applyReviewDelta(ZERO_AGGREGATE, {
      oldRating: 5,
      isDelete: true,
      isGuest: false,
    })
    expect(next.ratingCount).toBe(0)
    expect(next.ratingSum).toBe(0)
    expect(next.ratingAvg).toBe(0)
  })
})
