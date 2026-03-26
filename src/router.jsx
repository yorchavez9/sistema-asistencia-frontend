import { createBrowserRouter } from "react-router-dom"
import MainLayout from "@/layouts/MainLayout"
import ProtectedRoute from "@/components/shared/ProtectedRoute"
import LoginPage from "@/pages/auth/LoginPage"
import SetupPage from "@/pages/auth/SetupPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import UnauthorizedPage from "@/pages/UnauthorizedPage"
import NotFoundPage from "@/pages/NotFoundPage"

// Lazy imports para páginas pesadas
import { lazy, Suspense } from "react"
import { Spinner } from "@/components/ui/spinner"

const UsersPage = lazy(() => import("@/pages/users/UsersPage"))
const RolesPage = lazy(() => import("@/pages/roles/RolesPage"))
const PermissionsPage = lazy(() => import("@/pages/permissions/PermissionsPage"))
const AcademicYearsPage = lazy(() => import("@/pages/academic/AcademicYearsPage"))
const PeriodsPage = lazy(() => import("@/pages/academic/PeriodsPage"))
const GradesPage = lazy(() => import("@/pages/academic/GradesPage"))
const SectionsPage = lazy(() => import("@/pages/academic/SectionsPage"))
const StudentsPage = lazy(() => import("@/pages/academic/StudentsPage"))
const SubjectsPage = lazy(() => import("@/pages/academic/SubjectsPage"))
const AssignmentsPage = lazy(() => import("@/pages/academic/AssignmentsPage"))
const AttendancePage = lazy(() => import("@/pages/attendance/AttendancePage"))
const AttendanceManagementPage = lazy(() => import("@/pages/attendance/AttendanceManagementPage"))
const AlertsPage = lazy(() => import("@/pages/alerts/AlertsPage"))
const ReportsPage = lazy(() => import("@/pages/reports/ReportsPage"))
const AIAnalysisPage = lazy(() => import("@/pages/ai/AIAnalysisPage"))
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"))
const YearTransitionPage = lazy(() => import("@/pages/academic/YearTransitionPage"))
const DocumentationPage = lazy(() => import("@/pages/docs/DocumentationPage"))

function LazyPage({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

function Protected({ children, permission, anyPermission }) {
  return (
    <ProtectedRoute permission={permission} anyPermission={anyPermission}>
      <LazyPage>{children}</LazyPage>
    </ProtectedRoute>
  )
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/setup",
    element: <SetupPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <Protected permission="usuarios.ver"><UsersPage /></Protected> },
      { path: "roles", element: <Protected permission="roles.ver"><RolesPage /></Protected> },
      { path: "permissions", element: <Protected permission="permisos.ver"><PermissionsPage /></Protected> },
      { path: "academic-years", element: <Protected permission="anios.ver"><AcademicYearsPage /></Protected> },
      { path: "periods", element: <Protected permission="periodos.ver"><PeriodsPage /></Protected> },
      { path: "grades", element: <Protected permission="grados.ver"><GradesPage /></Protected> },
      { path: "sections", element: <Protected permission="secciones.ver"><SectionsPage /></Protected> },
      { path: "students", element: <Protected permission="estudiantes.ver"><StudentsPage /></Protected> },
      { path: "subjects", element: <Protected permission="materias.ver"><SubjectsPage /></Protected> },
      { path: "assignments", element: <Protected permission="asignaciones.ver"><AssignmentsPage /></Protected> },
      { path: "attendance", element: <Protected permission="asistencia.registrar"><AttendancePage /></Protected> },
      { path: "attendance-management", element: <Protected permission="asistencia.ver-todo"><AttendanceManagementPage /></Protected> },
      { path: "alerts", element: <Protected permission="alertas.ver"><AlertsPage /></Protected> },
      { path: "reports", element: <Protected permission="reportes.ver"><ReportsPage /></Protected> },
      { path: "ai-analysis", element: <Protected permission="ia.ver-resultados"><AIAnalysisPage /></Protected> },
      { path: "year-transition", element: <Protected permission="transicion.ver"><YearTransitionPage /></Protected> },
      { path: "settings", element: <Protected permission="configuracion.ver"><SettingsPage /></Protected> },
      { path: "docs", element: <LazyPage><DocumentationPage /></LazyPage> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])

export default router
