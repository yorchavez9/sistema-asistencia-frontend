import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsApi } from "@/api/endpoints"
import PageHeader from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Settings, Save, Upload, ImageIcon, Trash2, Database, Download, Loader2 } from "lucide-react"

function ImageUploadCard({ title, description, settingKey, currentUrl, onUploaded, onDeleted }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no debe superar 2MB")
      return
    }

    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const res = await settingsApi.uploadImage(settingKey, file)
      const url = res.data?.data?.value || res.data?.url || res.data?.value
      toast.success("Imagen subida correctamente")
      onUploaded?.(url)
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al subir imagen")
      setPreview(null)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await settingsApi.deleteImage(settingKey)
      setPreview(null)
      toast.success("Imagen eliminada correctamente")
      onDeleted?.()
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al eliminar imagen")
    } finally {
      setDeleting(false)
    }
  }

  const displayUrl = preview || currentUrl

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-muted/60 overflow-hidden cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {displayUrl ? (
              <img src={displayUrl} alt={title} className="h-full w-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={uploading || deleting}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Subiendo..." : "Seleccionar imagen"}
              </Button>
              {displayUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={uploading || deleting}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG o SVG. Máx 2MB.</p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}

function BackupCard() {
  const [loading, setLoading] = useState(false)

  const handleBackup = async () => {
    setLoading(true)
    try {
      const response = await settingsApi.backup()
      const blob = new Blob([response.data], { type: "application/sql" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const filename = `backup_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "_").replace(/-/g, "-")}.sql`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Copia de seguridad descargada correctamente")
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al generar la copia de seguridad")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Copia de Seguridad
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Descarga una copia completa de la base de datos en formato SQL.
        </p>
      </CardHeader>
      <CardContent>
        <Button onClick={handleBackup} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {loading ? "Generando..." : "Descargar Copia de Seguridad"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [values, setValues] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.getAll().then((r) => r.data.data || r.data),
  })

  const settings = Array.isArray(data) ? data : data?.data || []

  useEffect(() => {
    if (settings.length > 0) {
      const vals = {}
      settings.forEach((s) => {
        vals[s.key || s.id] = s.value
      })
      setValues(vals)
    }
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: (data) => settingsApi.bulkUpdate(data),
    onSuccess: () => {
      toast.success("Configuración guardada")
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al guardar"),
  })

  const handleSave = () => {
    const settingsPayload = Object.entries(values)
      .filter(([key]) => key !== "logo_url" && key !== "login_bg_url")
      .map(([key, value]) => ({ key, value: String(value) }))
    saveMutation.mutate({ settings: settingsPayload })
  }

  const handleImageUploaded = (key) => (url) => {
    setValues((prev) => ({ ...prev, [key]: url }))
    queryClient.invalidateQueries({ queryKey: ["settings"] })
  }

  const grouped = settings.reduce((acc, s) => {
    const key = s.key || ""
    if (key === "logo_url" || key === "login_bg_url") return acc
    let group = "General"
    if (key.startsWith("ai_")) group = "Inteligencia Artificial"
    else if (key.startsWith("dni_api")) group = "API de Consulta DNI (RENIEC)"
    else if (key.includes("faltas") || key.includes("asistencia")) group = "Alertas y Umbrales"
    if (!acc[group]) acc[group] = []
    acc[group].push(s)
    return acc
  }, {})

  const AI_PROVIDERS = {
    openai: {
      label: "OpenAI (ChatGPT)",
      models: [
        { value: "gpt-4o-mini", label: "GPT-4o Mini (Recomendado)" },
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
      ],
      default: "gpt-4o-mini",
    },
    claude: {
      label: "Claude (Anthropic)",
      models: [
        { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4 (Recomendado)" },
        { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
      ],
      default: "claude-sonnet-4-20250514",
    },
    deepseek: {
      label: "DeepSeek",
      models: [
        { value: "deepseek-chat", label: "DeepSeek Chat (Recomendado)" },
        { value: "deepseek-reasoner", label: "DeepSeek Reasoner" },
      ],
      default: "deepseek-chat",
    },
  }

  const currentProvider = values.ai_provider || "openai"
  const providerModels = AI_PROVIDERS[currentProvider]?.models || []

  const handleProviderChange = (provider) => {
    const defaultModel = AI_PROVIDERS[provider]?.default || ""
    setValues((prev) => ({ ...prev, ai_provider: provider, ai_model: defaultModel }))
  }

  const settingLabels = {
    umbral_faltas_alerta: "Umbral de faltas para alerta",
    umbral_faltas_critico: "Umbral de faltas crítico",
    umbral_faltas_consecutivas: "Faltas consecutivas para alerta",
    porcentaje_asistencia_minimo: "Porcentaje mínimo de asistencia (%)",
    ai_provider: "Proveedor de IA",
    ai_api_key: "API Key de IA",
    ai_model: "Modelo de IA",
    dni_api_url: "URL de la API de DNI",
    dni_api_token: "Token de la API de DNI",
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Configuración" icon={Settings} />
        <p className="text-center text-muted-foreground py-8">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Configuración del Sistema" icon={Settings} />
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {/* Image uploads */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploadCard
          title="Logo del colegio"
          description="Se mostrará en el sidebar, reportes PDF y como ícono de pestaña del navegador."
          settingKey="logo_url"
          currentUrl={values.logo_url}
          onUploaded={handleImageUploaded("logo_url")}
          onDeleted={() => { setValues((prev) => ({ ...prev, logo_url: "" })); queryClient.invalidateQueries({ queryKey: ["settings"] }) }}
        />
        <ImageUploadCard
          title="Imagen de inicio de sesión"
          description="Se mostrará como fondo o imagen decorativa en la página de login."
          settingKey="login_bg_url"
          currentUrl={values.login_bg_url}
          onUploaded={handleImageUploaded("login_bg_url")}
          onDeleted={() => { setValues((prev) => ({ ...prev, login_bg_url: "" })); queryClient.invalidateQueries({ queryKey: ["settings"] }) }}
        />
      </div>

      {/* Backup */}
      <BackupCard />

      {Object.entries(grouped).map(([group, items]) => (
        <Card key={group}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{group}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((s) => {
              const key = s.key || s.id
              return (
                <div key={key} className="grid grid-cols-3 gap-4 items-center">
                  <Label className="text-sm">
                    {settingLabels[key] || s.description || key}
                  </Label>
                  {key === "ai_provider" ? (
                    <Select
                      value={values[key] || "openai"}
                      onValueChange={handleProviderChange}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AI_PROVIDERS).map(([k, p]) => (
                          <SelectItem key={k} value={k}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : key === "ai_api_key" || key === "dni_api_token" ? (
                    <Input
                      type="password"
                      value={values[key] || ""}
                      onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                      className="col-span-2"
                      placeholder={key === "dni_api_token" ? "Token de autenticación..." : "sk-..."}
                    />
                  ) : key === "ai_model" ? (
                    <Select
                      value={values[key] || ""}
                      onValueChange={(v) => setValues({ ...values, [key]: v })}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Seleccionar modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {providerModels.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={typeof s.value === "number" || /^\d+$/.test(s.value) ? "number" : "text"}
                      value={values[key] || ""}
                      onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                      className="col-span-2"
                      placeholder={`Ingrese ${settingLabels[key] || key}`}
                    />
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
