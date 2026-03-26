import { useState } from "react"
import { reportsApi } from "@/api/endpoints"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DataTable from "@/components/shared/DataTable"
import useClientPagination from "@/hooks/useClientPagination"
import ReportFilters from "./ReportFilters"
import ReportSummaryCards from "./ReportSummaryCards"
import { toast } from "sonner"
import { BarChart } from "@mui/x-charts/BarChart"
import { Users, Layers, TrendingUp, ShieldAlert } from "lucide-react"

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
    key: "porcentaje_asistencia", label: "% Asistencia", sortable: true,
    render: (s) => {
      const pct = s.porcentaje_asistencia ?? 0
      return <Badge variant={pct >= 70 ? "default" : "destructive"}>{pct}%</Badge>
    },
  },
]

export default function PeriodReportTab({ periodOptions }) {
  const [filters, setFilters] = useState({ periodId: "" })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const sections = report?.sections || []
  const pag = useClientPagination(sections, 10)

  const generate = async () => {
    if (!filters.periodId) { toast.error("Seleccione un periodo"); return }
    setLoading(true)
    try {
      const res = await reportsApi.period(filters.periodId)
      setReport(res.data.data || res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al generar reporte")
    } finally {
      setLoading(false)
    }
  }

  const summary = report?.summary || {}

  const summaryCards = report ? [
    { title: "Secciones", value: sections.length, icon: Layers, color: C.primary },
    { title: "Total registros", value: summary.total_registros ?? 0, icon: Users, color: C.emerald },
    { title: "% Asistencia", value: summary.porcentaje_asistencia ?? 0, suffix: "%", icon: TrendingUp, color: C.emerald },
    { title: "Faltas Inj.", value: summary.faltas_injustificadas ?? 0, icon: ShieldAlert, color: C.red },
  ] : []

  const sortedSections = [...sections].sort((a, b) =>
    (b.porcentaje_asistencia ?? 0) - (a.porcentaje_asistencia ?? 0)
  )

  return (
    <div className="space-y-4">
      <ReportFilters
        config={{ period: true }}
        filters={filters}
        setFilters={setFilters}
        options={{ periods: periodOptions }}
        onGenerate={generate}
        loading={loading}
        exportProps={report ? { tab: "period", id: filters.periodId, params: {} } : null}
      />

      {report && (
        <>
          <ReportSummaryCards items={summaryCards} />

          {sortedSections.length > 0 && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Comparación de secciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  xAxis={[{
                    data: sortedSections.map((s) => `${s.grade} ${s.section}`),
                    scaleType: "band",
                    tickLabelStyle: { ...CHART_FONT, angle: sortedSections.length > 6 ? -45 : 0 },
                  }]}
                  yAxis={[{ min: 0, max: 100, tickLabelStyle: CHART_FONT }]}
                  series={[{
                    data: sortedSections.map((s) => s.porcentaje_asistencia ?? 0),
                    color: C.primary,
                  }]}
                  height={280}
                  borderRadius={5}
                  grid={{ horizontal: true }}
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
