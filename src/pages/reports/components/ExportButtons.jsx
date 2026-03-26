import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { reportsApi } from "@/api/endpoints"
import { toast } from "sonner"
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react"

export default function ExportButtons({ tab, id, params = {}, disabled }) {
  const { hasPermission } = useAuth()
  const [exporting, setExporting] = useState(null)

  if (!hasPermission("reportes.exportar")) return null

  const handleExport = async (format) => {
    setExporting(format)
    try {
      const exportParams = { ...params }
      const res = format === "excel"
        ? await reportsApi.exportExcel(tab, id || null, exportParams)
        : await reportsApi.exportPdf(tab, id || null, exportParams)

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `reporte-${tab}${id ? `-${id}` : ""}.${format === "excel" ? "xlsx" : "pdf"}`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Exportado como ${format.toUpperCase()}`)
    } catch {
      toast.error("Error al exportar")
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("excel")}
        disabled={disabled || !!exporting}
      >
        {exporting === "excel" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-1 h-4 w-4" />}
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("pdf")}
        disabled={disabled || !!exporting}
      >
        {exporting === "pdf" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileText className="mr-1 h-4 w-4" />}
        PDF
      </Button>
    </div>
  )
}
