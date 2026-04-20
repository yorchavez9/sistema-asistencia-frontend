import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { assignmentsApi, usersApi, subjectsApi, sectionsApi, academicYearsApi, gradesApi } from "@/api/endpoints"
import { useAuth } from "@/contexts/AuthContext"
import PageHeader from "@/components/shared/PageHeader"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import DataTable from "@/components/shared/DataTable"
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
import SearchableSelect from "@/components/shared/SearchableSelect"
import { toast } from "sonner"
import {
  Pencil, Trash2, Search, X, Upload, FileDown, FileSpreadsheet,
  AlertCircle, CheckCircle2, Loader2, Plus, Layers,
} from "lucide-react"
import ActionButton from "@/components/shared/ActionButton"

const initialForm = {
  user_id: "", subject_id: "", section_id: "", academic_year_id: "", status: "1",
}

// One row in the bulk form
const emptyRow = () => ({ id: Date.now() + Math.random(), section_id: "", subject_id: "" })

export default function AssignmentsPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()

  // Single-form state
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [gradeSubjects, setGradeSubjects] = useState(null)

  // Filter state
  const [searchTeacher, setSearchTeacher] = useState("")
  const [filterSubject, setFilterSubject] = useState("")
  const [filterGrade, setFilterGrade] = useState("")
  const [filterSection, setFilterSection] = useState("")
  const [filterYear, setFilterYear] = useState("")

  // Import Excel state
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importResult, setImportResult] = useState(null)

  // Bulk form state
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkTeacher, setBulkTeacher] = useState("")
  const [bulkYear, setBulkYear] = useState("")
  const [bulkRows, setBulkRows] = useState([emptyRow()])
  const [bulkResult, setBulkResult] = useState(null)

  // ── Data queries ──────────────────────────────────────────────────────────
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

  const teachersList  = Array.isArray(users)       ? users       : users?.data       || []
  const subjectsList  = Array.isArray(allSubjects)  ? allSubjects : allSubjects?.data || []
  const sectionsList  = Array.isArray(sections)     ? sections    : sections?.data    || []
  const yearsList     = Array.isArray(years)        ? years       : years?.data       || []
  const items         = Array.isArray(data)         ? data        : data?.data        || []

  // Derived grade list from sections
  const gradesList = sectionsList.reduce((acc, s) => {
    if (s.grade && !acc.find((g) => g.id === s.grade.id)) acc.push(s.grade)
    return acc
  }, [])

  // ── Single form: load subjects by grade when section changes ──────────────
  useEffect(() => {
    if (!form.section_id) { setGradeSubjects(null); return }
    const section = sectionsList.find((s) => String(s.id) === String(form.section_id))
    if (!section?.grade_id) { setGradeSubjects(null); return }
    gradesApi.getSubjects(section.grade_id).then((res) => {
      const subs = res.data.data
      setGradeSubjects(subs.length > 0 ? subs : null)
    }).catch(() => setGradeSubjects(null))
  }, [form.section_id, sectionsList])

  const filteredSubjects = gradeSubjects
    ? subjectsList.filter((s) => gradeSubjects.some((gs) => gs.id === s.id))
    : subjectsList

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredItems = items.filter((item) => {
    const teacherName   = item.teacher?.name?.toLowerCase() || ""
    const sectionGradeId = item.section?.grade_id ?? item.section?.grade?.id
    if (searchTeacher  && !teacherName.includes(searchTeacher.toLowerCase())) return false
    if (filterSubject  && String(item.subject_id)  !== filterSubject)         return false
    if (filterGrade    && String(sectionGradeId)   !== filterGrade)           return false
    if (filterSection  && String(item.section_id)  !== filterSection)         return false
    if (filterYear     && String(item.academic_year_id) !== filterYear)       return false
    return true
  })

  const hasActiveFilters = searchTeacher || filterSubject || filterGrade || filterSection || filterYear
  const clearFilters = () => {
    setSearchTeacher(""); setFilterSubject("")
    setFilterGrade("");   setFilterSection(""); setFilterYear("")
  }

  const sectionsForFilter = filterGrade
    ? sectionsList.filter((s) => String(s.grade_id ?? s.grade?.id) === filterGrade)
    : sectionsList

  // ── Mutations ─────────────────────────────────────────────────────────────
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

  const importMutation = useMutation({
    mutationFn: (formData) => assignmentsApi.import(formData),
    onSuccess: (res) => {
      const result = res.data.data
      setImportResult(result)
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] })
      if (result.imported > 0) toast.success(`${result.imported} asignaciones importadas`)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al importar"),
  })

  const bulkMutation = useMutation({
    mutationFn: (assignments) => assignmentsApi.bulkStore(assignments),
    onSuccess: (res) => {
      const result = res.data.data
      setBulkResult(result)
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] })
      if (result.created > 0) toast.success(`${result.created} asignaciones creadas`)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al guardar"),
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null); setForm(initialForm); setGradeSubjects(null); setFormOpen(true)
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
  const handleSubmit = (e) => { e.preventDefault(); saveMutation.mutate(form) }
  const handleSectionChange = (v) => setForm({ ...form, section_id: v, subject_id: "" })

  // Import handlers
  const handleImport = () => {
    if (!importFile) return
    const fd = new FormData(); fd.append("file", importFile)
    importMutation.mutate(fd)
  }
  const handleDownloadTemplate = async () => {
    try {
      const res = await assignmentsApi.downloadTemplate()
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href = url
      a.download = "plantilla_asignaciones.xlsx"; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error("Error al descargar la plantilla") }
  }
  const closeImport = () => { setImportOpen(false); setImportFile(null); setImportResult(null) }

  // Bulk form handlers
  const openBulk = () => {
    setBulkTeacher(""); setBulkYear(""); setBulkRows([emptyRow()]); setBulkResult(null); setBulkOpen(true)
  }
  const closeBulk = () => { setBulkOpen(false); setBulkResult(null) }
  const addBulkRow = () => setBulkRows((r) => [...r, emptyRow()])
  const removeBulkRow = (id) => setBulkRows((r) => r.filter((row) => row.id !== id))
  const updateBulkRow = (id, field, value) =>
    setBulkRows((r) => r.map((row) => row.id === id ? { ...row, [field]: value } : row))

  const handleBulkSubmit = () => {
    if (!bulkTeacher || !bulkYear) { toast.error("Seleccione docente y año académico"); return }
    const incomplete = bulkRows.some((r) => !r.section_id || !r.subject_id)
    if (incomplete) { toast.error("Complete todas las filas o elimine las vacías"); return }

    const assignments = bulkRows.map((r) => ({
      user_id: bulkTeacher,
      subject_id: r.subject_id,
      section_id: r.section_id,
      academic_year_id: bulkYear,
    }))
    bulkMutation.mutate(assignments)
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    { key: "user_id",          label: "Docente",  render: (i) => i.teacher?.name || "-" },
    { key: "subject_id",       label: "Materia",  render: (i) => i.subject?.name || "-" },
    { key: "section_id",       label: "Sección",  render: (i) => i.section?.full_name || i.section?.name || "-" },
    { key: "academic_year_id", label: "Año",      render: (i) => i.academic_year?.name || "-" },
    {
      key: "status", label: "Estado",
      render: (i) => (
        <Badge variant={i.status ? "default" : "outline"}>
          {i.status ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const hasActions = hasPermission("asignaciones.editar") || hasPermission("asignaciones.eliminar")

  const { data: paginatedData, pagination, onPageChange, onPerPageChange, sortKey, sortDirection, onSortChange } =
    useClientPagination(filteredItems, 10)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Asignaciones Docentes"
        action={hasPermission("asignaciones.crear") ? "Nueva" : null}
        onAction={openCreate}
        extra={hasPermission("asignaciones.crear") && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={openBulk}>
              <Layers className="h-4 w-4 mr-2" />
              Asignación múltiple
            </Button>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Excel
            </Button>
          </div>
        )}
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
          options={[{ value: "all", label: "Todos los grados" }, ...gradesList.map((g) => ({ value: String(g.id), label: g.name }))]}
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
          options={[{ value: "all", label: "Todas las materias" }, ...subjectsList.map((s) => ({ value: String(s.id), label: s.name }))]}
          placeholder="Todas las materias"
          className="w-52"
        />
        <SearchableSelect
          value={filterYear || "all"}
          onValueChange={(v) => setFilterYear(v === "all" ? "" : v)}
          options={[{ value: "all", label: "Todos los años" }, ...yearsList.map((y) => ({ value: String(y.id), label: y.name }))]}
          placeholder="Todos los años"
          className="w-36"
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />Limpiar
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

      {/* ── Single form dialog ────────────────────────────────────────────── */}
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

      {/* ── Bulk form dialog ──────────────────────────────────────────────── */}
      <Dialog open={bulkOpen} onOpenChange={closeBulk}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Asignación múltiple por docente
            </DialogTitle>
          </DialogHeader>

          {!bulkResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Docente</Label>
                  <SearchableSelect
                    value={bulkTeacher}
                    onValueChange={setBulkTeacher}
                    options={teachersList.map((t) => ({ value: String(t.id), label: t.name }))}
                    placeholder="Seleccionar docente"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Año Académico</Label>
                  <SearchableSelect
                    value={bulkYear}
                    onValueChange={setBulkYear}
                    options={yearsList.map((y) => ({ value: String(y.id), label: y.name }))}
                    placeholder="Seleccionar año"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Asignaciones ({bulkRows.length})</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addBulkRow}>
                    <Plus className="h-4 w-4 mr-1" />Agregar fila
                  </Button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {bulkRows.map((row, idx) => (
                    <div key={row.id} className="flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">{idx + 1}</span>
                      <div className="flex-1">
                        <SearchableSelect
                          value={row.section_id}
                          onValueChange={(v) => updateBulkRow(row.id, "section_id", v)}
                          options={sectionsList.map((s) => ({
                            value: String(s.id),
                            label: s.full_name || `${s.grade?.name || ""} "${s.name}"`,
                          }))}
                          placeholder="Sección"
                        />
                      </div>
                      <div className="flex-1">
                        <SearchableSelect
                          value={row.subject_id}
                          onValueChange={(v) => updateBulkRow(row.id, "subject_id", v)}
                          options={subjectsList.map((s) => ({ value: String(s.id), label: s.name }))}
                          placeholder="Materia"
                        />
                      </div>
                      <Button
                        type="button" variant="ghost" size="icon"
                        onClick={() => removeBulkRow(row.id)}
                        disabled={bulkRows.length === 1}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  {bulkResult.created} asignación{bulkResult.created !== 1 ? "es" : ""} creada{bulkResult.created !== 1 ? "s" : ""} exitosamente
                </span>
              </div>
              {bulkResult.errors?.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {bulkResult.errors.length} fila{bulkResult.errors.length !== 1 ? "s" : ""} con errores:
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {bulkResult.errors.map((err, i) => (
                      <div key={i} className="text-xs p-2 bg-destructive/10 rounded border border-destructive/20">
                        <span className="font-medium">Fila {err.row}:</span> {err.messages.join(", ")}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeBulk}>
              {bulkResult ? "Cerrar" : "Cancelar"}
            </Button>
            {!bulkResult && (
              <Button onClick={handleBulkSubmit} disabled={bulkMutation.isPending}>
                {bulkMutation.isPending
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
                  : <><Layers className="h-4 w-4 mr-2" />Guardar {bulkRows.length} asignación{bulkRows.length !== 1 ? "es" : ""}</>
                }
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Import Excel dialog ───────────────────────────────────────────── */}
      <Dialog open={importOpen} onOpenChange={closeImport}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar asignaciones desde Excel</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4 shrink-0" />
              <span>Columnas requeridas: <strong>docente, materia, seccion, anio_academico</strong></span>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 space-y-1">
              <p><strong>seccion</strong>: formato corto <code>5A</code>, <code>1B</code> o nombre completo del sistema</p>
              <p><strong>docente / materia</strong>: nombre exacto como aparece en el sistema</p>
              <p><strong>anio_academico</strong>: ej. <code>2026</code></p>
            </div>

            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="w-full">
              <FileDown className="h-4 w-4 mr-2" />
              Descargar plantilla Excel
            </Button>

            {!importResult && (
              <div className="space-y-2">
                <Label>Seleccionar archivo (.xlsx, .xls, .csv)</Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
              </div>
            )}

            {importResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    {importResult.imported} asignación{importResult.imported !== 1 ? "es" : ""} importada{importResult.imported !== 1 ? "s" : ""} exitosamente
                  </span>
                </div>
                {importResult.errors?.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {importResult.errors.length} fila{importResult.errors.length !== 1 ? "s" : ""} con errores:
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {importResult.errors.map((err, i) => (
                        <div key={i} className="text-xs p-2 bg-destructive/10 rounded border border-destructive/20">
                          <span className="font-medium">Fila {err.row}:</span> {err.messages.join(", ")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeImport}>
              {importResult ? "Cerrar" : "Cancelar"}
            </Button>
            {!importResult && (
              <Button onClick={handleImport} disabled={!importFile || importMutation.isPending}>
                {importMutation.isPending
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importando...</>
                  : <><Upload className="h-4 w-4 mr-2" />Importar</>
                }
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ────────────────────────────────────────────────── */}
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
