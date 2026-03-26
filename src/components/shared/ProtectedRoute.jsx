import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Spinner } from "@/components/ui/spinner"

export default function ProtectedRoute({ children, permission, anyPermission }) {
  const { user, loading, hasPermission, hasAnyPermission } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (anyPermission && !hasAnyPermission(anyPermission)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
