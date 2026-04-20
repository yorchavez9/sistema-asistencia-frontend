import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi, rolesApi, dniApi } from "@/api/endpoints"
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
import SearchableSelect from "@/components/shared/SearchableSelect"
import { toast } from "sonner"
import { Pencil, Trash2, ToggleLeft, ToggleRight, Search, Loader2, Eye, EyeOff, FileDown, X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import ActionButton from "@/components/shared/ActionButton"
import jsPDF from "jspdf"
import "jspdf-autotable"

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const [form, setForm] = useState({
    name: "", dni: "", email: "", phone: "", password: "", password_confirmation: "", role: "",
  })
  const [dniLoading, setDniLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState([])

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importResult, setImportResult] = useState(null)

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
    queryKey: ["users", page, perPage, search, roleFilter, sortBy, sortDir],
    queryFn: () =>
      usersApi.getAll({ page, search, role: roleFilter || undefined, per_page: perPage, sort_by: sortBy || undefined, sort_dir: sortDir || undefined }).then((r) => r.data.data),
  })

  const { data: roles } = useQuery({
    queryKey: ["roles-list"],
    queryFn: () => rolesApi.getAll().then((r) => r.data.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingUser
        ? usersApi.update(editingUser.id, payload)
        : usersApi.create(payload),
    onSuccess: () => {
      if (!editingUser && form.password) {
        setCredentials((prev) => [...prev, {
          name: form.name,
          dni: form.dni,
          email: form.email,
          password: form.password,
        }])
      }
      toast.success(editingUser ? "Usuario actualizado" : "Usuario creado")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      closeForm()
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al guardar"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => {
      toast.success("Usuario eliminado")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setDeleteOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al eliminar"),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => usersApi.toggleStatus(id),
    onSuccess: () => {
      toast.success("Estado actualizado")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const importMutation = useMutation({
    mutationFn: (formData) => usersApi.import(formData),
    onSuccess: (res) => {
      const result = res.data.data
      setImportResult(result)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      if (result.imported > 0) {
        toast.success(`${result.imported} usuario${result.imported !== 1 ? "s" : ""} importado${result.imported !== 1 ? "s" : ""} correctamente`)
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al importar el archivo"),
  })

  const handleImport = () => {
    if (!importFile) return
    const formData = new FormData()
    formData.append("file", importFile)
    importMutation.mutate(formData)
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await usersApi.downloadTemplate()
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = "plantilla_usuarios.xlsx"
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Error al descargar la plantilla")
    }
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportResult(null)
  }

  const openCreate = () => {
    setEditingUser(null)
    setForm({ name: "", dni: "", email: "", phone: "", password: "", password_confirmation: "", role: "Docente" })
    setFormOpen(true)
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setForm({
      name: user.name,
      dni: user.dni || "",
      email: user.email,
      phone: user.phone || "",
      password: "",
      password_confirmation: "",
      role: (typeof user.roles?.[0] === "string" ? user.roles[0] : user.roles?.[0]?.name) || "",
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingUser(null)
  }

  const generateEmail = (nombres, apellido, dni) => {
    const norm = (str) =>
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "")
    const first = norm(nombres.split(" ")[0])
    const lastInitial = norm(apellido).charAt(0)
    const dniShort = dni.slice(0, 4)
    return first && lastInitial ? `${first}${lastInitial}${dniShort}@ccochapata.edu.pe` : ""
  }

  const handleDniLookup = async () => {
    if (form.dni.length < 8) return
    setDniLoading(true)
    try {
      const res = await dniApi.lookup(form.dni)
      const data = res.data.data
      const email = data.nombres && data.apellido_paterno
        ? generateEmail(data.nombres, data.apellido_paterno, form.dni)
        : ""
      const norm = (str) =>
        str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "")
      const passName = data.nombres ? norm(data.nombres.split(" ")[0]) : ""
      const special = ["&", "#", "$"][Math.floor(Math.random() * 3)]
      const password = passName ? `${passName}${special}${form.dni.slice(0, 4)}` : ""
      setForm((prev) => ({
        ...prev,
        name: data.nombre_completo || prev.name,
        email: email || prev.email,
        password: password || prev.password,
        password_confirmation: password || prev.password_confirmation,
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
    const payload = { ...form }
    if (!payload.password) {
      delete payload.password
      delete payload.password_confirmation
    }
    saveMutation.mutate(payload)
  }

  // r.data.data = { data: [...users], current_page, last_page, per_page, total, from, to }
  const users = Array.isArray(data) ? data : data?.data || []
  const meta = Array.isArray(data) ? null : data

  const columns = [
    { key: "name", label: "Nombre", primary: true, render: (u) => <span className="font-medium">{u.name}</span> },
    { key: "dni", label: "DNI", hideOnMobile: true, render: (u) => u.dni || "-" },
    { key: "email", label: "Email", hideOnMobile: true },
    {
      key: "role", label: "Rol",
      render: (u) => (
        <Badge variant="secondary">
          {(typeof u.roles?.[0] === "string" ? u.roles[0] : u.roles?.[0]?.name) || "Sin rol"}
        </Badge>
      ),
    },
    {
      key: "status", label: "Estado",
      render: (u) => (
        <Badge variant={u.status ? "default" : "outline"}>
          {u.status ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ]

  const totalItems = meta?.total ?? users.length
  const serverPagination = totalItems > 0 ? {
    currentPage: meta?.current_page || page,
    lastPage: meta?.last_page || Math.ceil(totalItems / perPage) || 1,
    perPage: meta?.per_page || perPage,
    total: totalItems,
    from: meta?.from || ((page - 1) * perPage + 1),
    to: meta?.to || Math.min(page * perPage, totalItems),
  } : null

  const downloadCredentialsPdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Credenciales de Usuarios", 14, 20)
    doc.setFontSize(10)
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, 14, 28)

    doc.autoTable({
      startY: 34,
      head: [["N°", "Nombre", "DNI", "Email", "Contraseña"]],
      body: credentials.map((c, i) => [i + 1, c.name, c.dni, c.email, c.password]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    })

    const finalY = doc.lastAutoTable.finalY || 50
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text("* Se recomienda cambiar la contraseña en el primer inicio de sesión.", 14, finalY + 10)

    doc.save("credenciales-usuarios.pdf")
  }

  const hasActions = hasPermission("usuarios.editar") || hasPermission("usuarios.eliminar")

  return (
    <div className="space-y-4">
      <PageHeader
        title="Gestión de Usuarios"
        description={`${totalItems} usuarios registrados`}
        action={hasPermission("usuarios.crear") ? "Nuevo usuario" : null}
        onAction={openCreate}
        extra={hasPermission("usuarios.crear") && (
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar Excel
          </Button>
        )}
      />

      {credentials.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {credentials.length} credencial{credentials.length !== 1 ? "es" : ""} pendiente{credentials.length !== 1 ? "s" : ""} de descarga
          </span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCredentials([])}>
              <X className="h-4 w-4 mr-1" />
              Limpiar lista
            </Button>
            <Button size="sm" onClick={downloadCredentialsPdf}>
              <FileDown className="h-4 w-4 mr-1" />
              Descargar credenciales (PDF)
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI o email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <SearchableSelect
          value={roleFilter}
          onValueChange={(v) => { setRoleFilter(v === "all" ? "" : v); setPage(1) }}
          options={[
            { value: "all", label: "Todos los roles" },
            ...(Array.isArray(roles) ? roles : roles?.data || []).map((role) => ({ value: role.name, label: role.name })),
          ]}
          placeholder="Todos los roles"
          className="w-48"
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        pagination={serverPagination}
        onPageChange={setPage}
        onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
        sortKey={sortBy}
        sortDirection={sortDir}
        onSortChange={handleSortChange}
        loading={isLoading}
        emptyMessage="No se encontraron usuarios"
        actions={
          hasActions
            ? (user) => (
                <>
                  {hasPermission("usuarios.editar") && (
                    <>
                      <ActionButton
                        preset="toggle"
                        icon={user.status ? ToggleRight : ToggleLeft}
                        onClick={() => toggleMutation.mutate(user.id)}
                        title={user.status ? "Desactivar" : "Activar"}
                      />
                      <ActionButton preset="edit" icon={Pencil} onClick={() => openEdit(user)} />
                    </>
                  )}
                  {hasPermission("usuarios.eliminar") && (
                    <ActionButton preset="delete" icon={Trash2} onClick={() => { setSelectedId(user.id); setDeleteOpen(true) }} />
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
            <DialogTitle>{editingUser ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ej: Juan Pérez" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>DNI</Label>
                  <div className="flex gap-2">
                    <Input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} maxLength={8} placeholder="12345678" className="flex-1" />
                    <Button type="button" variant="outline" size="icon" onClick={handleDniLookup} disabled={form.dni.length < 8 || dniLoading} title="Buscar datos por DNI">
                      {dniLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="987654321" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="correo@ejemplo.com" />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <SearchableSelect
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                  options={(Array.isArray(roles) ? roles : roles?.data || []).map((role) => ({ value: role.name, label: role.name }))}
                  placeholder="Seleccionar rol"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{editingUser ? "Nueva contraseña" : "Contraseña"}</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required={!editingUser}
                      placeholder="••••••••"
                      className="pr-9"
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirmar</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.password_confirmation}
                      onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                      required={!editingUser}
                    placeholder="••••••••"
                      className="pr-9"
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar usuario"
        description="¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(selectedId)}
      />

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={closeImport}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar usuarios desde Excel</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4 shrink-0" />
              <span>El archivo debe tener las columnas: <strong>nombre_completo, dni, email, telefono, contrasena, rol</strong></span>
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
                  onChange={(e) => { setImportFile(e.target.files?.[0] || null) }}
                />
              </div>
            )}

            {importResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    {importResult.imported} usuario{importResult.imported !== 1 ? "s" : ""} importado{importResult.imported !== 1 ? "s" : ""} exitosamente
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
                {importMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importando...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Importar</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
