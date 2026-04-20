import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { assignmentsApi, usersApi, subjectsApi, sectionsApi, academicYearsApi, gradesApi } from "@/api/endpoints"
import { useAuth } from "@/contexts/AuthContext"
import PageHeader from "@/components/shared/PageHeader"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import DataTable from "@/components/shared/DataTable"
import useClientPagination from "@/hooks/useClientPagination"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import SearchableSelect from "@/components/shared/SearchableSelect"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Search, X } from "lucide-react"
import ActionButton from "@/components/shared/ActionButton"

const initialForm = {
  user_id: "", subject_id: "", section_id: "", academic_year_id: "", status: "1",
}

export default function AssignmentsPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [gradeSubjects, setGradeSubjects] = useState(null) // null = not loaded, [] = no subjects

  // Filtros de búsqueda
  const [searchTeacher, setSearchTeacher] = useState("")
  const [filterSubject, setFilterSubject] = useState("")
  const [filterGrade, setFilterGrade] = useState("")
  const [filterSection, setFilterSection] = useState("")
  const [filterYear, setFilterYear] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: () => assignmentsApi.getAll().then((r) => r.data.data),
  })

  const { data: users } = useQuery({
    queryKey: ["users-teachers"],
    queryFn: () => usersApi.getAll({ role: "Docente", per_page: 100 }).then((r) => r.data.data),
  })
  const { data: allSubjects } = useQuery({
    queryKey: ["subjects-list"],
    queryFn: () => subjectsApi.getAll().then((r) => r.data.data),
  })
  const { data: sections } = useQuery({
    queryKey: ["sections-list"],
    queryFn: () => sectionsApi.getAll().then((r) => r.data.data),
  })
  const { data: years } = useQuery({
    queryKey: ["academic-years-list"],
    queryFn: () => academicYearsApi.getAll().then((r) => r.data.data),
  })

  const teachersList = Array.isArray(users) ? users : users?.data || []
  const subjectsList = Array.isArray(allSubjects) ? allSubjects : allSubjects?.data || []
  const sectionsList = Array.isArray(sections) ? sections : sections?.data || []
  const yearsList = Array.isArray(years) ? years : years?.data || []
  const items = Array.isArray(data) ? data : data?.data || []

  // Lista única de grados derivada de las secciones cargadas
  const gradesList = sectionsList.reduce((acc, s) => {
    if (s.grade && !acc.find((g) => g.id === s.grade.id)) acc.push(s.grade)
    return acc
  }, [])

  // Filtrado en tiempo real
  const filteredItems = items.filter((item) => {
    const teacherName = item.teacher?.name?.toLowerCase() || ""
    const subjectName = item.subject?.name?.toLowerCase() || ""
    const sectionGradeId = item.section?.grade_id ?? item.section?.grade?.id
    const sectionId = item.section_id
    const yearId = item.academic_year_id

    if (searchTeacher && !teacherName.includes(searchTeacher.toLowerCase())) return false
    if (filterSubject && String(item.subject_id) !== filterSubject) return false
    if (filterGrade && String(sectionGradeId) !== filterGrade) return false
    if (filterSection && String(sectionId) !== filterSection) return false
    if (filterYear && String(yearId) !== filterYear) return false
    return true
  })

  const hasActiveFilters = searchTeacher || filterSubject || filterGrade || filterSection || filterYear
  const clearFilters = () => {
    setSearchTeacher("")
    setFilterSubject("")
    setFilterGrade("")
    setFilterSection("")
    setFilterYear("")
  }

  // Secciones filtradas por grado seleccionado en los filtros
  const sectionsForFilter = filterGrade
    ? sectionsList.filter((s) => String(s.grade_id ?? s.grade?.id) === filterGrade)
    : sectionsList

  // When section changes in the form, load grade subjects
  useEffect(() => {
    if (!form.section_id) {
      setGradeSubjects(null)
      return
    }
    const section = sectionsList.find((s) => String(s.id) === String(form.section_id))
    if (!section?.grade_id) {
      setGradeSubjects(null)
      return
    }
    gradesApi.getSubjects(section.grade_id).then((res) => {
      const subs = res.data.data
      setGradeSubjects(subs.length > 0 ? subs : null)
    }).catch(() => setGradeSubjects(null))
  }, [form.section_id, sectionsList])

  // Filtered subjects: grade subjects if available, otherwise all
  const filteredSubjects = gradeSubjects
    ? subjectsList.filter((s) => gradeSubjects.some((gs) => gs.id === s.id))
    : subjectsList

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? assignmentsApi.update(editing.id, payload) : assignmentsApi.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Asignación actualizada" : "Asignación creada")
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] })
      setFormOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al guardar"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => assignmentsApi.delete(id),
    onSuccess: () => {
      toast.success("Asignación eliminada")
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] })
      setDeleteOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al eliminar"),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setGradeSubjects(null)
    setFormOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      user_id: String(item.user_id || ""),
      subject_id: String(item.subject_id || ""),
      section_id: String(item.section_id || ""),
      academic_year_id: String(item.academic_year_id || ""),
      status: String(item.status ? "1" : "0"),
    })
    setFormOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  const handleSectionChange = (v) => {
    setForm({ ...form, section_id: v, subject_id: "" })
  }

  const columns = [
    {
      key: "user_id", label: "Docente",
      render: (item) => item.teacher?.name || "-",
    },
    {
      key: "subject_id", label: "Materia",
      render: (item) => item.subject?.name || "-",
    },
    {
      key: "section_id", label: "Sección",
      render: (item) => item.section?.full_name || item.section?.name || "-",
    },
    {
      key: "academic_year_id", label: "Año",
      render: (item) => item.academic_year?.name || "-",
    },
    {
      key: "status", label: "Estado",
      render: (item) => (
        <Badge variant={item.status ? "default" : "outline"}>
          {item.status ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const hasActions =
    hasPermission("asignaciones.editar") || hasPermission("asignaciones.eliminar")

  const { data: paginatedData, pagination, onPageChange, onPerPageChange, sortKey, sortDirection, onSortChange } =
    useClientPagination(filteredItems, 10)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Asignaciones Docentes"
        action={hasPermission("asignaciones.crear") ? "Nuevo" : null}
        onAction={openCreate}
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar docente..."
            value={searchTeacher}
            onChange={(e) => setSearchTeacher(e.target.value)}
            className="pl-9"
          />
        </div>
        <SearchableSelect
          value={filterGrade || "all"}
          onValueChange={(v) => { setFilterGrade(v === "all" ? "" : v); setFilterSection("") }}
          options={[
            { value: "all", label: "Todos los grados" },
            ...gradesList.map((g) => ({ value: String(g.id), label: g.name })),
          ]}
          placeholder="Todos los grados"
          className="w-44"
        />
        <SearchableSelect
          value={filterSection || "all"}
          onValueChange={(v) => setFilterSection(v === "all" ? "" : v)}
          options={[
            { value: "all", label: "Todas las secciones" },
            ...sectionsForFilter.map((s) => ({
              value: String(s.id),
              label: s.full_name || `${s.grade?.name || ""} "${s.name}"`,
            })),
          ]}
          placeholder="Todas las secciones"
          className="w-52"
        />
        <SearchableSelect
          value={filterSubject || "all"}
          onValueChange={(v) => setFilterSubject(v === "all" ? "" : v)}
          options={[
            { value: "all", label: "Todas las materias" },
            ...subjectsList.map((s) => ({ value: String(s.id), label: s.name })),
          ]}
          placeholder="Todas las materias"
          className="w-52"
        />
        <SearchableSelect
          value={filterYear || "all"}
          onValueChange={(v) => setFilterYear(v === "all" ? "" : v)}
          options={[
            { value: "all", label: "Todos los años" },
            ...yearsList.map((y) => ({ value: String(y.id), label: y.name })),
          ]}
          placeholder="Todos los años"
          className="w-36"
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
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
        actions={
          hasActions
            ? (item) => (
                <>
                  {hasPermission("asignaciones.editar") && (
                    <ActionButton preset="edit" icon={Pencil} onClick={() => openEdit(item)} />
                  )}
                  {hasPermission("asignaciones.eliminar") && (
                    <ActionButton preset="delete" icon={Trash2} onClick={() => { setSelectedId(item.id); setDeleteOpen(true) }} />
                  )}
                </>
              )
            : undefined
        }
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar asignación" : "Nueva asignación"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Docente</Label>
              <SearchableSelect
                value={form.user_id}
                onValueChange={(v) => setForm({ ...form, user_id: v })}
                options={teachersList.map((t) => ({ value: String(t.id), label: t.name }))}
                placeholder="Seleccionar docente"
              />
            </div>
            <div className="space-y-2">
              <Label>Sección</Label>
              <SearchableSelect
                value={form.section_id}
                onValueChange={handleSectionChange}
                options={sectionsList.map((s) => ({
                  value: String(s.id),
                  label: s.full_name || `${s.grade?.name || ""} - ${s.name}`,
                }))}
                placeholder="Seleccionar sección"
              />
            </div>
            <div className="space-y-2">
              <Label>Materia {gradeSubjects && <span className="text-xs text-muted-foreground">(filtrado por grado)</span>}</Label>
              <SearchableSelect
                value={form.subject_id}
                onValueChange={(v) => setForm({ ...form, subject_id: v })}
                options={filteredSubjects.map((s) => ({ value: String(s.id), label: s.name }))}
                placeholder={form.section_id ? "Seleccionar materia" : "Primero seleccione una sección"}
              />
            </div>
            <div className="space-y-2">
              <Label>Año Académico</Label>
              <SearchableSelect
                value={form.academic_year_id}
                onValueChange={(v) => setForm({ ...form, academic_year_id: v })}
                options={yearsList.map((y) => ({ value: String(y.id), label: y.name }))}
                placeholder="Seleccionar año académico"
              />
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

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar asignación"
        description="¿Está seguro de eliminar esta asignación? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(selectedId)}
      />
    </div>
  )
}
