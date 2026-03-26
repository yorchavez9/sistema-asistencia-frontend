import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { reportsApi, studentsApi } from "@/api/endpoints"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DataTable from "@/components/shared/DataTable"
import useClientPagination from "@/hooks/useClientPagination"
import ReportFilters from "./ReportFilters"
import ReportSummaryCards from "./ReportSummaryCards"
import { toast } from "sonner"
import { BarChart } from "@mui/x-charts/BarChart"
import { LineChart } from "@mui/x-charts/LineChart"
import { useXScale, useYScale } from "@mui/x-charts/hooks"
import { Users, CheckCircle, Clock, ShieldAlert, XCircle, TrendingUp } from "lucide-react"

import { C, CHART_FONT, CHART_SX, chartSx } from "@/lib/chartTheme"
import { formatDate } from "@/lib/formatDate"

const STATUS_MAP = {
  puntual: { label: "Presente", variant: "default" },
  tardanza: { label: "Tardanza", variant: "secondary" },
  falta_justificada: { label: "F. Justificada", variant: "outline" },
  falta_injustificada: { label: "F. Injustificada", variant: "destructive" },
}

const columns = [
  { key: "date", label: "Fecha", primary: true, sortable: true, render: (r) => formatDate(r.date || r.fecha) },
  { key: "subject", label: "Materia", hideOnMobile: true, render: (r) => r.subject || r.materia || "-" },
  {
    key: "status", label: "Estado",
    render: (r) => {
      const s = STATUS_MAP[r.status || r.estado] || { label: r.status || r.estado || "-", variant: "secondary" }
      return <Badge variant={s.variant}>{s.label}</Badge>
    },
  },
  { key: "observation", label: "Observación", hideOnMobile: true, render: (r) => r.observation || r.observacion || "-" },
]


function LineDataLabels({ xLabels, data, color }) {
  const xScale = useXScale()
  const yScale = useYScale()

  return (
    <g>
      {data.map((value, idx) => {
        const x = xScale(xLabels[idx])
        const y = yScale(value)
        if (x == null || y == null) return null
        return (
          <text
            key={idx}
            x={x}
            y={y - 10}
            textAnchor="middle"
            fontSize={12}
            fontWeight={600}
            fill={color}
          >
            {Number(value).toFixed(1)}%
          </text>
        )
      })}
    </g>
  )
}

