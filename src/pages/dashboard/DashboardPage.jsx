import { useAuth } from "@/contexts/AuthContext"
import DirectorDashboard from "./DirectorDashboard"
import TeacherDashboard from "./TeacherDashboard"

export default function DashboardPage() {
  const { hasPermission } = useAuth()

  if (hasPermission("dashboard.ver-todo")) {
    return <DirectorDashboard />
  }

  return <TeacherDashboard />
}
