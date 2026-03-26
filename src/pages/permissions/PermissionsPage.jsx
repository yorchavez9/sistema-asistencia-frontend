import { useQuery } from "@tanstack/react-query"
import { permissionsApi } from "@/api/endpoints"
import PageHeader from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function PermissionsPage() {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => permissionsApi.getAll().then((r) => r.data.data),
  })

  // La API devuelve permisos ya agrupados: [{module, permissions: [{id, name}, ...]}, ...]
  const rawList = Array.isArray(permissions) ? permissions : permissions?.data || []

  const grouped = {}
  let totalCount = 0
  rawList.forEach((group) => {
    if (group.module && Array.isArray(group.permissions)) {
      grouped[group.module] = group.permissions.map((p) => p.name || p)
      totalCount += group.permissions.length
    } else if (typeof group === "object" && group.name) {
      const module = group.name.split(".")[0]
      if (!grouped[module]) grouped[module] = []
      grouped[module].push(group.name)
      totalCount++
    }
  })

  return (
    <div className="space-y-4">
      <PageHeader title="Permisos del Sistema" icon={Shield} />

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Cargando...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([module, perms]) => (
            <Card key={module}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm capitalize flex items-center justify-between">
                  {module}
                  <Badge variant="secondary">{perms.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {perms.map((perm) => (
                  <div key={perm} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {perm}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Total: {totalCount} permisos en {Object.keys(grouped).length} módulos
      </p>
    </div>
  )
}
