import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { authApi } from "@/api/auth"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  LogOut, User, Settings, Sun, Moon, Monitor,
  Maximize, Minimize, Eye, EyeOff, Loader2,
} from "lucide-react"

export default function AppHeader() {
  const { user, setUser, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)

  // Profile modal state
  const [profileOpen, setProfileOpen] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "", password: "", password_confirmation: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const openProfile = () => {
    setForm({ name: user?.name || "", phone: user?.phone || "", password: "", password_confirmation: "" })
    setShowPassword(false)
    setProfileOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (form.password && form.password !== form.password_confirmation) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    if (form.password && form.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }
    setSaving(true)
    try {
      const payload = { name: form.name, phone: form.phone || null }
      if (form.password) {
        payload.password = form.password
        payload.password_confirmation = form.password_confirmation
      }
      const res = await authApi.updateProfile(payload)
      setUser(res.data.data)
      toast.success("Perfil actualizado correctamente")
      setProfileOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al actualizar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  const userRole = typeof user?.roles?.[0] === "string" ? user.roles[0] : user?.roles?.[0]?.name

  return (
    <>
      <header className="flex h-14 items-center gap-2 px-4 dark:bg-[#0C1013]">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1" />

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : theme === "light" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tema</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4" />
                Claro
                {theme === "light" && <span className="ml-auto text-xs text-primary">●</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4" />
                Oscuro
                {theme === "dark" && <span className="ml-auto text-xs text-primary">●</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="h-4 w-4" />
                Sistema
                {theme === "system" && <span className="ml-auto text-xs text-primary">●</span>}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Fullscreen toggle */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>

        <Separator orientation="vertical" className="mx-1 h-4" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer outline-none"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openProfile}>
                <User className="h-4 w-4" />
                Mi cuenta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4" />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── Profile modal ──────────────────────────────────────────────────── */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              Mi cuenta
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Info no editable */}
            <div className="rounded-lg bg-muted/50 px-3 py-2 space-y-0.5">
              <p className="text-xs text-muted-foreground">DNI</p>
              <p className="text-sm font-medium">{user?.dni || "—"}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2 space-y-0.5">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>

            <Separator />

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Nombre completo</Label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Tu nombre completo"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Teléfono</Label>
              <Input
                id="profile-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="987654321"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-password">
                Nueva contraseña
                <span className="ml-1 text-xs text-muted-foreground">(dejar vacío para no cambiar)</span>
              </Label>
              <div className="relative">
                <Input
                  id="profile-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {form.password && (
              <div className="space-y-1.5">
                <Label htmlFor="profile-confirm">Confirmar contraseña</Label>
                <Input
                  id="profile-confirm"
                  type={showPassword ? "text" : "password"}
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
