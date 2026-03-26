import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import SearchableSelect from "@/components/shared/SearchableSelect"
import ExportButtons from "./ExportButtons"
import { Play, Loader2, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ReportFilters({
  config = {},
  filters,
  setFilters,
  options = {},
  onGenerate,
  loading,
  exportProps,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const set = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }))

  const filterCount = [
    config.section && filters.sectionId,
    config.student && filters.studentId,
    config.subject && filters.subjectId,
    config.period && filters.periodId,
    config.startDate && filters.startDate,
    config.endDate && filters.endDate,
  ].filter(Boolean).length

  const handlePeriodChange = (v) => {
    set("periodId", v)
    if (v && options.periodsData) {
      const period = options.periodsData.find((p) => String(p.id) === v)
      if (period) {
        setFilters((prev) => ({
          ...prev,
          periodId: v,
          startDate: period.start_date,
          endDate: period.end_date,
        }))
        return
      }
    }
    if (!v) {
      setFilters((prev) => ({ ...prev, periodId: "", startDate: "", endDate: "" }))
    }
  }

  return (
    <Card className="overflow-visible">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors rounded-t-xl"
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {filterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {filterCount}
            </span>
          )}
        </span>
        {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
      </button>

      {!collapsed && (
        <CardContent className="pt-0 pb-4 border-t border-dashed">
          <div className="grid gap-x-3 gap-y-3 pt-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-end">
            {config.section && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Sección</label>
                <SearchableSelect
                  value={filters.sectionId || ""}
                  onValueChange={(v) => {
                    set("sectionId", v)
                    if (config.student) set("studentId", "")
                  }}
                  options={options.sections || []}
                  placeholder="Seleccionar sección"
                />
              </div>
            )}

            {config.student && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Estudiante</label>
                <SearchableSelect
                  value={filters.studentId || ""}
                  onValueChange={(v) => set("studentId", v)}
                  options={options.students || []}
                  placeholder={filters.sectionId ? "Seleccionar estudiante" : "Primero seleccione sección"}
                />
              </div>
            )}

            {config.subject && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Curso</label>
                <SearchableSelect
                  value={filters.subjectId || ""}
                  onValueChange={(v) => set("subjectId", v)}
                  options={options.subjects || []}
                  placeholder="Todos los cursos"
                />
              </div>
            )}

            {config.period && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Periodo</label>
                <SearchableSelect
                  value={filters.periodId || ""}
                  onValueChange={handlePeriodChange}
                  options={options.periods || []}
                  placeholder="Seleccionar periodo"
                />
              </div>
            )}

            {config.startDate && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Desde</label>
                <DatePicker
                  value={filters.startDate || ""}
                  onChange={(v) => set("startDate", v)}
                  maxDate={filters.endDate || undefined}
                />
              </div>
            )}

            {config.endDate && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Hasta</label>
                <DatePicker
                  value={filters.endDate || ""}
                  onChange={(v) => set("endDate", v)}
                  minDate={filters.startDate || undefined}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-dashed">
            <Button onClick={onGenerate} disabled={loading} size="sm">
              {loading
                ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generando...</>
                : <><Play className="mr-1.5 h-3.5 w-3.5" /> Generar reporte</>
              }
            </Button>
            {exportProps && <ExportButtons {...exportProps} disabled={loading || exportProps.disabled} />}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
