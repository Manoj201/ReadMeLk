import { useQuery } from '@tanstack/react-query'
import type { TargetType } from '@/types'
import {
  fetchMyReview,
  fetchRecentReviews,
  fetchReviews,
  fetchReviewsByUser,
} from './api'

export function useReviews(targetType: TargetType, targetId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', targetType, targetId],
    queryFn: () => fetchReviews(targetType, targetId as string),
    enabled: !!targetId,
  })
}

export function useMyReview(targetId: string | undefined, uid: string | undefined) {
  return useQuery({
    queryKey: ['reviews', 'mine', targetId, uid],
    queryFn: () => fetchMyReview(targetId as string, uid as string),
    enabled: !!targetId && !!uid,
  })
}

export function useRecentReviews(max = 8) {
  return useQuery({
    queryKey: ['reviews', 'recent', max],
    queryFn: () => fetchRecentReviews(max),
  })
}

export function useMyReviews(uid: string | undefined) {
  return useQuery({
    queryKey: ['me', 'reviews', uid],
    queryFn: () => fetchReviewsByUser(uid as string),
    enabled: !!uid,
  })
}
