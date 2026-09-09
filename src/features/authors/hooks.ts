import { useQuery } from '@tanstack/react-query'
import { fetchAuthor, fetchAuthors, fetchTopAuthors } from './api'

export function useAuthor(id: string | undefined) {
  return useQuery({
    queryKey: ['author', id],
    queryFn: () => fetchAuthor(id as string),
    enabled: !!id,
  })
}

export function useAuthors() {
  return useQuery({ queryKey: ['authors', 'all'], queryFn: () => fetchAuthors() })
}

export function useTopAuthors(max = 6) {
  return useQuery({ queryKey: ['home', 'topAuthors', max], queryFn: () => fetchTopAuthors(max) })
}
