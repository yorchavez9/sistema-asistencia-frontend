import { useState } from "react"
import { reportsApi } from "@/api/endpoints"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DataTable from "@/components/shared/DataTable"
import useClientPagination from "@/hooks/useClientPagination"
import ReportFilters from "./ReportFilters"
import ReportSummaryCards from "./ReportSummaryCards"
import { toast } from "sonner"
import { LineChart } from "@mui/x-charts/LineChart"
import { BarChart } from "@mui/x-charts/BarChart"
import { Users, Layers, TrendingUp, CheckCircle, XCircle } from "lucide-react"

import { C, CHART_FONT, CHART_SX, chartSx } from "@/lib/chartTheme"

const columns = [
  {
    key: "section_name", label: "Sección", primary: true, sortable: true,
    render: (s) => <span className="font-medium">{s.grade} {s.section}</span>,
  },
  { key: "total_students", label: "Estudiantes", sortable: true },
  { key: "presentes", label: "Presentes", hideOnMobile: true },
  { key: "tardanzas", label: "Tardanzas", hideOnMobile: true },
  { key: "faltas_injustificadas", label: "F. Inj.", hideOnMobile: true },
  {
    key: "porcentaje_asistencia", label: "% Asist.", sortable: true,
    render: (s) => {
      const pct = s.porcentaje_asistencia ?? 0
      return <Badge variant={pct >= 70 ? "default" : "destructive"}>{pct}%</Badge>
    },
  },
]

export default function InstitutionalReportTab() {
  const [filters, setFilters] = useState({ startDate: "", endDate: "" })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const sections = report?.sections || []
  const pag = useClientPagination(sections, 10)

  const generate = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.startDate) params.start_date = filters.startDate
      if (filters.endDate) params.end_date = filters.endDate
      const res = await reportsApi.institutional(params)
      setReport(res.data.data || res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al generar reporte")
    } finally {
      setLoading(false)
    }
  }

  const summary = report?.summary || {}
  const trend = report?.daily_trend || report?.tendencia_diaria || []

  const summaryCards = report ? [
    { title: "Estudiantes", value: report.total_students ?? 0, icon: Users, color: C.primary },
    { title: "Secciones", value: sections.length, icon: Layers, color: C.blue },
    { title: "% Asistencia", value: summary.porcentaje_asistencia ?? 0, suffix: "%", icon: TrendingUp, color: C.emerald },
    { title: "Presentes", value: summary.presentes ?? 0, icon: CheckCircle, color: C.emerald },
    { title: "Faltas", value: summary.total_faltas ?? 0, icon: XCircle, color: C.red },
  ] : []

  const ranking = [...sections].sort((a, b) =>
    (b.porcentaje_asistencia ?? 0) - (a.porcentaje_asistencia ?? 0)
  ).slice(0, 10)

  const exportParams = {}
  if (filters.startDate) exportParams.start_date = filters.startDate
  if (filters.endDate) exportParams.end_date = filters.endDate

  return (
    <div className="space-y-4">
      <ReportFilters
        config={{ startDate: true, endDate: true }}
        filters={filters}
        setFilters={setFilters}
        onGenerate={generate}
        loading={loading}
        exportProps={report ? { tab: "institutional", params: exportParams } : null}
      />

      {report && (
        <>
          <ReportSummaryCards items={summaryCards} />

          {trend.length > 0 && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tendencia diaria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  xAxis={[{
                    data: trend.map((t) => t.date?.substring(5) || ""),
                    scaleType: "point",
                    tickLabelStyle: CHART_FONT,
                    tickInterval: (_, i) => i % Math.max(1, Math.floor(trend.length / 10)) === 0,
                  }]}
                  yAxis={[{ min: 0, max: 100, tickLabelStyle: CHART_FONT }]}
                  series={[{
                    data: trend.map((t) => t.porcentaje_asistencia ?? 0),
                    color: C.primary,
                    area: true,
                    curve: "catmullRom",
                  }]}
                  height={280}
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

          {ranking.length > 0 && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ranking de secciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  yAxis={[{
                    data: ranking.map((s) => `${s.grade} ${s.section}`),
                    scaleType: "band",
                    tickLabelStyle: CHART_FONT,
                  }]}
                  xAxis={[{ min: 0, max: 100, tickLabelStyle: CHART_FONT }]}
                  series={[{
                    data: ranking.map((s) => s.porcentaje_asistencia ?? 0),
                    color: C.primary,
                  }]}
                  layout="horizontal"
                  height={Math.max(240, ranking.length * 36)}
                  borderRadius={4}
                  grid={{ vertical: true }}
                  slotProps={{ legend: { hidden: true } }}
                  sx={CHART_SX}
                />
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
            emptyMessage="No hay datos de secciones"
          />
        </>
      )}
    </div>
  )
}
