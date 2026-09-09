import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, hasRole } from '@/stores/authStore'
import { LoadingBlock } from '@/components/StateBlocks'
import type { Role } from '@/types'

export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()

  if (status === 'loading') return <LoadingBlock className="container py-12" />
  if (status !== 'authed') {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/signin?next=${next}`} replace />
  }
  return <>{children}</>
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const isAdminClaim = useAuthStore((s) => s.isAdminClaim)

  if (status === 'loading') return <LoadingBlock className="container py-12" />

  const allowed = role === 'admin' ? isAdminClaim || hasRole(user, 'admin') : hasRole(user, role)
  if (!allowed) return <Navigate to="/404" replace />
  return <>{children}</>
}
