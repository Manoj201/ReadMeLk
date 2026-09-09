import { create } from 'zustand'
import type { AppUser, Role } from '@/types'

export type AuthStatus = 'loading' | 'authed' | 'anon'

interface AuthState {
  user: AppUser | null
  /** true when the Firebase ID token carries the admin custom claim */
  isAdminClaim: boolean
  status: AuthStatus
  setUser: (user: AppUser | null) => void
  setAdminClaim: (isAdmin: boolean) => void
  setStatus: (status: AuthStatus) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdminClaim: false,
  status: 'loading',
  setUser: (user) => set({ user }),
  setAdminClaim: (isAdminClaim) => set({ isAdminClaim }),
  setStatus: (status) => set({ status }),
  reset: () => set({ user: null, isAdminClaim: false, status: 'anon' }),
}))

export function hasRole(user: AppUser | null, role: Role): boolean {
  return !!user?.roles?.includes(role)
}
