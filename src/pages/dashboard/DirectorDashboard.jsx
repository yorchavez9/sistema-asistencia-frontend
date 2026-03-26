import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/api/endpoints"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, TrendingUp, Bell, CheckCircle, ShieldAlert, Activity } from "lucide-react"
import { BarChart } from "@mui/x-charts/BarChart"
import { LineChart } from "@mui/x-charts/LineChart"
import { PieChart } from "@mui/x-charts/PieChart"

import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge"
import { SparkLineChart } from "@mui/x-charts/SparkLineChart"

import { C, CHART_FONT, CHART_SX, chartSx } from "@/lib/chartTheme"
import { formatTime } from "@/lib/formatDate"

// Animated number counter
function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const target = typeof value === "number" ? value : parseFloat(value) || 0
    if (target === 0) { setDisplay(0); return }
    const duration = 800
    const start = performance.now()
    const from = 0
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setDisplay(Math.round(from + (target - from) * eased))
      if (progress < 1) ref.current = requestAnimationFrame(step)
    }
    ref.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(ref.current)
  }, [value])

  return <>{display}{suffix}</>
}

// Live pulse indicator
function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  )
}

function StatCard({ title, value, suffix, description, icon: Icon, color, sparkData }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-3 pb-2 relative">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.04]" style={{ backgroundColor: color, transform: "translate(30%, -30%)" }} />
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-xl font-bold mt-1 tracking-tight">
              <AnimatedNumber value={typeof value === "string" ? parseFloat(value) : value} suffix={suffix || ""} />
            </p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}12` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            {sparkData && sparkData.length > 2 && (
              <SparkLineChart
                data={sparkData}
                height={28}
                width={56}
                colors={[color]}
                curve="natural"
                area
                sx={chartSx({ "& .MuiAreaElement-root": { fillOpacity: 0.12 } })}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


export default function DirectorDashboard() {
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["dashboard-director"],
    queryFn: () => dashboardApi.director().then((r) => r.data.data),
    refetchInterval: 60000, // auto-refresh every 60s
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72 lg:col-span-2" />
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  const detalle = data?.today?.detalle || {}
  const trendData = data?.trend_30_days || []
  const ranking = data?.section_ranking || []
  const pct = data?.today?.porcentaje_asistencia || 0
  const totalRegs = data?.today?.total_registros || 0

  const last7 = trendData.slice(-7).map((d) => d.porcentaje ?? 0)
  const trendDates = trendData.map((d) => {
    if (!d.date) return ""
    const date = new Date(d.date)
    if (isNaN(date.getTime())) return d.date.substring(5, 10)
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`
  })
  const trendPct = trendData.map((d) => d.porcentaje ?? 0)

  const pieData = [
    { id: 0, value: detalle.presentes || 0, label: "Presentes", color: C.emerald },
    { id: 1, value: detalle.tardanzas || 0, label: "Tardanzas", color: C.amber },
    { id: 2, value: detalle.faltas_justificadas || 0, label: "F. Justificadas", color: C.blue },
    { id: 3, value: detalle.faltas_injustificadas || 0, label: "F. Injustificadas", color: C.red },
  ].filter((d) => d.value > 0)

  const topSections = ranking.slice(0, 10)

  const detailItems = [
    { label: "Presentes", val: detalle.presentes || 0, color: C.emerald },
    { label: "Tardanzas", val: detalle.tardanzas || 0, color: C.amber },
    { label: "F. Just.", val: detalle.faltas_justificadas || 0, color: C.blue },
    { label: "F. Injust.", val: detalle.faltas_injustificadas || 0, color: C.red },
  ]

  return (
    <div className="space-y-5">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Inicio</h1>
          <p className="text-xs text-muted-foreground">
            {data?.academic_year} {data?.period && `· ${data.period}`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LiveDot />
          <span>Actualizado {lastUpdate}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Estudiantes" value={data?.total_students || 0} description="Matriculados activos" icon={Users} color={C.primary} />
        <StatCard title="Asistencia Hoy" value={pct} suffix="%" description={`${totalRegs} registros`} icon={CheckCircle} color={C.emerald} sparkData={last7} />
        <StatCard title="En Riesgo" value={data?.risk?.students_at_risk || 0} description="Alertas activas" icon={ShieldAlert} color={C.amber} />
        <StatCard title="Alertas" value={data?.risk?.unread_alerts || 0} description={`${data?.risk?.unresolved_alerts || 0} sin resolver`} icon={Bell} color={C.rose} />
      </div>

      {/* Gauge + Detail + Pie */}
      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resumen Hoy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-center">
              <Gauge
                value={pct}
                startAngle={-110}
                endAngle={110}
                width={170}
                height={130}
                sx={{
                  [`& .${gaugeClasses.valueText} text`]: { fontSize: 28, fontWeight: "bold", fontFamily: "inherit", fill: "var(--color-muted-foreground) !important" },
                  [`& .${gaugeClasses.valueArc}`]: { fill: pct >= 90 ? C.emerald : pct >= 70 ? C.amber : C.red },
                  [`& .${gaugeClasses.referenceArc}`]: { fill: "var(--color-muted)" },
                }}
                text={({ value }) => `${value}%`}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {detailItems.map((item) => (
                <div key={item.label} className="rounded-lg p-2 text-center" style={{ backgroundColor: `${item.color}08` }}>
                  <p className="text-lg font-bold" style={{ color: item.color }}>
                    <AnimatedNumber value={item.val} />
                  </p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Distribución</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {pieData.length > 0 ? (
              <PieChart
                series={[{
                  data: pieData,
                  highlightScope: { fade: "global", highlight: "item" },
                  innerRadius: 55,
                  outerRadius: 90,
                  paddingAngle: 3,
                  cornerRadius: 5,
                }]}
                slotProps={{
                  legend: { direction: "column", position: { vertical: "middle", horizontal: "right" } },
                }}
                height={230}
                sx={CHART_SX}
              />
            ) : (
              <p className="text-xs text-muted-foreground py-8">Sin registros hoy</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  Porcentaje de asistencia - Últimos 30 días
                </CardTitle>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  Evolución diaria del porcentaje de asistencia general de la institución
                </p>
              </div>
              <div className="flex items-center gap-3">
                {trendPct.length >= 2 && (() => {
                  const diff = trendPct[trendPct.length - 1] - trendPct[trendPct.length - 2]
                  const up = diff >= 0
                  return (
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-red-500"}`}>
                      {up ? "+" : ""}{diff.toFixed(1)}% vs ayer
                    </span>
                  )
                })()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <LineChart
              xAxis={[{
                data: trendDates,
                scaleType: "point",
                tickLabelStyle: CHART_FONT,
                tickInterval: (_, i) => i % 3 === 0,
              }]}
              yAxis={[{ min: 0, max: 100, tickLabelStyle: CHART_FONT, valueFormatter: (v) => `${v}%` }]}
              series={[{
                data: trendPct,
                color: C.primary,
                area: true,
                curve: "catmullRom",
                showMark: ({ index }) => index === trendPct.length - 1,
                valueFormatter: (v) => `${v.toFixed(1)}%`,
                label: "Asistencia",
              }]}
              height={260}
              grid={{ horizontal: true }}
              slotProps={{ legend: { hidden: true } }}
              sx={chartSx({
                "& .MuiAreaElement-root": { fillOpacity: 0.08 },
                "& .MuiLineElement-root": { strokeWidth: 2.5 },
              })}
            />
          </CardContent>
        </Card>
      )}

      {/* Ranking + Scatter */}
      {ranking.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ranking de secciones por asistencia</CardTitle>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                Top {topSections.length} secciones ordenadas por porcentaje de asistencia general
              </p>
            </CardHeader>
            <CardContent>
              <BarChart
                yAxis={[{
                  data: topSections.map((s) => `${s.grade} ${s.section}`),
                  scaleType: "band",
                  tickLabelStyle: CHART_FONT,
                }]}
                xAxis={[{ min: 0, max: 100, tickLabelStyle: CHART_FONT, valueFormatter: (v) => `${v}%` }]}
                series={[{
                  data: topSections.map((s) => s.porcentaje_general),
                  color: C.primary,
                  valueFormatter: (v) => `${v.toFixed(1)}%`,
                  label: "Asistencia",
                }]}
                layout="horizontal"
                height={Math.max(240, topSections.length * 36)}
                borderRadius={4}
                grid={{ vertical: true }}
                slotProps={{ legend: { hidden: true } }}
                sx={CHART_SX}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Secciones en riesgo</CardTitle>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                Secciones con menor porcentaje de asistencia general
              </p>
            </CardHeader>
            <CardContent>
              {ranking.length > 0 ? (() => {
                const worst = [...ranking].sort((a, b) => a.porcentaje_general - b.porcentaje_general).slice(0, 5)
                return (
                  <div className="space-y-3">
                    {worst.map((s, i) => {
                      const pctVal = s.porcentaje_general || 0
                      const barColor = pctVal >= 90 ? C.emerald : pctVal >= 70 ? C.amber : C.red
                      return (
                        <div key={s.section_id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{s.grade} {s.section}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">{s.total_students} alumnos</span>
                              <span className="text-xs font-bold" style={{ color: barColor }}>{pctVal}%</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pctVal}%`, backgroundColor: barColor }} />
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: C.red }} />Crítico (&lt;70%)</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: C.amber }} />Alerta (70-89%)</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: C.emerald }} />Normal (90%+)</span>
                    </div>
                  </div>
                )
              })() : (
                <p className="text-xs text-muted-foreground py-8 text-center">Sin datos</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section detail grid */}
      {ranking.length > 0 && (
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Detalle por Sección</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ranking.map((s, i) => {
                const barColor = s.porcentaje_general >= 90 ? C.emerald : s.porcentaje_general >= 70 ? C.amber : C.red
                return (
                  <div key={s.section_id} className="flex items-center gap-2.5 rounded-lg bg-muted/40 dark:bg-card p-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium truncate">{s.grade} {s.section}</span>
                        <span className="text-xs font-bold" style={{ color: barColor }}>{s.porcentaje_general}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.porcentaje_general}%`, backgroundColor: barColor }} />
                        </div>
                        <span className="text-[9px] text-muted-foreground">{s.total_students}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
