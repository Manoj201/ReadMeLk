import { useQuery } from '@tanstack/react-query'
import {
  fetchBestBooks,
  fetchBook,
  fetchBooks,
  fetchBooksByAuthor,
  type BookFilters,
} from './api'

export function useBooks(filters: BookFilters) {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: () => fetchBooks(filters),
  })
}

export function useBook(id: string | undefined) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => fetchBook(id as string),
    enabled: !!id,
  })
}

export function useBooksByAuthor(authorId: string | undefined) {
  return useQuery({
    queryKey: ['books', 'byAuthor', authorId],
    queryFn: () => fetchBooksByAuthor(authorId as string),
    enabled: !!authorId,
  })
}

export function useBestBooks(max = 8) {
  return useQuery({ queryKey: ['home', 'bestBooks', max], queryFn: () => fetchBestBooks(max) })
}
