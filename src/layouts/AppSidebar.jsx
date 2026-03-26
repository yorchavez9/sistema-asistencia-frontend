import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import useSettings from "@/hooks/useSettings"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  GraduationCap,
  CalendarDays,
  BookOpen,
  School,
  Layers,
  UserCheck,
  ClipboardCheck,
  ClipboardList,
  Bell,
  FileBarChart,
  BrainCircuit,
  Settings,
  ArrowRightLeft,
} from "lucide-react"

const menuSections = [
  {
    label: "General",
    items: [
      { title: "Inicio", icon: LayoutDashboard, href: "/", permission: "dashboard.ver" },
    ],
  },
  {
    label: "Administración",
    items: [
      { title: "Usuarios", icon: Users, href: "/users", permission: "usuarios.ver" },
      { title: "Roles", icon: Shield, href: "/roles", permission: "roles.ver" },
      { title: "Permisos", icon: Key, href: "/permissions", permission: "permisos.ver" },
    ],
  },
  {
    label: "Gestión Académica",
    items: [
      { title: "Años Académicos", icon: CalendarDays, href: "/academic-years", permission: "anios.ver" },
      { title: "Periodos", icon: Layers, href: "/periods", permission: "periodos.ver" },
      { title: "Grados", icon: School, href: "/grades", permission: "grados.ver" },
      { title: "Secciones", icon: Layers, href: "/sections", permission: "secciones.ver" },
      { title: "Estudiantes", icon: GraduationCap, href: "/students", permission: "estudiantes.ver" },
      { title: "Materias", icon: BookOpen, href: "/subjects", permission: "materias.ver" },
      { title: "Asignaciones", icon: UserCheck, href: "/assignments", permission: "asignaciones.ver" },
      { title: "Transición Anual", icon: ArrowRightLeft, href: "/year-transition", permission: "transicion.ver" },
    ],
  },
  {
    label: "Asistencia",
    items: [
      { title: "Registrar", icon: ClipboardCheck, href: "/attendance", permission: "asistencia.registrar" },
      { title: "Control", icon: ClipboardList, href: "/attendance-management", permission: "asistencia.ver-todo" },
      { title: "Alertas", icon: Bell, href: "/alerts", permission: "alertas.ver" },
    ],
  },
  {
    label: "Reportes e IA",
    items: [
      { title: "Reportes", icon: FileBarChart, href: "/reports", permission: "reportes.ver" },
      { title: "Análisis IA", icon: BrainCircuit, href: "/ai-analysis", permission: "ia.ver-resultados" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Configuración", icon: Settings, href: "/settings", permission: "configuracion.ver" },
    ],
  },
]

export default function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const { logoUrl } = useSettings()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-bold text-lg rounded-xl">SA</div>
            )}
          </div>
          <div>
            <p className="text-base font-bold leading-tight">Asistencia</p>
            <p className="text-sm font-semibold text-muted-foreground">I.E. Los Libertadores</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.permission || hasPermission(item.permission)
          )
          if (visibleItems.length === 0) return null

          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={
                          item.href === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(item.href)
                        }
                        onClick={() => navigate(item.href)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-2">
        <p className="text-xs text-muted-foreground text-center">
          Ccochapata &copy; 2026
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
