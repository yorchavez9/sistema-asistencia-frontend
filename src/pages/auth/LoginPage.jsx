import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { authApi } from "@/api/auth"
import useSettings from "@/hooks/useSettings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, hasPermission } = useAuth()
  const navigate = useNavigate()
  const { logoUrl, loginBgUrl } = useSettings()

  useEffect(() => {
    authApi.checkSetup().then(({ data }) => {
      if (data.data.needs_setup) {
        navigate("/setup", { replace: true })
      }
    }).catch(() => {})
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const session = await login({ email, password })
      toast.success("Inicio de sesión exitoso")

      navigate("/attendance")
    } catch (error) {
      const message = error.response?.data?.message || "Error al iniciar sesión"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/3 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary/8 blur-3xl" />
      </div>

      {/* Left panel: image (lg+) */}
      <div className="hidden lg:flex lg:flex-1 relative items-center justify-center bg-primary/5 overflow-hidden">
        {loginBgUrl ? (
          <img
            src={loginBgUrl}
            alt="Institución"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
            <div className="h-24 w-24 rounded-2xl overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-bold text-3xl rounded-2xl">
                  SA
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Sistema de Asistencia</h2>
              <p className="mt-2 text-muted-foreground max-w-sm">
                Plataforma integral de control y seguimiento de asistencia estudiantil
              </p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-background/60 backdrop-blur-sm p-4">
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-xs text-muted-foreground mt-1">Digital</p>
              </div>
              <div className="rounded-xl bg-background/60 backdrop-blur-sm p-4">
                <p className="text-2xl font-bold text-primary">IA</p>
                <p className="text-xs text-muted-foreground mt-1">Integrada</p>
              </div>
              <div className="rounded-xl bg-background/60 backdrop-blur-sm p-4">
                <p className="text-2xl font-bold text-primary">24/7</p>
                <p className="text-xs text-muted-foreground mt-1">Acceso</p>
              </div>
            </div>
          </div>
        )}
        {loginBgUrl && (
          <div className="absolute inset-0 bg-black/20" />
        )}
      </div>

      {/* Right panel: form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-xs space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-5">
            <div className="h-24 w-24 rounded-3xl overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-bold text-2xl rounded-3xl">
                  SA
                </div>
              )}
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Bienvenido</h1>
              <p className="text-base text-muted-foreground font-medium">
                I.E. Los Libertadores de Ccochapata
              </p>
              <p className="text-sm text-muted-foreground/70">
                Ingresa tus credenciales para continuar
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-sm font-medium" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Ingresando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Ingresar
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            Sistema de Asistencia &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
