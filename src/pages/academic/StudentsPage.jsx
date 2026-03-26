import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { studentsApi, sectionsApi, academicYearsApi, dniApi } from "@/api/endpoints"
import { useAuth } from "@/contexts/AuthContext"
import PageHeader from "@/components/shared/PageHeader"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import DataTable from "@/components/shared/DataTable"
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
import { Pencil, Trash2, Search, Loader2, Upload, Download, FileSpreadsheet } from "lucide-react"
import ActionButton from "@/components/shared/ActionButton"

const initialForm = {
  dni: "", first_name: "", last_name: "", birth_date: "", gender: "",
  address: "", guardian_name: "", guardian_phone: "", section_id: "",
  academic_year_id: "", enrollment_status: "activo",
}

export default function StudentsPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch] = useState("")
  const [sectionFilter, setSectionFilter] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [dniLoading, setDniLoading] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importYearId, setImportYearId] = useState("")
  const [importLoading, setImportLoading] = useState(false)
  const [importErrors, setImportErrors] = useState([])

  const handleSortChange = (key) => {
    if (sortBy === key) {
      if (sortDir === "asc") { setSortDir("desc") }
      else { setSortBy(null); setSortDir(null) }
    } else {
      setSortBy(key); setSortDir("asc")
    }
    setPage(1)
  }

  const { data, isLoading } = useQuery({
    queryKey: ["students", page, perPage, search, sectionFilter, sortBy, sortDir],
    queryFn: () =>
      studentsApi.getAll({
        page, search, section_id: sectionFilter || undefined, per_page: perPage,
        sort_by: sortBy || undefined, sort_dir: sortDir || undefined,
      }).then((r) => r.data.data),
  })

  const { data: sections } = useQuery({
    queryKey: ["sections-list"],
    queryFn: () => sectionsApi.getAll().then((r) => r.data.data),
  })

  const { data: years } = useQuery({
    queryKey: ["academic-years-list"],
    queryFn: () => academicYearsApi.getAll().then((r) => r.data.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? studentsApi.update(editing.id, payload) : studentsApi.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Estudiante actualizado" : "Estudiante creado")
      queryClient.invalidateQueries({ queryKey: ["students"] })
      setFormOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al guardar"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => studentsApi.delete(id),
    onSuccess: () => {
      toast.success("Estudiante eliminado")
      queryClient.invalidateQueries({ queryKey: ["students"] })
      setDeleteOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al eliminar"),
  })

  const sectionsList = Array.isArray(sections) ? sections : sections?.data || []
  const yearsList = Array.isArray(years) ? years : years?.data || []
  // r.data.data = { data: [...students], current_page, last_page, per_page, total, from, to }
  const students = Array.isArray(data) ? data : data?.data || []
  const meta = Array.isArray(data) ? null : data

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setFormOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      dni: item.dni || "",
      first_name: item.first_name || "",
      last_name: item.last_name || "",
      birth_date: item.birth_date || "",
      gender: item.gender || "",
      address: item.address || "",
      guardian_name: item.guardian_name || "",
      guardian_phone: item.guardian_phone || "",
      section_id: String(item.section_id || ""),
      academic_year_id: String(item.academic_year_id || ""),
      enrollment_status: item.enrollment_status || "activo",
    })
    setFormOpen(true)
  }

  const handleDniLookup = async () => {
    if (form.dni.length < 8) return
    setDniLoading(true)
    try {
      const res = await dniApi.lookup(form.dni)
      const data = res.data.data
      setForm((prev) => ({
        ...prev,
        first_name: data.nombres || prev.first_name,
        last_name: `${data.apellido_paterno || ""} ${data.apellido_materno || ""}`.trim() || prev.last_name,
      }))
      toast.success("Datos obtenidos de RENIEC")
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al consultar DNI")
    } finally {
      setDniLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await studentsApi.downloadTemplate()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "plantilla_estudiantes.xlsx")
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error("Error al descargar la plantilla")
    }
  }

  const handleImport = async () => {
    if (!importFile || !importYearId) return
    setImportLoading(true)
    setImportErrors([])
    try {
      const formData = new FormData()
      formData.append("file", importFile)
      formData.append("academic_year_id", importYearId)
      const res = await studentsApi.import(formData)
      const { imported, errors } = res.data.data
      if (imported > 0) {
        toast.success(`Se importaron ${imported} estudiantes exitosamente.`)
      }
      if (errors?.length > 0) {
        setImportErrors(errors)
        toast.warning(`${errors.length} fila(s) con errores.`)
      } else {
        setImportOpen(false)
        setImportFile(null)
        setImportYearId("")
      }
      queryClient.invalidateQueries({ queryKey: ["students"] })
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al importar")
    } finally {
      setImportLoading(false)
    }
  }

  const columns = [
    { key: "dni", label: "DNI", hideOnMobile: true },
    {
      key: "full_name", label: "Apellidos y Nombres", primary: true,
      render: (s) => <span className="font-medium">{s.last_name}, {s.first_name}</span>,
    },
    {
      key: "section", label: "Sección",
      render: (s) => s.section?.full_name || s.section?.name || "-",
    },
    {
      key: "enrollment_status", label: "Estado",
      render: (s) => (
        <Badge variant={s.enrollment_status === "activo" ? "default" : "outline"}>
          {s.enrollment_status}
        </Badge>
      ),
    },
  ]

  const totalItems = meta?.total ?? students.length
  const serverPagination = totalItems > 0 ? {
    currentPage: meta?.current_page || page,
    lastPage: meta?.last_page || Math.ceil(totalItems / perPage) || 1,
    perPage: meta?.per_page || perPage,
    total: totalItems,
    from: meta?.from || ((page - 1) * perPage + 1),
    to: meta?.to || Math.min(page * perPage, totalItems),
  } : null

  const hasActions = hasPermission("estudiantes.editar") || hasPermission("estudiantes.eliminar")

  return (
    <div className="space-y-4">
      <PageHeader
        title="Estudiantes"
        description={`${totalItems} estudiantes`}
        action={hasPermission("estudiantes.crear") ? "Nuevo estudiante" : null}
        onAction={openCreate}
        extra={
          hasPermission("estudiantes.crear") && (
            <Button variant="outline" onClick={() => { setImportOpen(true); setImportErrors([]); setImportFile(null) }}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Excel
            </Button>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o DNI..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <SearchableSelect
          value={sectionFilter}
          onValueChange={(v) => { setSectionFilter(v === "all" ? "" : v); setPage(1) }}
          options={[
            { value: "all", label: "Todas las secciones" },
            ...sectionsList.map((s) => ({ value: String(s.id), label: s.full_name || `${s.grade?.name || ""} - ${s.name}` })),
          ]}
          placeholder="Todas las secciones"
          className="w-52"
        />
      </div>

      <DataTable
        columns={columns}
        data={students}
        pagination={serverPagination}
        onPageChange={setPage}
        onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
        sortKey={sortBy}
        sortDirection={sortDir}
        onSortChange={handleSortChange}
        loading={isLoading}
        emptyMessage="No se encontraron estudiantes"
        actions={
          hasActions
            ? (s) => (
                <>
                  {hasPermission("estudiantes.editar") && (
                    <ActionButton preset="edit" icon={Pencil} onClick={() => openEdit(s)} />
                  )}
                  {hasPermission("estudiantes.eliminar") && (
                    <ActionButton preset="delete" icon={Trash2} onClick={() => { setSelectedId(s.id); setDeleteOpen(true) }} />
                  )}
                </>
              )
            : undefined
        }
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar estudiante" : "Nuevo estudiante"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>DNI</Label>
                  <div className="flex gap-2">
                    <Input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} maxLength={15} required placeholder="12345678" className="flex-1" />
                    <Button type="button" variant="outline" size="icon" onClick={handleDniLookup} disabled={form.dni.length < 8 || dniLoading} title="Buscar datos por DNI">
                      {dniLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Género</Label>
                  <SearchableSelect
                    value={form.gender}
                    onValueChange={(v) => setForm({ ...form, gender: v })}
                    options={[
                      { value: "M", label: "Masculino" },
                      { value: "F", label: "Femenino" },
                    ]}
                    placeholder="Seleccionar género"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombres</Label>
                  <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required placeholder="Ej: Juan Carlos" />
                </div>
                <div className="space-y-2">
                  <Label>Apellidos</Label>
                  <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required placeholder="Ej: Pérez López" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de nacimiento</Label>
                  <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ej: Jr. Lima 123" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Apoderado</Label>
                  <Input value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} placeholder="Ej: María López" />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono apoderado</Label>
                  <Input value={form.guardian_phone} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} maxLength={20} placeholder="987654321" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sección</Label>
                  <SearchableSelect
                    value={form.section_id}
                    onValueChange={(v) => setForm({ ...form, section_id: v })}
                    options={sectionsList.map((s) => ({ value: String(s.id), label: s.full_name || `${s.grade?.name || ""} - ${s.name}` }))}
                    placeholder="Seleccionar sección"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Año Académico</Label>
                  <SearchableSelect
                    value={form.academic_year_id}
                    onValueChange={(v) => setForm({ ...form, academic_year_id: v })}
                    options={yearsList.map((y) => ({ value: String(y.id), label: y.name }))}
                    placeholder="Seleccionar año"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado matrícula</Label>
                <Select value={form.enrollment_status} onValueChange={(v) => setForm({ ...form, enrollment_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="retirado">Retirado</SelectItem>
                    <SelectItem value="trasladado">Trasladado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
        title="Eliminar estudiante"
        description="¿Está seguro de eliminar este estudiante? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(selectedId)}
      />

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Importar estudiantes desde Excel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Button variant="link" className="p-0 h-auto" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-1" />
                Descargar plantilla Excel
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Descarga la plantilla, llénala con los datos de los estudiantes y súbela aquí.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Año Académico</Label>
              <SearchableSelect
                value={importYearId}
                onValueChange={setImportYearId}
                options={yearsList.map((y) => ({ value: String(y.id), label: y.name }))}
                placeholder="Seleccionar año académico"
              />
            </div>

            <div className="space-y-2">
              <Label>Archivo Excel</Label>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>

            {importErrors.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm space-y-1">
                <p className="font-medium text-destructive">Errores encontrados:</p>
                {importErrors.map((err, i) => (
                  <p key={i} className="text-destructive">
                    Fila {err.row}: {err.messages.join(", ")}
                  </p>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancelar</Button>
            <Button onClick={handleImport} disabled={!importFile || !importYearId || importLoading}>
              {importLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importando...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Importar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
