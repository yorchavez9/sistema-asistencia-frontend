import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { rolesApi, permissionsApi } from "@/api/endpoints"
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Pencil, Trash2, Shield } from "lucide-react"
import ActionButton from "@/components/shared/ActionButton"

export default function RolesPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const [formOpen, setFormOpen] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [name, setName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [permSearch, setPermSearch] = useState("")

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.getAll().then((r) => r.data.data),
  })

  const { data: allPermissions } = useQuery({
    queryKey: ["permissions-all"],
    queryFn: () => permissionsApi.getAll().then((r) => r.data.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingRole ? rolesApi.update(editingRole.id, payload) : rolesApi.create(payload),
    onSuccess: () => {
      toast.success(editingRole ? "Rol actualizado" : "Rol creado")
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setFormOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error"),
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, permissions }) => rolesApi.assignPermissions(id, { permissions }),
    onSuccess: () => {
      toast.success("Permisos actualizados")
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setPermissionsOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => rolesApi.delete(id),
    onSuccess: () => {
      toast.success("Rol eliminado")
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      setDeleteOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error"),
  })

  const openCreate = () => {
    setEditingRole(null)
    setName("")
    setFormOpen(true)
  }

  const openEdit = (role) => {
    setEditingRole(role)
    setName(role.name)
    setFormOpen(true)
  }

  const openPermissions = (role) => {
    setSelectedRole(role)
    setSelectedPermissions(
      (role.permissions || []).map((p) => (typeof p === "string" ? p : p.name))
    )
    setPermSearch("")
    setPermissionsOpen(true)
  }

  const togglePermission = (permName) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    )
  }

  const toggleModule = (perms) => {
    const allChecked = perms.every((p) => selectedPermissions.includes(p))
    setSelectedPermissions((prev) =>
      allChecked ? prev.filter((p) => !perms.includes(p)) : [...new Set([...prev, ...perms])]
    )
  }

  const MODULE_LABELS = {
    anios: "Años Académicos",
    usuarios: "Usuarios",
    roles: "Roles",
    permisos: "Permisos",
    periodos: "Periodos",
    grados: "Grados",
    secciones: "Secciones",
    estudiantes: "Estudiantes",
    materias: "Materias",
    asignaciones: "Asignaciones",
    asistencia: "Asistencia",
    alertas: "Alertas",
    reportes: "Reportes",
    dashboard: "Dashboard",
    configuracion: "Configuración",
    ia: "Inteligencia Artificial",
    transicion: "Transición Anual",
  }

  const rawPermissions = Array.isArray(allPermissions) ? allPermissions : allPermissions?.data || []
  const grouped = rawPermissions.reduce((acc, group) => {
    if (group.module && Array.isArray(group.permissions)) {
      acc[group.module] = group.permissions.map((p) => p.name || p)
    } else if (typeof group === "object" && group.name) {
      const module = group.name.split(".")[0]
      if (!acc[module]) acc[module] = []
      acc[module].push(group.name)
    }
    return acc
  }, {})

  const allPerms = Object.values(grouped).flat()
  const allSelected = allPerms.length > 0 && allPerms.every((p) => selectedPermissions.includes(p))

  const toggleAll = () => {
    setSelectedPermissions(allSelected ? [] : [...allPerms])
  }

  const rolesList = Array.isArray(roles) ? roles : roles?.data || []

  const columns = [
    { key: "name", label: "Nombre", primary: true, render: (r) => <span className="font-medium">{r.name}</span> },
    {
      key: "permissions_count", label: "Permisos",
      render: (r) => <Badge variant="secondary">{r.permissions?.length || 0} permisos</Badge>,
    },
    { key: "users_count", label: "Usuarios", render: (r) => r.users_count ?? "-" },
  ]

  const { data: paginatedData, pagination, onPageChange, onPerPageChange, sortKey, sortDirection, onSortChange } =
    useClientPagination(rolesList, 10)

  const hasActions = hasPermission("roles.editar") || hasPermission("roles.eliminar")

  return (
    <div className="space-y-4">
      <PageHeader
        title="Gestión de Roles"
        description={`${rolesList.length} roles registrados`}
        action={hasPermission("roles.crear") ? "Nuevo rol" : null}
        onAction={openCreate}
      />

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
        emptyMessage="No hay roles"
        actions={
          hasActions
            ? (role) => (
                <>
                  {hasPermission("roles.editar") && (
                    <>
                      <ActionButton preset="permissions" icon={Shield} onClick={() => openPermissions(role)} title="Permisos" />
                      <ActionButton preset="edit" icon={Pencil} onClick={() => openEdit(role)} />
                    </>
                  )}
                  {hasPermission("roles.eliminar") && (
                    <ActionButton preset="delete" icon={Trash2} onClick={() => { setSelectedId(role.id); setDeleteOpen(true) }} />
                  )}
                </>
              )
            : undefined
        }
      />

      {/* Form crear/editar rol */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Editar rol" : "Nuevo rol"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ name }) }} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del rol</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: Coordinador" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de permisos */}
      <Dialog open={permissionsOpen} onOpenChange={setPermissionsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle>Permisos de: {selectedRole?.name}</DialogTitle>
          </DialogHeader>

          {/* Barra superior fija: Marcar todos + búsqueda */}
          <div className="flex items-center justify-between gap-3 px-6 pb-3 border-b">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              <span className="text-sm font-medium">
                Marcar todos
              </span>
              <Badge variant="secondary" className="text-xs">
                {selectedPermissions.length}/{allPerms.length}
              </Badge>
            </label>
            <Input
              placeholder="Buscar permiso..."
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              className="h-8 w-48"
            />
          </div>

          {/* Grid de módulos scrolleable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(grouped).map(([module, perms]) => {
                const filtered = permSearch
                  ? perms.filter((p) => p.toLowerCase().includes(permSearch.toLowerCase()))
                  : perms
                if (filtered.length === 0) return null

                const moduleCheckedCount = perms.filter((p) => selectedPermissions.includes(p)).length
                const moduleAllChecked = moduleCheckedCount === perms.length
                const moduleSomeChecked = !moduleAllChecked && moduleCheckedCount > 0

                return (
                  <div key={module} className="rounded-lg border bg-card overflow-hidden">
                    {/* Header del módulo */}
                    <label
                      className={cn(
                        "flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer select-none border-b transition-colors",
                        moduleAllChecked
                          ? "bg-primary/10 dark:bg-primary/20"
                          : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={moduleAllChecked}
                          indeterminate={moduleSomeChecked}
                          onCheckedChange={() => toggleModule(perms)}
                        />
                        <span className="text-sm font-semibold">{MODULE_LABELS[module] || module}</span>
                      </div>
                      <Badge variant={moduleAllChecked ? "default" : "outline"} className="text-xs">
                        {moduleCheckedCount}/{perms.length}
                      </Badge>
                    </label>
                    {/* Permisos individuales */}
                    <div className="px-2 py-1.5 space-y-0.5">
                      {filtered.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm)
                        const action = perm.split(".")[1] || perm
                        return (
                          <label
                            key={perm}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer select-none transition-colors",
                              isChecked
                                ? "bg-primary/10 text-foreground dark:bg-primary/15"
                                : "hover:bg-muted/60 text-muted-foreground"
                            )}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => togglePermission(perm)}
                            />
                            <span className="text-sm">{action}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setPermissionsOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => assignMutation.mutate({ id: selectedRole.id, permissions: selectedPermissions })}
              disabled={assignMutation.isPending}
            >
              {assignMutation.isPending ? "Guardando..." : `Guardar (${selectedPermissions.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar rol"
        description="¿Está seguro? Los usuarios con este rol perderán sus permisos."
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(selectedId)}
      />
    </div>
  )
}
