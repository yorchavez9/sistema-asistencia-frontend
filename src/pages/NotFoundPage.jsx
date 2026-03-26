import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p className="text-muted-foreground">La página que buscas no existe.</p>
      <Button onClick={() => navigate("/")}>Volver al inicio</Button>
    </div>
  )
}
