import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  fetchAdminStats,
  fetchOpenReports,
  fetchRecentActions,
  fetchReviewsForAdmin,
  listAuthorsForAdmin,
  listBooksForAdmin,
  listUsers,
} from './api'
import type { Review } from '@/types'

export function useActor() {
  const user = useAuthStore((s) => s.user)
  return user ? { uid: user.uid, displayName: user.displayName } : { uid: '', displayName: 'admin' }
}

export const useAdminStats = () =>
  useQuery({ queryKey: ['admin', 'stats'], queryFn: fetchAdminStats })

export const useRecentActions = () =>
  useQuery({ queryKey: ['admin', 'actions'], queryFn: () => fetchRecentActions() })

export const useOpenReports = () =>
  useQuery({ queryKey: ['admin', 'reports'], queryFn: fetchOpenReports })

export const useAdminReviews = (status?: Review['status']) =>
  useQuery({ queryKey: ['admin', 'reviews', status ?? 'all'], queryFn: () => fetchReviewsForAdmin(status) })

export const useAdminAuthors = () =>
  useQuery({ queryKey: ['admin', 'authors'], queryFn: listAuthorsForAdmin })

export const useAdminBooks = () =>
  useQuery({ queryKey: ['admin', 'books'], queryFn: listBooksForAdmin })

export const useAdminUsers = () =>
  useQuery({ queryKey: ['admin', 'users'], queryFn: listUsers })
