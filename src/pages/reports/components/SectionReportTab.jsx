import { useState } from "react"
import { reportsApi } from "@/api/endpoints"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DataTable from "@/components/shared/DataTable"
import useClientPagination from "@/hooks/useClientPagination"
import ReportFilters from "./ReportFilters"
import ReportSummaryCards from "./ReportSummaryCards"
import { toast } from "sonner"
import { PieChart } from "@mui/x-charts/PieChart"
import { BarChart } from "@mui/x-charts/BarChart"
import { Users, TrendingUp, Clock, XCircle } from "lucide-react"

import { C, CHART_FONT, CHART_SX, chartSx } from "@/lib/chartTheme"

const columns = [
  {
    key: "full_name", label: "Estudiante", primary: true, sortable: true,
    render: (s) => <span className="font-medium">{s.full_name || "-"}</span>,
  },
  { key: "presentes", label: "Asistencias", sortable: true },
  { key: "tardanzas", label: "Tardanzas", hideOnMobile: true, sortable: true },
  { key: "faltas_justificadas", label: "F. Just.", hideOnMobile: true },
  { key: "faltas_injustificadas", label: "F. Inj.", hideOnMobile: true },
  {
    key: "porcentaje_asistencia", label: "% Asist.", sortable: true,
    render: (s) => {
      const pct = s.porcentaje_asistencia ?? 0
      return <Badge variant={pct >= 70 ? "default" : "destructive"}>{pct}%</Badge>
    },
  },
]

export default function SectionReportTab({ sectionOptions, subjectOptions, periodOptions, periodsData }) {
  const [filters, setFilters] = useState({ sectionId: "", subjectId: "", periodId: "", startDate: "", endDate: "" })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const students = report?.students || []
  const pag = useClientPagination(students, 10)

  const generate = async () => {
    if (!filters.sectionId) { toast.error("Seleccione una sección"); return }
    setLoading(true)
    try {
      const params = {}
      if (filters.startDate) params.start_date = filters.startDate
      if (filters.endDate) params.end_date = filters.endDate
      if (filters.subjectId) params.subject_id = filters.subjectId
      const res = await reportsApi.section(filters.sectionId, params)
      setReport(res.data.data || res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al generar reporte")
    } finally {
      setLoading(false)
    }
  }

  const summary = report?.summary || {}

  const summaryCards = report ? [
    { title: "Total estudiantes", value: report.total_students || students.length, icon: Users, color: C.primary },
    { title: "% Asistencia", value: summary.porcentaje_asistencia ?? 0, suffix: "%", icon: TrendingUp, color: C.emerald },
    { title: "Tardanzas", value: summary.tardanzas ?? 0, icon: Clock, color: C.amber },
    { title: "Faltas", value: summary.total_faltas ?? 0, icon: XCircle, color: C.red },
  ] : []

  const pieData = report ? [
    { id: 0, value: summary.presentes ?? 0, label: "Presentes", color: C.emerald },
    { id: 1, value: summary.tardanzas ?? 0, label: "Tardanzas", color: C.amber },
    { id: 2, value: summary.faltas_justificadas ?? 0, label: "F. Just.", color: C.blue },
    { id: 3, value: summary.faltas_injustificadas ?? 0, label: "F. Inj.", color: C.red },
  ].filter((d) => d.value > 0) : []

  const sortedByPct = [...students].sort((a, b) => (a.porcentaje_asistencia ?? 0) - (b.porcentaje_asistencia ?? 0))
  const top10 = sortedByPct.slice(0, 10)

  const exportParams = {}
  if (filters.startDate) exportParams.start_date = filters.startDate
  if (filters.endDate) exportParams.end_date = filters.endDate
  if (filters.subjectId) exportParams.subject_id = filters.subjectId

  return (
    <div className="space-y-4">
      <ReportFilters
        config={{ section: true, subject: true, period: true, startDate: true, endDate: true }}
        filters={filters}
        setFilters={setFilters}
        options={{ sections: sectionOptions, subjects: subjectOptions, periods: periodOptions, periodsData }}
        onGenerate={generate}
        loading={loading}
        exportProps={report ? { tab: "section", id: filters.sectionId, params: exportParams } : null}
      />

      {report && (
        <>
          <ReportSummaryCards items={summaryCards} />

          <div className="grid gap-3 lg:grid-cols-2">
            {pieData.length > 0 && (
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Distribución de asistencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <PieChart
                    series={[{
                      data: pieData,
                      highlightScope: { fade: "global", highlight: "item" },
                      innerRadius: 50,
                      outerRadius: 85,
                      paddingAngle: 3,
                      cornerRadius: 5,
                    }]}
                    slotProps={{
                      legend: { direction: "column", position: { vertical: "middle", horizontal: "right" } },
                    }}
                    height={220}
                    sx={CHART_SX}
                  />
                </CardContent>
              </Card>
            )}

            {top10.length > 0 && (
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estudiantes por % asistencia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    yAxis={[{
                      data: top10.map((s) => {
                        const name = s.full_name || ""
                        return name.length > 18 ? name.substring(0, 18) + "…" : name
                      }),
                      scaleType: "band",
                      tickLabelStyle: CHART_FONT,
                    }]}
                    xAxis={[{ min: 0, max: 100, tickLabelStyle: CHART_FONT }]}
                    series={[{
                      data: top10.map((s) => s.porcentaje_asistencia ?? 0),
                      color: C.primary,
                    }]}
                    layout="horizontal"
                    height={Math.max(220, top10.length * 32)}
                    borderRadius={4}
                    grid={{ vertical: true }}
                    slotProps={{ legend: { hidden: true } }}
                    sx={CHART_SX}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <DataTable
            columns={columns}
            data={pag.data}
            pagination={pag.pagination}
            onPageChange={pag.onPageChange}
            onPerPageChange={pag.onPerPageChange}
            sortKey={pag.sortKey}
            sortDirection={pag.sortDirection}
            onSortChange={pag.onSortChange}
            emptyMessage="No hay datos de estudiantes"
          />
        </>
      )}
    </div>
  )
}
