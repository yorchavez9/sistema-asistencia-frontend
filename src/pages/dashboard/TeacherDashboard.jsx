import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/api/endpoints"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"
import { ClipboardCheck, Clock, AlertTriangle, CheckCircle, BookOpen } from "lucide-react"
import { PieChart } from "@mui/x-charts/PieChart"
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge"
import { BarChart } from "@mui/x-charts/BarChart"

import { C, CHART_FONT, CHART_SX, chartSx } from "@/lib/chartTheme"
import { formatTime } from "@/lib/formatDate"

function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const target = typeof value === "number" ? value : parseFloat(value) || 0
    if (target === 0) { setDisplay(0); return }
    const duration = 800
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target))
      if (progress < 1) ref.current = requestAnimationFrame(step)
    }
    ref.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(ref.current)
  }, [value])

  return <>{display}{suffix}</>
}

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  )
}


export default function TeacherDashboard() {
  const navigate = useNavigate()

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["dashboard-teacher"],
    queryFn: () => dashboardApi.teacher().then((r) => r.data.data),
    refetchInterval: 60000,
  })

  const [lastUpdate, setLastUpdate] = useState("")
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdate(formatTime(new Date(dataUpdatedAt)))
    }
  }, [dataUpdatedAt])

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-56" />
      </div>
    )
  }

  const courses = data?.today?.courses || []
  const attendancePct = data?.general?.porcentaje_asistencia || 0
  const totalCourses = data?.today?.total_courses || 0
  const registeredCourses = data?.today?.registered_courses || 0
  const pendingCourses = data?.today?.pending_courses || 0

  const todaySummary = courses.reduce(
    (acc, c) => {
      if (c.today_summary) {
        acc.presentes += c.today_summary.presentes || 0
        acc.tardanzas += c.today_summary.tardanzas || 0
        acc.faltas += c.today_summary.faltas || 0
      }
      return acc
    },
    { presentes: 0, tardanzas: 0, faltas: 0 }
  )

  const pieData = [
    { id: 0, value: todaySummary.presentes, label: "Presentes", color: C.emerald },
    { id: 1, value: todaySummary.tardanzas, label: "Tardanzas", color: C.amber },
    { id: 2, value: todaySummary.faltas, label: "Faltas", color: C.red },
  ].filter((d) => d.value > 0)

  const courseNames = courses.map((c) => (c.subject?.length > 10 ? c.subject.substring(0, 10) + "…" : c.subject) || "Curso")
  const courseStudents = courses.map((c) => c.total_students || 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Hola, {data?.teacher}</h1>
          <p className="text-xs text-muted-foreground">{data?.academic_year} · {data?.today?.date}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LiveDot />
          <span>Actualizado {lastUpdate}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="overflow-hidden">
          <CardContent className="pt-3 pb-2 relative">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.04]" style={{ backgroundColor: C.primary, transform: "translate(30%, -30%)" }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cursos hoy</p>
                <p className="text-xl font-bold mt-1"><AnimatedNumber value={totalCourses} /></p>
                <p className="text-xs text-muted-foreground mt-1">{registeredCourses} registrados · {pendingCourses} pendientes</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${C.primary}12` }}>
                <BookOpen className="h-5 w-5" style={{ color: C.primary }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="pt-3 pb-2 relative">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.04]" style={{ backgroundColor: C.emerald, transform: "translate(30%, -30%)" }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">% Asistencia</p>
                <p className="text-xl font-bold mt-1"><AnimatedNumber value={attendancePct} suffix="%" /></p>
                <p className="text-xs text-muted-foreground mt-1">{data?.general?.total_students || 0} estudiantes</p>
              </div>
              <Gauge
                value={attendancePct}
                startAngle={-110}
                endAngle={110}
                width={72}
                height={56}
                sx={{
                  [`& .${gaugeClasses.valueText}`]: { display: "none" },
                  [`& .${gaugeClasses.valueArc}`]: { fill: attendancePct >= 90 ? C.emerald : attendancePct >= 70 ? C.amber : C.red },
                  [`& .${gaugeClasses.referenceArc}`]: { fill: "var(--color-muted)" },
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="pt-3 pb-2 relative">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.04]" style={{ backgroundColor: C.amber, transform: "translate(30%, -30%)" }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alertas</p>
                <p className="text-xl font-bold mt-1"><AnimatedNumber value={data?.alerts?.count || 0} /></p>
                <p className="text-xs text-muted-foreground mt-1">Sin leer</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${C.amber}12` }}>
                <AlertTriangle className="h-5 w-5" style={{ color: C.amber }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      {(pieData.length > 0 || courses.length > 1) && (
        <div className="grid gap-3 lg:grid-cols-2">
          {pieData.length > 0 && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resumen Hoy</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <PieChart
                  series={[{
                    data: pieData,
                    highlightScope: { fade: "global", highlight: "item" },
                    innerRadius: 40,
                    outerRadius: 80,
                    paddingAngle: 3,
                    cornerRadius: 4,
                  }]}
                  slotProps={{
                    legend: { direction: "column", position: { vertical: "middle", horizontal: "right" } },
                  }}
                  height={190}
                  sx={CHART_SX}
                />
              </CardContent>
            </Card>
          )}

          {courses.length > 1 && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estudiantes por Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  xAxis={[{ data: courseNames, scaleType: "band", tickLabelStyle: CHART_FONT }]}
                  series={[{ data: courseStudents, color: C.primary }]}
                  height={190}
                  borderRadius={5}
                  grid={{ horizontal: true }}
                  slotProps={{ legend: { hidden: true } }}
                  sx={CHART_SX}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Courses list */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Mis cursos de hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {courses.map((course) => (
              <div
                key={course.assignment_id}
                className="flex items-center justify-between rounded-lg bg-muted/40 dark:bg-card p-3"
              >
                <div>
                  <p className="text-sm font-medium">{course.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.grade} {course.section} · {course.total_students} estudiantes
                  </p>
                  {course.today_summary && (
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-[10px] font-medium text-emerald-600">{course.today_summary.presentes}P</span>
                      <span className="text-[10px] font-medium text-amber-600">{course.today_summary.tardanzas}T</span>
                      <span className="text-[10px] font-medium text-red-500">{course.today_summary.faltas}F</span>
                    </div>
                  )}
                </div>
                {course.registered_today ? (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px]">
                    <CheckCircle className="mr-1 h-3 w-3" /> Registrado
                  </Badge>
                ) : (
                  <Button size="sm" className="text-xs h-7" onClick={() => navigate(`/attendance?assignment=${course.assignment_id}`)}>
                    <Clock className="mr-1 h-3 w-3" /> Registrar
                  </Button>
                )}
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No tienes cursos asignados hoy</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent alerts */}
      {data?.alerts?.recent?.length > 0 && (
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Alertas recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.recent.map((alert) => (
                <div key={alert.id} className="flex items-start gap-2.5 rounded-lg bg-muted/40 dark:bg-card p-2.5 text-xs">
                  <Badge
                    variant={alert.alert_type === "riesgo_desercion" ? "destructive" : "secondary"}
                    className="text-[10px] whitespace-nowrap"
                  >
                    {alert.alert_type.replace("_", " ")}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs">{alert.student_name}</p>
                    <p className="text-muted-foreground text-[11px] truncate">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