export default function StudentReportTab({ sectionOptions }) {
  const [filters, setFilters] = useState({ sectionId: "", studentId: "", startDate: "", endDate: "" })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const { data: students } = useQuery({
    queryKey: ["section-students", filters.sectionId],
    queryFn: () => studentsApi.getBySection(filters.sectionId).then((r) => {
      const d = r.data.data || r.data
      return (Array.isArray(d) ? d : d?.students || []).map((s) => ({
        value: String(s.id),
        label: `${s.last_name || ""} ${s.first_name || s.name || ""}`.trim(),
      }))
    }),
    enabled: !!filters.sectionId,
  })

  const details = report?.detail || report?.details || []
  const pag = useClientPagination(details, 10)

  const generate = async () => {
    if (!filters.studentId) { toast.error("Seleccione un estudiante"); return }
    setLoading(true)
    try {
      const params = {}
      if (filters.startDate) params.start_date = filters.startDate
      if (filters.endDate) params.end_date = filters.endDate
      const res = await reportsApi.student(filters.studentId, params)
      setReport(res.data.data || res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al generar reporte")
    } finally {
      setLoading(false)
    }
  }

  const summary = report?.summary || {}
  // by_subject is an object { "Materia": { summary } }, convert to array
  const bySubjectRaw = report?.by_subject || {}
  const bySubject = Object.entries(bySubjectRaw).map(([name, data]) => ({ subject: name, ...data }))
  // by_month is an object { "2026-03": { summary } }, convert to array
  const byMonthRaw = report?.by_month || {}
  const trend = Object.entries(byMonthRaw).map(([month, data]) => ({ month, ...data }))

  const summaryCards = report ? [
    { title: "Total clases", value: summary.total_registros ?? 0, icon: Users, color: C.primary },
    { title: "Asistencias", value: summary.presentes ?? 0, icon: CheckCircle, color: C.emerald },
    { title: "Tardanzas", value: summary.tardanzas ?? 0, icon: Clock, color: C.amber },
    { title: "F. Justificadas", value: summary.faltas_justificadas ?? 0, icon: ShieldAlert, color: C.blue },
    { title: "F. Injustificadas", value: summary.faltas_injustificadas ?? 0, icon: XCircle, color: C.red },
    { title: "% Asistencia", value: summary.porcentaje_asistencia ?? 0, suffix: "%", icon: TrendingUp, color: C.emerald },
  ] : []

  const exportParams = {}
  if (filters.startDate) exportParams.start_date = filters.startDate
  if (filters.endDate) exportParams.end_date = filters.endDate

  return (
    <div className="space-y-4">
      <ReportFilters
        config={{ section: true, student: true, startDate: true, endDate: true }}
        filters={filters}
        setFilters={setFilters}
        options={{ sections: sectionOptions, students: students || [] }}
        onGenerate={generate}
        loading={loading}
        exportProps={report ? { tab: "student", id: filters.studentId, params: exportParams } : null}
      />

      {report && (
        <>
          <ReportSummaryCards items={summaryCards} />

          {bySubject.length > 0 && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Asistencia por materia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  yAxis={[{
                    data: bySubject.map((s) => s.subject || ""),
                    scaleType: "band",
                    tickLabelStyle: CHART_FONT,
                  }]}
                  xAxis={[{ tickLabelStyle: CHART_FONT }]}
                  series={[
                    { data: bySubject.map((s) => s.presentes ?? 0), label: "Presentes", color: C.emerald, stack: "a" },
                    { data: bySubject.map((s) => s.tardanzas ?? 0), label: "Tardanzas", color: C.amber, stack: "a" },
                    { data: bySubject.map((s) => s.faltas_justificadas ?? 0), label: "F. Just.", color: C.blue, stack: "a" },
                    { data: bySubject.map((s) => s.faltas_injustificadas ?? 0), label: "F. Inj.", color: C.red, stack: "a" },
                  ]}
                  layout="horizontal"
                  height={Math.max(220, bySubject.length * 40)}
                  borderRadius={4}
                  grid={{ vertical: true }}
                  sx={CHART_SX}
                />
              </CardContent>
            </Card>
          )}

          {trend.length > 0 && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tendencia mensual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  xAxis={[{
                    data: trend.map((t) => t.month || ""),
                    scaleType: "point",
                    tickLabelStyle: CHART_FONT,
                  }]}
                  yAxis={[{ min: 0, max: 100, tickLabelStyle: CHART_FONT, valueFormatter: (v) => `${v}%` }]}
                  series={[{
                    data: trend.map((t) => t.porcentaje_asistencia ?? 0),
                    color: C.primary,
                    area: true,
                    curve: "catmullRom",
                    showMark: true,
                    valueFormatter: (v) => `${Number(v).toFixed(1)}%`,
                  }]}
                  height={280}
                  grid={{ horizontal: true }}
                  slotProps={{ legend: { hidden: true } }}
                  sx={chartSx({
                    "& .MuiAreaElement-root": { fillOpacity: 0.08 },
                    "& .MuiLineElement-root": { strokeWidth: 2.5 },
                    "& .MuiMarkElement-root": { strokeWidth: 2 },
                  })}
                >
                  <LineDataLabels
                    xLabels={trend.map((t) => t.month || "")}
                    data={trend.map((t) => t.porcentaje_asistencia ?? 0)}
                    color={C.primary}
                  />
                </LineChart>
              </CardContent>
            </Card>
          )}

          <DataTable
            columns={columns}
            data={pag.data}
            pagination={pag.pagination}
            onPageChange={pag.onPageChange}
            onPerPageChange={pag.onPerPageChange}
            sortKey={pag.sortKey}
            sortDirection={pag.sortDirection}
            onSortChange={pag.onSortChange}
            emptyMessage="No hay registros de asistencia"
          />
        </>
      )}
    </div>
  )
}
