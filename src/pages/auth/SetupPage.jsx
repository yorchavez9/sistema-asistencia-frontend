import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import useSettings from "@/hooks/useSettings"
import { authApi } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Eye, EyeOff, UserPlus } from "lucide-react"

export default function SetupPage() {
  const [form, setForm] = useState({
    name: "",
    dni: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()
  const { logoUrl, loginBgUrl } = useSettings()

  useEffect(() => {
    authApi.checkSetup().then(({ data }) => {
      if (!data.data.needs_setup) {
        navigate("/login", { replace: true })
      }
      setChecking(false)
    }).catch(() => {
      setChecking(false)
    })
  }, [navigate])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.setupRegister(form)
      localStorage.setItem("token", data.data.token)
      // Reload user in AuthContext
      window.location.href = "/"
    } catch (error) {
      const message = error.response?.data?.message || "Error al configurar el sistema"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
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
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-3xl overflow-hidden shadow-md ring-4 ring-primary/10">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-bold text-2xl rounded-3xl">
                  SA
                </div>
              )}
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Configuración Inicial</h1>
              <p className="text-sm text-muted-foreground">
                Registra al Director del sistema para comenzar
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Juan Pérez"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  name="dni"
                  placeholder="12345678"
                  value={form.dni}
                  onChange={handleChange}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="987654321"
                  value={form.phone}
                  onChange={handleChange}
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="director@ejemplo.com"
                value={form.email}
                onChange={handleChange}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="h-10 pr-10"
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
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password_confirmation}
                onChange={handleChange}
                required
                minLength={8}
                className="h-10"
              />
            </div>
            <Button type="submit" className="w-full h-10 text-sm font-medium" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Configurando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Crear cuenta de Director
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
