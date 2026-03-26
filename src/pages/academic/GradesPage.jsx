import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { gradesApi, subjectsApi } from "@/api/endpoints"
import { useAuth } from "@/contexts/AuthContext"
import PageHeader from "@/components/shared/PageHeader"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import DataTable from "@/components/shared/DataTable"
import useClientPagination from "@/hooks/useClientPagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import SearchableSelect from "@/components/shared/SearchableSelect"
import { toast } from "sonner"
import { Pencil, Trash2, BookOpen, Loader2 } from "lucide-react"
import ActionButton from "@/components/shared/ActionButton"

const initialForm = {
  name: "", level: "secundaria", order: "", status: "1",
}

export default function GradesPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(initialForm)

  // Subjects dialog state
  const [subjectsOpen, setSubjectsOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["grades"],
    queryFn: () => gradesApi.getAll().then((r) => r.data.data),
  })

  const { data: allSubjects } = useQuery({
    queryKey: ["subjects-list"],
    queryFn: () => subjectsApi.getAll().then((r) => r.data.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? gradesApi.update(editing.id, payload) : gradesApi.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Grado actualizado" : "Grado creado")
      queryClient.invalidateQueries({ queryKey: ["grades"] })
      setFormOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al guardar"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => gradesApi.delete(id),
    onSuccess: () => {
      toast.success("Grado eliminado")
      queryClient.invalidateQueries({ queryKey: ["grades"] })
      setDeleteOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al eliminar"),
  })

  const items = Array.isArray(data) ? data : data?.data || []
  const subjectsList = Array.isArray(allSubjects) ? allSubjects : allSubjects?.data || []

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setFormOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name || "",
      level: item.level || "secundaria",
      order: String(item.order || ""),
      status: String(item.status ? "1" : "0"),
    })
    setFormOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  const openSubjectsDialog = async (grade) => {
    setSelectedGrade(grade)
    setSubjectsLoading(true)
    setSubjectsOpen(true)
    try {
      const res = await gradesApi.getSubjects(grade.id)
      const gradeSubjects = res.data.data
      setSelectedSubjectIds(gradeSubjects.map((s) => s.id))
    } catch {
      toast.error("Error al cargar materias del grado")
      setSelectedSubjectIds([])
    } finally {
      setSubjectsLoading(false)
    }
  }

  const toggleSubject = (subjectId) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleSaveSubjects = async () => {
    setSubjectsLoading(true)
    try {
      await gradesApi.syncSubjects(selectedGrade.id, { subject_ids: selectedSubjectIds })
      toast.success(`Materias de ${selectedGrade.name} actualizadas`)
      queryClient.invalidateQueries({ queryKey: ["grades"] })
      setSubjectsOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al guardar materias")
    } finally {
      setSubjectsLoading(false)
    }
  }

  const columns = [
    { key: "name", label: "Nombre", primary: true },
    { key: "level", label: "Nivel" },
    { key: "order", label: "Orden", hideOnMobile: true },
    {
      key: "sections_count", label: "Secciones",
      render: (item) => item.sections_count ?? item.sections?.length ?? "-",
    },
    {
      key: "subjects_count", label: "Materias",
      render: (item) => item.subjects_count ?? "-",
    },
    { key: "status", label: "Estado" },
  ]

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
    hasPermission("grados.editar") || hasPermission("grados.eliminar")

  const { data: paginatedData, pagination, onPageChange, onPerPageChange, sortKey, sortDirection, onSortChange } =
    useClientPagination(items, 10)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Grados"
        action={hasPermission("grados.crear") ? "Nuevo" : null}
        onAction={openCreate}
      />

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
                  {hasPermission("grados.editar") && (
                    <ActionButton preset="edit" icon={BookOpen} tooltip="Materias" onClick={() => openSubjectsDialog(item)} />
                  )}
                  {hasPermission("grados.editar") && (
                    <ActionButton preset="edit" icon={Pencil} onClick={() => openEdit(item)} />
                  )}
                  {hasPermission("grados.eliminar") && (
                    <ActionButton preset="delete" icon={Trash2} onClick={() => { setSelectedId(item.id); setDeleteOpen(true) }} />
                  )}
                </>
              )
            : undefined
        }
      />

      {/* Form Dialog - CRUD Grado */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar grado" : "Nuevo grado"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ej: 1° Secundaria" />
            </div>
            <div className="space-y-2">
              <Label>Nivel</Label>
              <SearchableSelect
                value={form.level}
                onValueChange={(v) => setForm({ ...form, level: v })}
                options={[
                  { value: "primaria", label: "Primaria" },
                  { value: "secundaria", label: "Secundaria" },
                ]}
                placeholder="Seleccionar nivel"
              />
            </div>
            <div className="space-y-2">
              <Label>Orden</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} required placeholder="Ej: 1" />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Activo</SelectItem>
                  <SelectItem value="0">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subjects Dialog */}
      <Dialog open={subjectsOpen} onOpenChange={setSubjectsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Materias de {selectedGrade?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {subjectsLoading && !subjectsList.length ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : subjectsList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay materias registradas.</p>
            ) : (
              subjectsList.map((subject) => (
                <label key={subject.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={selectedSubjectIds.includes(subject.id)}
                    onCheckedChange={() => toggleSubject(subject.id)}
                  />
                  <div>
                    <span className="text-sm font-medium">{subject.name}</span>
                    {subject.code && <span className="text-xs text-muted-foreground ml-2">({subject.code})</span>}
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedSubjectIds.length} materia(s) seleccionada(s)
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubjectsOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveSubjects} disabled={subjectsLoading}>
              {subjectsLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
              ) : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar grado"
        description="¿Está seguro de eliminar este grado? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(selectedId)}
      />
    </div>
  )
}
