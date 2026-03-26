import { useState, useMemo } from "react"
import { reportsApi } from "@/api/endpoints"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DataTable from "@/components/shared/DataTable"
import useClientPagination from "@/hooks/useClientPagination"
import ReportFilters from "./ReportFilters"
import ReportSummaryCards from "./ReportSummaryCards"
import { toast } from "sonner"
import { PieChart } from "@mui/x-charts/PieChart"
import { ShieldAlert, AlertTriangle, AlertOctagon } from "lucide-react"

import { C, CHART_SX } from "@/lib/chartTheme"

const columns = [
  {
    key: "full_name", label: "Estudiante", primary: true, sortable: true,
    render: (s) => <span className="font-medium">{s.full_name || "-"}</span>,
  },
  {
    key: "section", label: "Sección", hideOnMobile: true, sortable: true,
    render: (s) => `${s.grade || ""} ${s.section || ""}`.trim() || "-",
  },
  { key: "faltas_injustificadas", label: "F. Inj.", sortable: true },
  {
    key: "porcentaje_asistencia", label: "% Asist.", sortable: true,
    render: (s) => {
      const pct = s.porcentaje_asistencia ?? 0
      return <Badge variant={pct >= 70 ? "default" : "destructive"}>{pct}%</Badge>
    },
  },
  {
    key: "nivel_riesgo", label: "Nivel",
    render: (s) => {
      const level = s.nivel_riesgo || ""
      return (
        <Badge variant={level === "critico" ? "destructive" : "secondary"}>
          {level === "critico" ? "CRITICO" : "ALERTA"}
        </Badge>
      )
    },
  },
]

export default function RiskReportTab({ teacherSectionIds, canViewAll, subjectOptions, periodOptions, periodsData }) {
  const [filters, setFilters] = useState({ subjectId: "", periodId: "", startDate: "", endDate: "" })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.startDate) params.start_date = filters.startDate
      if (filters.endDate) params.end_date = filters.endDate
      if (filters.subjectId) params.subject_id = filters.subjectId
      const res = await reportsApi.risk(params)
      setReport(res.data.data || res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al generar reporte")
    } finally {
      setLoading(false)
    }
  }

  const allStudents = report?.students || []

  // Docente: filter client-side by their sections
  const students = useMemo(() => {
    if (canViewAll || !teacherSectionIds?.length) return allStudents
    return allStudents.filter((s) => teacherSectionIds.includes(s.section_id))
  }, [allStudents, canViewAll, teacherSectionIds])

  const pag = useClientPagination(students, 10)

  const summary = report?.summary || {}
  const totalRisk = canViewAll ? (report?.total_en_riesgo ?? students.length) : students.length
  const critical = canViewAll
    ? (report?.criticos ?? 0)
    : students.filter((s) => s.nivel_riesgo === "critico").length
  const alert = totalRisk - critical

  const summaryCards = report ? [
    { title: "Total en riesgo", value: totalRisk, icon: ShieldAlert, color: C.red },
    { title: "Crítico", value: critical, icon: AlertOctagon, color: C.red },
    { title: "Alerta", value: alert, icon: AlertTriangle, color: C.amber },
  ] : []

  const pieData = report ? [
    { id: 0, value: critical, label: "Crítico", color: C.red },
    { id: 1, value: alert, label: "Alerta", color: C.amber },
  ].filter((d) => d.value > 0) : []

  const exportParams = {}
  if (filters.startDate) exportParams.start_date = filters.startDate
  if (filters.endDate) exportParams.end_date = filters.endDate
  if (filters.subjectId) exportParams.subject_id = filters.subjectId

  return (
    <div className="space-y-4">
      <ReportFilters
        config={{ subject: true, period: true, startDate: true, endDate: true }}
        filters={filters}
        setFilters={setFilters}
        options={{ subjects: subjectOptions, periods: periodOptions, periodsData }}
        onGenerate={generate}
        loading={loading}
        exportProps={report ? { tab: "risk", params: exportParams } : null}
      />

      {report && (
        <>
          <ReportSummaryCards items={summaryCards} />

          {pieData.length > 0 && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Distribución por nivel de riesgo
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

          <DataTable
            columns={columns}
            data={pag.data}
            pagination={pag.pagination}
            onPageChange={pag.onPageChange}
            onPerPageChange={pag.onPerPageChange}
            sortKey={pag.sortKey}
            sortDirection={pag.sortDirection}
            onSortChange={pag.onSortChange}
            emptyMessage="No hay estudiantes en riesgo"
          />
        </>
      )}
    </div>
  )
}
