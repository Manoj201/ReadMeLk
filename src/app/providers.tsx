import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/i18n'
import { AuthListener } from './AuthListener'
import { useAppChrome } from './useAppChrome'
import { Toaster } from '@/components/ui/toaster'

function Chrome({ children }: { children: ReactNode }) {
  useAppChrome()
  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Chrome>
        <AuthListener />
        {children}
        <Toaster />
      </Chrome>
    </QueryClientProvider>
  )
}
