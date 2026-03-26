import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  BookOpen, ClipboardCheck, BarChart3, BrainCircuit, Users, Shield,
  GraduationCap, CalendarDays, Bell, Settings, ChevronRight, Search,
  ArrowRightLeft, ChevronDown, CheckCircle2, AlertTriangle, Info,
  Lightbulb, ClipboardList, FileBarChart, Save, Eye, Trash2,
  User, Calendar, Building2, ShieldAlert, TrendingUp, Activity,
  Upload, Download, Database, BookOpenCheck, Layers, UserCheck,
  Clock, BookOpen as BookOpenIcon, Pencil, FileSpreadsheet, Plus,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

/* ═══════════════════════════════════════════════════════════
   MOCKUP COMPONENTS — replican la UI real del sistema
   ═══════════════════════════════════════════════════════════ */

function MockBrowser({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-border/50 overflow-hidden shadow-md bg-background my-5 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border/30">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 h-5 rounded bg-muted/60 mx-8 flex items-center px-2">
          <span className="text-[9px] text-muted-foreground truncate">{title}</span>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function MockSidebar({ active = "Inicio" }) {
  const groups = [
    { label: "General", items: ["Inicio"] },
    { label: "Asistencia", items: ["Registrar", "Control", "Alertas"] },
    { label: "Reportes e IA", items: ["Reportes", "Análisis IA"] },
  ]
  return (
    <div className="w-44 shrink-0 border-r border-border/30 bg-muted/15 dark:bg-muted/5">
      <div className="px-3 py-3 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">SA</span>
          </div>
          <div>
            <div className="text-[9px] font-bold leading-tight">Asistencia</div>
            <div className="text-[8px] text-muted-foreground">I.E. Los Libertadores</div>
          </div>
        </div>
      </div>
      <div className="p-1.5 space-y-2">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-2 py-1 text-[8px] font-semibold text-muted-foreground uppercase">{g.label}</div>
            {g.items.map((item) => (
              <div key={item} className={`px-2 py-1.5 rounded-md text-[10px] ${item === active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function MockPageHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="text-xs font-bold">{title}</div>
      {action && <div className="h-6 px-2.5 rounded-md bg-primary flex items-center gap-1 text-[9px] font-medium text-primary-foreground"><Plus className="h-2.5 w-2.5" />{action}</div>}
    </div>
  )
}

function MockSelect({ value, className = "w-full" }) {
  return (
    <div className={`h-7 rounded-md border border-border/40 bg-muted/15 px-2 flex items-center justify-between text-[10px] ${className}`}>
      <span className="text-muted-foreground truncate">{value}</span>
      <ChevronDown className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
    </div>
  )
}

function MockInput({ value, icon: Icon, className = "" }) {
  return (
    <div className={`h-7 rounded-md border border-border/40 bg-muted/15 px-2 flex items-center gap-1.5 text-[10px] text-muted-foreground ${className}`}>
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {value}
    </div>
  )
}

function MockBadge({ color = "green", children }) {
  const colors = {
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    yellow: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    gray: "bg-muted text-muted-foreground",
    primary: "bg-primary/15 text-primary",
  }
  return <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-medium ${colors[color]}`}>{children}</span>
}

function MockTable({ headers, rows, compact }) {
  return (
    <div className="border border-border/30 rounded-lg overflow-hidden">
      <div className={`grid bg-muted/30 border-b border-border/20 ${compact ? "text-[8px]" : "text-[9px]"}`} style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}>
        {headers.map((h) => <div key={h} className="px-2 py-1.5 font-semibold text-muted-foreground">{h}</div>)}
      </div>
      {rows.map((row, i) => (
        <div key={i} className={`grid border-b border-border/10 last:border-0 ${compact ? "text-[8px]" : "text-[9px]"}`} style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}>
          {row.map((cell, j) => <div key={j} className="px-2 py-1.5 text-foreground/80 truncate">{cell}</div>)}
        </div>
      ))}
    </div>
  )
}

function MockStatusBtn({ label, active, color }) {
  const cls = active
    ? color === "green" ? "bg-green-600 text-white border-green-600"
      : color === "yellow" ? "bg-yellow-500 text-white border-yellow-500"
      : color === "blue" ? "bg-blue-500 text-white border-blue-500"
      : "bg-red-600 text-white border-red-600"
    : "bg-muted/40 text-muted-foreground border-border/30"
  return <div className={`h-5 min-w-[22px] px-1 rounded border text-[8px] font-bold flex items-center justify-center ${cls}`}>{label}</div>
}

function MockChart({ bars, labels }) {
  return (
    <div className="flex items-end gap-1.5 h-20">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <span className="text-[7px] text-muted-foreground">{h}%</span>
          <div className={`w-full rounded-t-sm transition-all ${h >= 90 ? "bg-emerald-400/70" : h >= 80 ? "bg-amber-400/70" : "bg-red-400/70"}`} style={{ height: `${h * 0.75}%` }} />
          <span className="text-[7px] text-muted-foreground truncate w-full text-center">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function MockGauge({ value }) {
  const angle = (value / 100) * 180
  return (
    <div className="relative w-20 h-12 mx-auto">
      <svg viewBox="0 0 100 55" className="w-full h-full">
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="8" strokeLinecap="round" />
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="currentColor" className={value >= 85 ? "text-emerald-500" : value >= 70 ? "text-amber-500" : "text-red-500"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(angle / 180) * 126} 126`} />
        <text x="50" y="48" textAnchor="middle" className="fill-foreground text-[14px] font-bold">{value}%</text>
      </svg>
    </div>
  )
}

function MockPie() {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 36 36" className="w-16 h-16">
        <circle cx="18" cy="18" r="12" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="5" />
        <circle cx="18" cy="18" r="12" fill="none" className="text-emerald-500" strokeWidth="5" strokeDasharray="56 100" strokeDashoffset="25" stroke="currentColor" />
        <circle cx="18" cy="18" r="12" fill="none" className="text-amber-500" strokeWidth="5" strokeDasharray="10 100" strokeDashoffset="69" stroke="currentColor" />
        <circle cx="18" cy="18" r="12" fill="none" className="text-red-500" strokeWidth="5" strokeDasharray="7 100" strokeDashoffset="79" stroke="currentColor" />
      </svg>
      <div className="space-y-0.5 text-[8px]">
        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Presentes: 75%</div>
        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Tardanzas: 10%</div>
        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />F. Injust.: 8%</div>
        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />F. Just.: 7%</div>
      </div>
    </div>
  )
}

function MockChatMsg({ role, text }) {
  const isUser = role === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[10px] leading-relaxed ${isUser ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>{text}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */

function Tip({ type = "info", children }) {
  const cfg = {
    info: { icon: Info, bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", color: "text-blue-700 dark:text-blue-400", label: "Nota" },
    tip: { icon: Lightbulb, bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", color: "text-emerald-700 dark:text-emerald-400", label: "Consejo" },
    warning: { icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", color: "text-amber-700 dark:text-amber-400", label: "Importante" },
    danger: { icon: AlertTriangle, bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", color: "text-red-700 dark:text-red-400", label: "Precaución" },
  }
  const c = cfg[type]
  return (
    <div className={`flex gap-3 rounded-xl p-4 my-4 border ${c.bg} ${c.border}`}>
      <c.icon className={`h-5 w-5 shrink-0 mt-0.5 ${c.color}`} />
      <div className="text-sm"><strong className={c.color}>{c.label}:</strong> {children}</div>
    </div>
  )
}

function StepList({ steps }) {
  return (
    <div className="space-y-3 my-4">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{i + 1}</div>
          <div className="pt-0.5 text-sm leading-relaxed">{step}</div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SECCIONES DE DOCUMENTACIÓN
   ═══════════════════════════════════════════════════════════ */

const docenteSections = [
  {
    id: "inicio",
    icon: BookOpenCheck,
    title: "Inicio y Dashboard",
    desc: "Acceso al sistema y panel principal",
    gradient: "from-primary/90 to-primary",
    content: (
      <>
        <p className="text-base leading-relaxed">Al iniciar sesión verás el <strong>Dashboard</strong> con un resumen de tu actividad del día.</p>

        <h3>Panel del Docente</h3>
        <MockBrowser title="localhost:5173">
          <div className="flex min-h-[240px]">
            <MockSidebar active="Inicio" />
            <div className="flex-1 p-3 space-y-3">
              <div className="text-[10px] text-muted-foreground">Hola, <strong className="text-foreground">Prof. María García</strong> · 26 mar 2026</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-1 text-[8px] text-muted-foreground mb-1"><BookOpenIcon className="h-2.5 w-2.5 text-primary" />Cursos Hoy</div>
                  <div className="text-lg font-bold text-primary">3</div>
                  <div className="text-[8px] text-muted-foreground"><span className="text-emerald-600">2</span> registrados · <span className="text-amber-600">1</span> pendiente</div>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-1 text-[8px] text-muted-foreground mb-1"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />% Asistencia</div>
                  <MockGauge value={92} />
                </div>
                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-1 text-[8px] text-muted-foreground mb-1"><AlertTriangle className="h-2.5 w-2.5 text-amber-500" />Alertas</div>
                  <div className="text-lg font-bold text-amber-600">5</div>
                  <div className="text-[8px] text-muted-foreground">sin leer</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
                  <div className="text-[8px] text-muted-foreground font-medium mb-1">Distribución</div>
                  <MockPie />
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
                  <div className="text-[8px] text-muted-foreground font-medium mb-1">Estudiantes por curso</div>
                  <MockChart bars={[30, 28, 35]} labels={["Matem.", "Comun.", "Ciencia"]} />
                </div>
              </div>
            </div>
          </div>
        </MockBrowser>

        <StepList steps={[
          "Ingresa con tu correo y contraseña proporcionados por la institución.",
          "El Dashboard muestra tus cursos del día, porcentaje de asistencia y alertas pendientes.",
          "Usa el menú lateral para navegar a los módulos de Asistencia, Reportes o Chat IA.",
        ]} />
      </>
    ),
  },
  {
    id: "asistencia",
    icon: ClipboardCheck,
    title: "Registrar Asistencia",
    desc: "Registro diario paso a paso",
    gradient: "from-primary/90 to-primary",
    content: (
      <>
        <p className="text-base leading-relaxed">Módulo principal para docentes. Registra la asistencia diaria de tus secciones asignadas.</p>

        <h3>Vista "Mis cursos"</h3>
        <MockBrowser title="localhost:5173/attendance">
          <div className="flex min-h-[260px]">
            <MockSidebar active="Registrar" />
            <div className="flex-1 p-3 space-y-3">
              <MockPageHeader title="Registro de Asistencia" />
              <div className="flex gap-2 items-end">
                <div className="flex-1"><div className="text-[8px] text-muted-foreground mb-0.5">Asignación</div><MockSelect value="Matemática - 3° Sec. A" /></div>
                <div className="w-24"><div className="text-[8px] text-muted-foreground mb-0.5">Fecha</div><MockInput value="26/03/2026" /></div>
                <div className="h-7 px-2.5 rounded-md bg-primary flex items-center text-[9px] font-medium text-primary-foreground shrink-0">Iniciar registro</div>
              </div>
              <div className="text-[8px] text-muted-foreground flex items-center gap-1"><ClipboardList className="h-2.5 w-2.5" />Mis cursos - Estado de hoy</div>
              <MockTable
                headers={["Materia", "Sección", "Estado hoy", "Acción"]}
                rows={[
                  ["Matemática", "3° Sec. A", <MockBadge key="1" color="green">Registrado (32)</MockBadge>, <span key="a1" className="text-[8px] text-primary underline">Ver/Editar</span>],
                  ["Matemática", "3° Sec. B", <MockBadge key="2" color="gray">Pendiente</MockBadge>, <span key="a2" className="text-[8px] text-primary font-medium">Registrar</span>],
                  ["Comunicación", "2° Sec. A", <MockBadge key="3" color="green">Registrado (28)</MockBadge>, <span key="a3" className="text-[8px] text-primary underline">Ver/Editar</span>],
                ]}
              />
            </div>
          </div>
        </MockBrowser>

        <h3>Modal de registro</h3>
        <MockBrowser title="Registro de Asistencia — Matemática 3° A — 26/03/2026">
          <div className="p-3 space-y-3">
            <div className="flex gap-1.5 flex-wrap">
              <MockBadge color="green">Presente: 28</MockBadge>
              <MockBadge color="yellow">Tardanza: 2</MockBadge>
              <MockBadge color="blue">F. Justificada: 1</MockBadge>
              <MockBadge color="red">F. Injustificada: 1</MockBadge>
            </div>
            <div className="border border-border/30 rounded-lg overflow-hidden text-[9px]">
              <div className="grid grid-cols-[30px_1fr_auto_1fr] bg-muted/30 border-b border-border/20">
                <div className="px-2 py-1.5 font-semibold text-muted-foreground">#</div>
                <div className="px-2 py-1.5 font-semibold text-muted-foreground">Estudiante</div>
                <div className="px-2 py-1.5 font-semibold text-muted-foreground">Estado</div>
                <div className="px-2 py-1.5 font-semibold text-muted-foreground">Observación</div>
              </div>
              {[
                { n: 1, name: "CHAVEZ HUINCHO, Juan", status: "P", color: "green" },
                { n: 2, name: "CONDORI YLLANES, María", status: "P", color: "green" },
                { n: 3, name: "MAMANI QUISPE, Pedro", status: "T", color: "yellow" },
                { n: 4, name: "QUISPE HUAMÁN, Ana", status: "FI", color: "red" },
              ].map((r) => (
                <div key={r.n} className="grid grid-cols-[30px_1fr_auto_1fr] border-b border-border/10 last:border-0">
                  <div className="px-2 py-1.5 text-muted-foreground">{r.n}</div>
                  <div className="px-2 py-1.5 font-medium">{r.name}</div>
                  <div className="px-2 py-1.5 flex gap-0.5">
                    <MockStatusBtn label="P" active={r.status === "P"} color="green" />
                    <MockStatusBtn label="T" active={r.status === "T"} color="yellow" />
                    <MockStatusBtn label="FJ" active={r.status === "FJ"} color="blue" />
                    <MockStatusBtn label="FI" active={r.status === "FI"} color="red" />
                  </div>
                  <div className="px-2 py-1.5"><div className="h-5 rounded border border-border/30 bg-muted/10 px-1 text-[8px] text-muted-foreground flex items-center">Opcional...</div></div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <div className="h-6 px-3 rounded-md border border-border/40 flex items-center text-[9px] text-muted-foreground">Cancelar</div>
              <div className="h-6 px-3 rounded-md bg-primary flex items-center gap-1 text-[9px] font-medium text-primary-foreground"><Save className="h-2.5 w-2.5" />Guardar</div>
            </div>
          </div>
        </MockBrowser>

        <Tip type="tip">Por defecto todos aparecen como "Presente" (P). Solo cambia los que tienen tardanza o falta.</Tip>
        <Tip type="info">Para editar una asistencia ya registrada, selecciona el mismo curso y fecha. El sistema cargará los datos guardados.</Tip>
      </>
    ),
  },
  {
    id: "reportes",
    icon: BarChart3,
    title: "Reportes y Estadísticas",
    desc: "Gráficos y tablas de asistencia",
    gradient: "from-primary/90 to-primary",
    content: (
      <>
        <p className="text-base leading-relaxed">Consulta estadísticas con gráficos interactivos. Exporta en Excel o PDF.</p>

        <h3>Vista de reportes con pestañas</h3>
        <MockBrowser title="localhost:5173/reports">
          <div className="flex min-h-[280px]">
            <MockSidebar active="Reportes" />
            <div className="flex-1 p-3 space-y-3">
              <MockPageHeader title="Reportes" />
              <div className="flex gap-1 bg-muted/30 rounded-lg p-1">
                {[
                  { icon: User, label: "Estudiante", active: false },
                  { icon: Users, label: "Sección", active: true },
                  { icon: Calendar, label: "Periodo", active: false },
                  { icon: Building2, label: "Institucional", active: false },
                  { icon: ShieldAlert, label: "En Riesgo", active: false },
                ].map((t) => (
                  <div key={t.label} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] ${t.active ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground"}`}>
                    <t.icon className="h-3 w-3" />{t.label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
                  <div className="text-[8px] text-muted-foreground font-medium mb-1">Distribución — 3° A</div>
                  <MockPie />
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
                  <div className="text-[8px] text-muted-foreground font-medium mb-1">Asistencia por sección</div>
                  <MockChart bars={[92, 88, 95, 78, 91, 85]} labels={["1°A", "1°B", "2°A", "2°B", "3°A", "3°B"]} />
                </div>
              </div>
              <MockTable compact
                headers={["Estudiante", "Presentes", "Tardanzas", "Faltas", "% Asist."]}
                rows={[
                  ["CHAVEZ H., Juan", "45", "3", "2", <MockBadge key="1" color="green">90%</MockBadge>],
                  ["CONDORI Y., María", "42", "5", "3", <MockBadge key="2" color="green">84%</MockBadge>],
                  ["QUISPE H., Ana", "35", "2", "13", <MockBadge key="3" color="red">70%</MockBadge>],
                ]}
              />
              <div className="flex justify-end gap-1">
                <div className="px-2 py-1 rounded text-[8px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">Excel</div>
                <div className="px-2 py-1 rounded text-[8px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">PDF</div>
              </div>
            </div>
          </div>
        </MockBrowser>

        <Tip type="tip">Usa los botones <strong>Excel</strong> y <strong>PDF</strong> en la parte superior de cada reporte para exportar.</Tip>
      </>
    ),
  },
  {
    id: "alertas",
    icon: Bell,
    title: "Alertas de Inasistencia",
    desc: "Notificaciones automáticas de faltas",
    gradient: "from-primary/90 to-primary",
    content: (
      <>
        <p className="text-base leading-relaxed">El sistema genera alertas automáticas cuando un estudiante acumula faltas injustificadas.</p>

        <h3>Panel de alertas</h3>
        <MockBrowser title="localhost:5173/alerts">
          <div className="flex min-h-[240px]">
            <MockSidebar active="Alertas" />
            <div className="flex-1 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold">Alertas de Inasistencia</div>
                  <MockBadge color="red">3 sin resolver</MockBadge>
                </div>
                <div className="h-6 px-2 rounded-md border border-border/40 flex items-center text-[9px] text-muted-foreground">Marcar todas como leídas</div>
              </div>
              <div className="flex gap-2">
                <MockSelect value="Todos los tipos" className="w-36" />
                <MockSelect value="Todas" className="w-28" />
              </div>
              <MockTable
                headers={["Estudiante", "Tipo", "Mensaje", "Fecha", "Estado", "Acciones"]}
                rows={[
                  [<span key="n1" className="flex items-center gap-1 font-medium">QUISPE H., Ana <span className="w-1.5 h-1.5 rounded-full bg-primary" /></span>, <MockBadge key="t1" color="red">Consecutiva</MockBadge>, <span key="m1" className="text-muted-foreground truncate">3 faltas consecutivas</span>, "25/03", <MockBadge key="s1" color="gray">Pendiente</MockBadge>, <span key="a1" className="flex gap-0.5"><Eye className="h-3 w-3 text-muted-foreground" /><CheckCircle2 className="h-3 w-3 text-primary" /><Trash2 className="h-3 w-3 text-red-400" /></span>],
                  ["MAMANI Q., Pedro", <MockBadge key="t2" color="yellow">Frecuencia</MockBadge>, <span key="m2" className="text-muted-foreground truncate">5 faltas acumuladas</span>, "24/03", <MockBadge key="s2" color="gray">Pendiente</MockBadge>, <span key="a2" className="flex gap-0.5"><CheckCircle2 className="h-3 w-3 text-primary" /><Trash2 className="h-3 w-3 text-red-400" /></span>],
                  ["CONDORI Y., Renzo", <MockBadge key="t3" color="red">Riesgo deserción</MockBadge>, <span key="m3" className="text-muted-foreground truncate">Asistencia menor al 70%</span>, "23/03", <MockBadge key="s3" color="green">Resuelta</MockBadge>, <span key="a3"><Trash2 className="h-3 w-3 text-red-400" /></span>],
                ]}
              />
            </div>
          </div>
        </MockBrowser>

        <StepList steps={[
          "El sistema detecta automáticamente cuando un alumno acumula faltas.",
          <>Las alertas aparecen en <strong>Asistencia → Alertas</strong> con un indicador de no leída (punto azul).</>,
          <>Haz clic en el ícono <Eye className="h-3.5 w-3.5 inline" /> para marcar como leída.</>,
          <>Haz clic en <CheckCircle2 className="h-3.5 w-3.5 inline text-primary" /> para resolver (ej: tras contactar al apoderado).</>,
        ]} />
      </>
    ),
  },
  {
    id: "chat-ia",
    icon: BrainCircuit,
    title: "Chat de Análisis IA",
    desc: "Asistente inteligente en tiempo real",
    gradient: "from-primary/90 to-primary",
    content: (
      <>
        <p className="text-base leading-relaxed">Consulta datos de asistencia en lenguaje natural. Respuestas con streaming en tiempo real.</p>

        <h3>Vista del chat</h3>
        <MockBrowser title="localhost:5173/ai-analysis">
          <div className="flex min-h-[260px]">
            <div className="w-48 shrink-0 border-r border-border/30 bg-muted/10 p-2 space-y-1">
              <div className="h-7 rounded-md bg-primary/10 flex items-center justify-center text-[9px] text-primary font-medium">+ Nueva conversación</div>
              <div className="px-2 py-1.5 rounded-md bg-muted/40 text-[9px] font-medium truncate">¿Qué estudiantes tienen...</div>
              <div className="px-2 py-1.5 rounded-md text-[9px] text-muted-foreground truncate">Resumen de 3° A</div>
              <div className="px-2 py-1.5 rounded-md text-[9px] text-muted-foreground truncate">Análisis: 1° Sec. B</div>
            </div>
            <div className="flex-1 p-3 space-y-2.5 flex flex-col">
              <div className="flex-1 space-y-2">
                <MockChatMsg role="user" text="¿Qué estudiantes tienen más faltas injustificadas en 3°A?" />
                <MockChatMsg role="assistant" text={
                  <div className="space-y-1">
                    <div>Los estudiantes con más faltas injustificadas en <strong>3° Secundaria "A"</strong>:</div>
                    <div className="pl-1.5 space-y-0.5 text-[9px]">
                      <div>1. <strong>QUISPE HUAMÁN, Ana</strong> — 8 faltas (70% asist.)</div>
                      <div>2. <strong>MAMANI QUISPE, Pedro</strong> — 5 faltas (84% asist.)</div>
                      <div>3. <strong>CONDORI Y., Renzo</strong> — 4 faltas (88% asist.)</div>
                    </div>
                    <div className="pt-1 border-t border-border/20 text-[9px]">Recomiendo contactar a los apoderados de estos alumnos.</div>
                  </div>
                } />
                <MockChatMsg role="user" text="Dame un resumen general de toda la institución" />
                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground pl-1">
                  <div className="flex gap-0.5"><span className="w-1 h-1 rounded-full bg-primary animate-pulse" /><span className="w-1 h-1 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" /><span className="w-1 h-1 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" /></div>
                  Analizando datos...
                </div>
              </div>
              <div className="h-8 rounded-xl border border-border/40 bg-muted/15 px-3 flex items-center text-[9px] text-muted-foreground">Escribe tu pregunta...</div>
            </div>
          </div>
        </MockBrowser>

        <h3>Ejemplos de consultas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-4">
          {["¿Cuántas faltas tiene Juan Pérez?", "¿Qué sección tiene más inasistencias?", "Dame el resumen de 3° A", "¿Qué alumnos están en riesgo?", "Recomiéndame acciones", "¿Cómo va la tendencia mensual?"].map((q) => (
            <div key={q} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30 text-xs">
              <BrainCircuit className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="italic text-muted-foreground">"{q}"</span>
            </div>
          ))}
        </div>

        <Tip type="info">La IA responde con <strong>streaming en tiempo real</strong> (como ChatGPT). Usa datos reales actualizados del sistema.</Tip>
      </>
    ),
  },
]

const directorSections = [
  {
    id: "usuarios",
    icon: Users,
    title: "Gestión de Usuarios",
    desc: "Crear y administrar cuentas",
    gradient: "from-primary/90 to-primary",
    content: (
      <>
        <p className="text-base leading-relaxed">Administra las cuentas de docentes, auxiliares y personal.</p>

        <h3>Lista de usuarios</h3>
        <MockBrowser title="localhost:5173/users">
          <div className="p-3 space-y-3">
            <MockPageHeader title="Usuarios" action="Nuevo usuario" />
            <div className="flex gap-2">
              <MockInput value="Buscar por nombre, DNI, correo..." icon={Search} className="flex-1" />
              <MockSelect value="Todos los roles" className="w-36" />
            </div>
            <MockTable
              headers={["Nombre", "DNI", "Correo", "Rol", "Estado", "Acciones"]}
              rows={[
                ["Juan Pérez López", "12345678", "juan@colegio.pe", <MockBadge key="r1" color="blue">Director</MockBadge>, <MockBadge key="s1" color="green">Activo</MockBadge>, <span key="a1" className="flex gap-0.5"><Pencil className="h-3 w-3 text-muted-foreground" /><Trash2 className="h-3 w-3 text-red-400" /></span>],
                ["María García Quispe", "23456789", "maria@colegio.pe", <MockBadge key="r2" color="gray">Docente</MockBadge>, <MockBadge key="s2" color="green">Activo</MockBadge>, <span key="a2" className="flex gap-0.5"><Pencil className="h-3 w-3 text-muted-foreground" /><Trash2 className="h-3 w-3 text-red-400" /></span>],
                ["Pedro Mamani H.", "34567890", "pedro@colegio.pe", <MockBadge key="r3" color="gray">Docente</MockBadge>, <MockBadge key="s3" color="green">Activo</MockBadge>, <span key="a3" className="flex gap-0.5"><Pencil className="h-3 w-3 text-muted-foreground" /><Trash2 className="h-3 w-3 text-red-400" /></span>],
              ]}
            />
          </div>
        </MockBrowser>

        <h3>Roles del sistema</h3>
        <div className="grid grid-cols-3 gap-3 my-4">
          {[
            { role: "Director", color: "blue", perms: ["Acceso completo", "Gestionar usuarios", "Configurar sistema"] },
            { role: "Docente", color: "green", perms: ["Registrar asistencia", "Ver sus secciones", "Chat IA"] },
            { role: "Auxiliar", color: "yellow", perms: ["Registrar asistencia", "Ver reportes", "Alertas"] },
          ].map((r) => (
            <div key={r.role} className="p-3 rounded-xl border border-border/30 bg-muted/10">
              <MockBadge color={r.color}>{r.role}</MockBadge>
              <ul className="mt-2 space-y-1">{r.perms.map((p) => <li key={p} className="flex items-center gap-1 text-[10px] text-muted-foreground"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />{p}</li>)}</ul>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "academica",
    icon: GraduationCap,
    title: "Gestión Académica",
    desc: "Grados, secciones, cursos y estudiantes",
    gradient: "from-primary/90 to-primary",
    content: (
      <>
        <p className="text-base leading-relaxed">Configura toda la estructura académica de tu institución.</p>

        <h3>Estudiantes — Importación masiva</h3>
        <MockBrowser title="localhost:5173/students">
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div><div className="text-xs font-bold">Estudiantes</div><div className="text-[9px] text-muted-foreground">320 estudiantes registrados</div></div>
              <div className="flex gap-1.5">
                <div className="h-6 px-2.5 rounded-md border border-border/40 flex items-center gap-1 text-[9px] text-muted-foreground"><FileSpreadsheet className="h-3 w-3" />Importar</div>
                <div className="h-6 px-2.5 rounded-md bg-primary flex items-center gap-1 text-[9px] font-medium text-primary-foreground"><Plus className="h-2.5 w-2.5" />Nuevo</div>
              </div>
            </div>
            <div className="flex gap-2">
              <MockInput value="Buscar por nombre o DNI..." icon={Search} className="flex-1" />
              <MockSelect value="Todas las secciones" className="w-40" />
            </div>
            <MockTable
              headers={["N°", "DNI", "Estudiante", "Sección", "Estado", "Acciones"]}
              rows={[
                ["1", "72345678", <span key="n1" className="font-medium">CHAVEZ HUINCHO, Juan</span>, "3° Sec. A", <MockBadge key="s1" color="green">Activo</MockBadge>, <span key="a1" className="flex gap-0.5"><Pencil className="h-3 w-3 text-muted-foreground" /><Trash2 className="h-3 w-3 text-red-400" /></span>],
                ["2", "72345679", <span key="n2" className="font-medium">CONDORI YLLANES, María</span>, "3° Sec. A", <MockBadge key="s2" color="green">Activo</MockBadge>, <span key="a2" className="flex gap-0.5"><Pencil className="h-3 w-3 text-muted-foreground" /><Trash2 className="h-3 w-3 text-red-400" /></span>],
                ["3", "72345680", <span key="n3" className="font-medium">MAMANI QUISPE, Pedro</span>, "2° Sec. B", <MockBadge key="s3" color="green">Activo</MockBadge>, <span key="a3" className="flex gap-0.5"><Pencil className="h-3 w-3 text-muted-foreground" /><Trash2 className="h-3 w-3 text-red-400" /></span>],
              ]}
            />
            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
              <span>Mostrando 1-15 de 320</span>
              <div className="flex gap-0.5">{[1, 2, 3, "...", 22].map((p, i) => <div key={i} className={`w-5 h-5 rounded flex items-center justify-center ${p === 1 ? "bg-primary text-primary-foreground" : "border border-border/30"}`}>{p}</div>)}</div>
            </div>
          </div>
        </MockBrowser>

        <h3>Estructura jerárquica</h3>
        <div className="flex flex-col items-center gap-1.5 my-5 text-[10px]">
          {[
            { label: "Año Académico 2026", icon: CalendarDays, cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" },
            { label: "Grados (1° a 5° Secundaria)", icon: Layers, cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
            { label: "Secciones (A, B, C...)", icon: Layers, cls: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" },
            { label: "Estudiantes + Cursos por grado", icon: GraduationCap, cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
            { label: "Asignaciones (Docente ↔ Curso ↔ Sección)", icon: UserCheck, cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 w-full max-w-sm">
              {i > 0 && <div className="w-px h-3 bg-border/50" />}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl w-full ${item.cls}`}>
                <item.icon className="h-3.5 w-3.5 shrink-0" /><span className="font-medium">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "transicion",
    icon: ArrowRightLeft,
    title: "Transición de Año Escolar",
    desc: "Promover estudiantes y cerrar año",
    gradient: "from-primary/90 to-primary",
    content: (
      <>
        <p className="text-base leading-relaxed">Wizard de 5 pasos para promover estudiantes y preparar el siguiente año.</p>

        <h3>Wizard de transición</h3>
        <MockBrowser title="localhost:5173/year-transition">
          <div className="p-3 space-y-3">
            <MockPageHeader title="Transición de Año Escolar" />
            <div className="flex items-center justify-center gap-0 text-[8px]">
              {[
                { n: 1, label: "Resumen", done: true },
                { n: 2, label: "Nuevo Año", done: true },
                { n: 3, label: "Promover", active: true },
                { n: 4, label: "Egresar", done: false },
                { n: 5, label: "Finalizar", done: false },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center">
                  {i > 0 && <div className={`w-8 h-px ${s.done || s.active ? "bg-primary" : "bg-border/40"}`} />}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${s.done ? "bg-emerald-500 text-white" : s.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {s.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.n}
                    </div>
                    <span className={s.active ? "text-primary font-medium" : "text-muted-foreground"}>{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { grade: "1° Sec. A → 2° Sec. A", count: "32 estudiantes", status: "Pendiente" },
                { grade: "1° Sec. B → 2° Sec. B", count: "30 estudiantes", status: "Pendiente" },
                { grade: "2° Sec. A → 3° Sec. A", count: "28 estudiantes", status: "Promovidos" },
                { grade: "2° Sec. B → 3° Sec. B", count: "31 estudiantes", status: "Promovidos" },
              ].map((c) => (
                <div key={c.grade} className={`p-2.5 rounded-lg border ${c.status === "Promovidos" ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border/30 bg-muted/10"}`}>
                  <div className="text-[9px] font-medium">{c.grade}</div>
                  <div className="text-[8px] text-muted-foreground mt-0.5">{c.count}</div>
                  <MockBadge color={c.status === "Promovidos" ? "green" : "gray"}>{c.status}</MockBadge>
                </div>
              ))}
            </div>
          </div>
        </MockBrowser>

        <Tip type="danger">Verifica la vista previa antes de ejecutar cada paso. La transición se puede revertir si es necesario.</Tip>
      </>
    ),
  },
  {
    id: "configuracion",
    icon: Settings,
    title: "Configuración del Sistema",
    desc: "Logo, IA, alertas y respaldos",
    gradient: "from-primary/90 to-primary",
    content: (
      <>
        <p className="text-base leading-relaxed">Personaliza todos los aspectos del sistema.</p>

        <h3>Panel de configuración</h3>
        <MockBrowser title="localhost:5173/settings">
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold flex items-center gap-1.5"><Settings className="h-3.5 w-3.5" />Configuración del Sistema</div>
              <div className="h-6 px-2.5 rounded-md bg-primary flex items-center gap-1 text-[9px] font-medium text-primary-foreground"><Save className="h-2.5 w-2.5" />Guardar cambios</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border/30 bg-muted/10">
                <div className="text-[9px] font-semibold mb-1">Logo del colegio</div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-muted/40 border border-dashed border-border/40 flex items-center justify-center"><GraduationCap className="h-6 w-6 text-muted-foreground/30" /></div>
                  <div className="space-y-1">
                    <div className="h-5 px-2 rounded border border-border/30 flex items-center gap-1 text-[8px] text-muted-foreground"><Upload className="h-2.5 w-2.5" />Seleccionar imagen</div>
                    <div className="text-[7px] text-muted-foreground">PNG, JPG o SVG. Máx 2MB</div>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border/30 bg-muted/10">
                <div className="text-[9px] font-semibold mb-1 flex items-center gap-1"><Database className="h-3 w-3" />Copia de Seguridad</div>
                <div className="text-[8px] text-muted-foreground mb-2">Descarga una copia completa de la base de datos.</div>
                <div className="h-5 px-2 rounded border border-border/30 inline-flex items-center gap-1 text-[8px] text-muted-foreground"><Download className="h-2.5 w-2.5" />Descargar Copia</div>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border/30 bg-muted/10 space-y-2">
              <div className="text-[9px] font-semibold">Inteligencia Artificial</div>
              {[
                { label: "Proveedor de IA", value: "OpenAI (ChatGPT)" },
                { label: "Modelo de IA", value: "gpt-4o-mini" },
                { label: "API Key", value: "••••••••••••••••" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-4">
                  <span className="text-[9px] text-muted-foreground w-28 shrink-0">{s.label}</span>
                  <MockSelect value={s.value} />
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg border border-border/30 bg-muted/10 space-y-2">
              <div className="text-[9px] font-semibold">Alertas y Umbrales</div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] text-muted-foreground">Faltas consecutivas para alerta</span>
                <MockInput value="3" className="w-20" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] text-muted-foreground">% mínimo de asistencia</span>
                <MockInput value="70" className="w-20" />
              </div>
            </div>
          </div>
        </MockBrowser>

        <Tip type="info">Configura tu API Key de IA para habilitar el Chat de Análisis Inteligente.</Tip>
      </>
    ),
  },
]

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════ */

export default function DocumentationPage() {
  const { hasPermission } = useAuth()
  const [activeSection, setActiveSection] = useState(null)
  const [search, setSearch] = useState("")

  const isDirector = hasPermission("configuracion.ver")
  const allDocente = docenteSections
  const allDirector = directorSections
  const sections = isDirector ? [...allDocente, ...allDirector] : allDocente

  const filtered = search.trim()
    ? sections.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()))
    : sections

  const active = activeSection ? sections.find((s) => s.id === activeSection) : null

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r bg-muted/20 dark:bg-card/50 overflow-y-auto hidden md:flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />Documentación</h2>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-7 h-8 text-xs" />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-1.5">
          <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{isDirector ? "Uso General" : "Módulos"}</p>
          {filtered.filter((s) => allDocente.some((d) => d.id === s.id)).map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-all ${activeSection === s.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground/70"}`}>
              <s.icon className="h-3.5 w-3.5 shrink-0" />{s.title}
            </button>
          ))}
          {isDirector && (
            <>
              <p className="px-2 py-1 mt-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Administración</p>
              {filtered.filter((s) => allDirector.some((d) => d.id === s.id)).map((s) => (
                <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-all ${activeSection === s.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground/70"}`}>
                  <s.icon className="h-3.5 w-3.5 shrink-0" />{s.title}
                </button>
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-background">
        {active ? (
          <div className="max-w-3xl mx-auto px-5 py-6 md:px-8 md:py-8">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
              <button onClick={() => setActiveSection(null)} className="hover:text-foreground transition-colors">Documentación</button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{active.title}</span>
            </div>
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${active.gradient} p-6 mb-8 text-white`}>
              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm"><active.icon className="h-6 w-6" /></div>
                <div><h1 className="text-xl font-bold">{active.title}</h1><p className="text-sm opacity-90">{active.desc}</p></div>
              </div>
            </div>
            <div className="[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground/80 [&_strong]:text-foreground">
              {active.content}
            </div>
          </div>
        ) : (
          <div className="px-5 py-8 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary p-8 md:p-12 text-primary-foreground mb-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"><BookOpen className="h-6 w-6" /></div>
                  <div><h1 className="text-2xl md:text-3xl font-bold">Documentación del Sistema</h1><p className="text-sm opacity-80 mt-1">{isDirector ? "Guía completa para la administración y uso del sistema" : "Guía para el registro y seguimiento de asistencia"}</p></div>
                </div>
                <div className="relative mt-5 max-w-sm md:hidden">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary-foreground/50" />
                  <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-sm placeholder:text-primary-foreground/50 outline-none" />
                </div>
              </div>

              <div className="mb-10">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{isDirector ? "Uso General" : "Módulos del Sistema"}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.filter((s) => allDocente.some((d) => d.id === s.id)).map((s) => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)} className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 text-left hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity`} />
                      <div className="relative">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white mb-3`}><s.icon className="h-5 w-5" /></div>
                        <p className="font-semibold text-sm mb-1">{s.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                        <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Ver guía <ChevronRight className="h-3 w-3" /></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {isDirector && filtered.some((s) => allDirector.some((d) => d.id === s.id)) && (
                <div>
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Administración del Sistema</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.filter((s) => allDirector.some((d) => d.id === s.id)).map((s) => (
                      <button key={s.id} onClick={() => setActiveSection(s.id)} className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 text-left hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                        <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity`} />
                        <div className="relative">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white mb-3`}><s.icon className="h-5 w-5" /></div>
                          <p className="font-semibold text-sm mb-1">{s.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                          <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Ver guía <ChevronRight className="h-3 w-3" /></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
