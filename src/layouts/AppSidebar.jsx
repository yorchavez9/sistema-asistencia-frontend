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
  FileText,
} from "lucide-react"

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

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
      { title: "Cursos", icon: BookOpen, href: "/subjects", permission: "materias.ver" },
      { title: "Grados", icon: School, href: "/grades", permission: "grados.ver" },
      { title: "Secciones", icon: Layers, href: "/sections", permission: "secciones.ver" },
      { title: "Estudiantes", icon: GraduationCap, href: "/students", permission: "estudiantes.ver" },
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
  {
    label: "Ayuda",
    items: [
      { title: "Documentación", icon: FileText, href: "/docs" },
      { title: "Soporte", icon: WhatsAppIcon, external: "https://wa.me/51920468502?text=Hola%20%F0%9F%91%8B%2C%20necesito%20soporte%20con%20el%20Sistema%20de%20Asistencia.%20%C2%BFPodr%C3%ADan%20ayudarme%3F" },
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
                    <SidebarMenuItem key={item.href || item.external}>
                      <SidebarMenuButton
                        isActive={
                          item.href
                            ? item.href === "/"
                              ? location.pathname === "/"
                              : location.pathname.startsWith(item.href)
                            : false
                        }
                        onClick={() =>
                          item.external
                            ? window.open(item.external, "_blank")
                            : navigate(item.href)
                        }
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
