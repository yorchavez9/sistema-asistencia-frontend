import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ShieldX } from "lucide-react"

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <ShieldX className="h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-bold">Acceso denegado</h1>
      <p className="text-muted-foreground max-w-md">
        No tiene los permisos necesarios para acceder a esta página.
        Contacte al administrador si cree que esto es un error.
      </p>
      <Button onClick={() => navigate("/")}>Volver al inicio</Button>
    </div>
  )
}
