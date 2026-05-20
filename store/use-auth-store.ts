import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getAuthToken, getUser, setAuthToken, clearAuth } from '@/lib/auth'

interface User {
  id: number
  name?: string
  email: string
  roles: string[]
  permissions: string[]
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  initAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        setAuthToken(token, user)
        set({ token, user, isAuthenticated: true })
      },

      logout: () => {
        clearAuth()
        set({ token: null, user: null, isAuthenticated: false })
      },

      hasPermission: (permission) => {
        const user = get().user
        if (!user || !user.permissions) return false
        return user.permissions.includes(permission)
      },

      hasRole: (role) => {
        const user = get().user
        if (!user || !user.roles) return false
        return user.roles.includes(role)
      },

      initAuth: () => {
        const token = getAuthToken()
        const user = getUser()
        if (token && user) {
          set({ token, user, isAuthenticated: true })
        } else {
          set({ token: null, user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
