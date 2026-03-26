import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import PageHeader from "./PageHeader"
import ConfirmDialog from "./ConfirmDialog"
import DataTable from "./DataTable"
import useClientPagination from "@/hooks/useClientPagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import SearchableSelect from "./SearchableSelect"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import ActionButton from "./ActionButton"

/**
 * Componente CRUD genérico reutilizable.
 *
 * @param {object} props
 * @param {string} props.title - Título de la página
 * @param {string} props.queryKey - Key para react-query
 * @param {object} props.api - Objeto con métodos getAll, create, update, delete
 * @param {Array} props.columns - [{key, label, render?, primary?, hideOnMobile?}]
 * @param {Array} props.fields - [{name, label, type?, options?, required?}]
 * @param {object} props.permissions - {view, create, edit, delete}
 * @param {object} props.queryParams - Parámetros extra para getAll
 * @param {Function} props.filterComponent - Componente de filtros opcional
 */
export default function CrudPage({
  title,
  queryKey,
  api,
  columns = [],
  fields = [],
  permissions = {},
  queryParams = {},
  filterComponent: FilterComponent,
}) {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({})
  const [filters, setFilters] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, filters],
    queryFn: () => api.getAll({ ...queryParams, ...filters }).then((r) => r.data.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? api.update(editing.id, payload) : api.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Registro actualizado" : "Registro creado")
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      setFormOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al guardar"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(id),
    onSuccess: () => {
      toast.success("Registro eliminado")
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      setDeleteOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al eliminar"),
  })

  const openCreate = () => {
    setEditing(null)
    const initial = {}
    fields.forEach((f) => (initial[f.name] = f.defaultValue ?? ""))
    setForm(initial)
    setFormOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    const initial = {}
    fields.forEach((f) => (initial[f.name] = item[f.name] ?? ""))
    setForm(initial)
    setFormOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  const items = Array.isArray(data) ? data : data?.data || []

  // Enrich columns with status badge default render
  const enrichedColumns = columns.map((col) => {
    if (col.key === "status" && !col.render) {
      return {
        ...col,
        render: (item) => (
          <Badge variant={item.status ? "default" : "outline"}>
            {item.status ? "Activo" : "Inactivo"}
          </Badge>
        ),
      }
    }
    return col
  })

  const hasActions =
    (permissions.edit && hasPermission(permissions.edit)) ||
    (permissions.delete && hasPermission(permissions.delete))

  const { data: paginatedData, pagination, onPageChange, onPerPageChange, sortKey, sortDirection, onSortChange } =
    useClientPagination(items, 10)

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        action={permissions.create && hasPermission(permissions.create) ? "Nuevo" : null}
        onAction={openCreate}
      />

      {FilterComponent && <FilterComponent filters={filters} setFilters={setFilters} />}

      <DataTable
        columns={enrichedColumns}
        data={paginatedData}
        pagination={pagination}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        loading={isLoading}
        actions={
          hasActions
            ? (item) => (
                <>
                  {permissions.edit && hasPermission(permissions.edit) && (
                    <ActionButton preset="edit" icon={Pencil} onClick={() => openEdit(item)} />
                  )}
                  {permissions.delete && hasPermission(permissions.delete) && (
                    <ActionButton preset="delete" icon={Trash2} onClick={() => { setSelectedId(item.id); setDeleteOpen(true) }} />
                  )}
                </>
              )
            : undefined
        }
      />

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar registro" : "Nuevo registro"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>{field.label}</Label>
                {field.type === "select" ? (
                  field.searchable ? (
                    <SearchableSelect
                      value={String(form[field.name] || "")}
                      onValueChange={(v) => setForm({ ...form, [field.name]: v })}
                      options={(field.options || []).map((o) => ({ value: String(o.value), label: o.label }))}
                      placeholder={`Seleccionar ${field.label.toLowerCase()}`}
                    />
                  ) : (
                    <Select
                      value={String(form[field.name] || "")}
                      onValueChange={(v) => setForm({ ...form, [field.name]: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Seleccionar ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options || []).map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                ) : field.type === "textarea" ? (
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md bg-muted/50 px-3 py-2 text-sm"
                    value={form[field.name] || ""}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <Input
                    type={field.type || "text"}
                    value={form[field.name] || ""}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar registro"
        description="¿Está seguro de eliminar este registro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(selectedId)}
      />
    </div>
  )
}
