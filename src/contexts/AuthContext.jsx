import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authApi } from "@/api/auth"
import { queryClient } from "@/App"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await authApi.me()
      setUser(data.data)
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem("token", data.data.token)
    setUser(data.data.user)
    return data.data
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      queryClient.clear()
    }
  }

  const hasPermission = (permission) => {
    if (!user) return false
    return user.permissions?.includes(permission) ?? false
  }

  const hasRole = (role) => {
    if (!user) return false
    return user.roles?.some((r) => r.name === role) ?? false
  }

  const hasAnyPermission = (permissions) => {
    return permissions.some((p) => hasPermission(p))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        hasPermission,
        hasRole,
        hasAnyPermission,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
