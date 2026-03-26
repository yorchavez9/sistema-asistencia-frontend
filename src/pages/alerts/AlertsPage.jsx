import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { alertsApi } from "@/api/endpoints"
import { formatDate } from "@/lib/formatDate"
import { useAuth } from "@/contexts/AuthContext"
import PageHeader from "@/components/shared/PageHeader"
import DataTable from "@/components/shared/DataTable"
import useClientPagination from "@/hooks/useClientPagination"
import SearchableSelect from "@/components/shared/SearchableSelect"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Bell, CheckCircle, Eye, Trash2 } from "lucide-react"
import ActionButton from "@/components/shared/ActionButton"

const ALERT_TYPE_LABELS = {
  frecuencia: "Frecuencia",
  consecutiva: "Consecutiva",
  porcentaje: "Porcentaje",
  limite_alcanzado: "Límite alcanzado",
  riesgo_desercion: "Riesgo de deserción",
}

const ALERT_TYPE_COLORS = {
  frecuencia: "destructive",
  consecutiva: "secondary",
  porcentaje: "outline",
  limite_alcanzado: "destructive",
  riesgo_desercion: "destructive",
}

export default function AlertsPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const [alertType, setAlertType] = useState("")
  const [readFilter, setReadFilter] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["alerts", alertType, readFilter],
    queryFn: () =>
      alertsApi.getAll({
        alert_type: alertType || undefined,
        is_read: readFilter || undefined,
      }).then((r) => r.data.data),
  })

  const { data: countData } = useQuery({
    queryKey: ["alerts-unresolved-count"],
    queryFn: () => alertsApi.unresolvedCount().then((r) => r.data),
  })

  const markReadMutation = useMutation({
    mutationFn: (id) => alertsApi.markAsRead(id),
    onSuccess: () => {
      toast.success("Marcada como leída")
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
      queryClient.invalidateQueries({ queryKey: ["alerts-unresolved-count"] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => alertsApi.markAllAsRead(),
    onSuccess: () => {
      toast.success("Todas marcadas como leídas")
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
      queryClient.invalidateQueries({ queryKey: ["alerts-unresolved-count"] })
    },
  })

  const resolveMutation = useMutation({
    mutationFn: (id) => alertsApi.resolve(id),
    onSuccess: () => {
      toast.success("Alerta resuelta")
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
      queryClient.invalidateQueries({ queryKey: ["alerts-unresolved-count"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => alertsApi.delete(id),
    onSuccess: () => {
      toast.success("Alerta eliminada")
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
    },
  })

  const alerts = Array.isArray(data) ? data : data?.data || []
  const unresolvedCount = countData?.data?.count ?? countData?.count ?? 0

  const columns = [
    {
      key: "student", label: "Estudiante", primary: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {r.student?.full_name || `${r.student?.last_name}, ${r.student?.first_name}`}
          </span>
          {!r.is_read && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
      ),
    },
    {
      key: "alert_type", label: "Tipo",
      render: (r) => (
        <Badge variant={ALERT_TYPE_COLORS[r.alert_type] || "secondary"}>
          {ALERT_TYPE_LABELS[r.alert_type] || r.alert_type}
        </Badge>
      ),
    },
    {
      key: "message", label: "Mensaje",
      render: (r) => <span className="text-sm text-muted-foreground line-clamp-1">{r.message}</span>,
    },
    {
      key: "created_at", label: "Fecha",
      render: (r) => formatDate(r.created_at),
    },
    {
      key: "resolved", label: "Estado",
      render: (r) => (
        <Badge variant={r.resolved ? "default" : "outline"}>
          {r.resolved ? "Resuelta" : "Pendiente"}
        </Badge>
      ),
    },
  ]

  const { data: paginatedData, pagination, onPageChange, onPerPageChange, sortKey, sortDirection, onSortChange } =
    useClientPagination(alerts, 10)

  const hasActions = hasPermission("alertas.gestionar") || hasPermission("alertas.eliminar")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Alertas de Inasistencia"
          icon={Bell}
        />
        <div className="flex gap-2 items-center">
          {unresolvedCount > 0 && (
            <Badge variant="destructive">{unresolvedCount} sin resolver</Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="w-48">
          <SearchableSelect
            value={alertType}
            onValueChange={(v) => setAlertType(v === "all" ? "" : v)}
            options={[
              { value: "all", label: "Todos los tipos" },
              ...Object.entries(ALERT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
            ]}
            placeholder="Tipo de alerta"
          />
        </div>
        <div className="w-48">
          <SearchableSelect
            value={readFilter}
            onValueChange={(v) => setReadFilter(v === "all" ? "" : v)}
            options={[
              { value: "all", label: "Todas" },
              { value: "0", label: "No leídas" },
              { value: "1", label: "Leídas" },
            ]}
            placeholder="Estado lectura"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        pagination={pagination}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        loading={isLoading}
        emptyMessage="No hay alertas"
        actions={
          hasActions
            ? (alert) => (
                <>
                  {!alert.is_read && (
                    <ActionButton preset="view" icon={Eye} onClick={() => markReadMutation.mutate(alert.id)} title="Marcar leída" />
                  )}
                  {!alert.resolved && hasPermission("alertas.gestionar") && (
                    <ActionButton preset="resolve" icon={CheckCircle} onClick={() => resolveMutation.mutate(alert.id)} title="Resolver" />
                  )}
                  {hasPermission("alertas.eliminar") && (
                    <ActionButton preset="delete" icon={Trash2} onClick={() => deleteMutation.mutate(alert.id)} />
                  )}
                </>
              )
            : undefined
        }
      />
    </div>
  )
}
