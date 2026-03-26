import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { yearTransitionApi, academicYearsApi } from "@/api/endpoints"
import PageHeader from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { DatePicker } from "@/components/ui/date-picker"
import { Separator } from "@/components/ui/separator"
import SearchableSelect from "@/components/shared/SearchableSelect"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Users,
  CalendarPlus,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Undo2,
  Copy,
  School,
  History,
} from "lucide-react"
import ConfirmDialog from "@/components/shared/ConfirmDialog"

const STEPS = [
  { id: 1, title: "Resumen", icon: Users },
  { id: 2, title: "Nuevo Año", icon: CalendarPlus },
  { id: 3, title: "Promover", icon: ArrowRightLeft },
  { id: 4, title: "Egresar", icon: GraduationCap },
  { id: 5, title: "Finalizar", icon: CheckCircle2 },
]

function StepIndicator({ currentStep, completedSteps }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {STEPS.map((step, index) => {
        const Icon = step.icon
        const isActive = currentStep === step.id
        const isCompleted = completedSteps.includes(step.id)

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isCompleted
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isCompleted && !isActive ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="w-6 h-px bg-border mx-1" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ==================== PASO 1: RESUMEN ====================
function StepSummary({ yearId }) {
  const { data, isLoading } = useQuery({
    queryKey: ["transition-summary", yearId],
    queryFn: () => yearTransitionApi.summary({ academic_year_id: yearId }),
    enabled: !!yearId,
  })

  const summary = data?.data?.data || []

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!summary.length) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No se encontraron grados activos con alumnos.</AlertDescription>
      </Alert>
    )
  }

  const totalStudents = summary.reduce((acc, g) => acc + g.total_students, 0)

  return (
    <div className="space-y-4">
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Total de estudiantes activos: <strong>{totalStudents}</strong>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summary.map((grade) => (
          <Card key={grade.grade_id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <School className="h-4 w-4" />
                {grade.grade_name}
              </CardTitle>
              <CardDescription>{grade.total_students} estudiantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {grade.sections.map((sec) => (
                  <div key={sec.section_id} className="flex justify-between text-sm">
                    <span>Sección {sec.section_name}</span>
                    <Badge variant="secondary">{sec.student_count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ==================== PASO 2: CREAR AÑO ====================
function StepCreateYear({ newYear, setNewYear, onCreated, existingNewYear }) {
  const [periods, setPeriods] = useState([
    { name: "I Bimestre", start_date: "", end_date: "" },
    { name: "II Bimestre", start_date: "", end_date: "" },
    { name: "III Bimestre", start_date: "", end_date: "" },
    { name: "IV Bimestre", start_date: "", end_date: "" },
  ])

  const mutation = useMutation({
    mutationFn: (data) => yearTransitionApi.createYear(data),
    onSuccess: (res) => {
      const year = res.data.data
      toast.success("Año académico creado exitosamente.")
      onCreated(year)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Error al crear el año académico.")
    },
  })

  const handlePeriodChange = (index, field, value) => {
    const updated = [...periods]
    updated[index] = { ...updated[index], [field]: value }
    setPeriods(updated)
  }

  const handleSubmit = () => {
    if (!newYear.name || !newYear.start_date || !newYear.end_date) {
      toast.error("Complete todos los campos del año académico.")
      return
    }
    for (const p of periods) {
      if (!p.start_date || !p.end_date) {
        toast.error("Complete las fechas de todos los bimestres.")
        return
      }
    }
    mutation.mutate({ ...newYear, periods })
  }

  if (existingNewYear) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription>
          Año académico <strong>{existingNewYear.name}</strong> ya fue creado. Puede continuar al siguiente paso.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-base">Datos del Nuevo Año</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: 2027"
                value={newYear.name}
                onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <DatePicker
                value={newYear.start_date}
                onChange={(val) => setNewYear({ ...newYear, start_date: val })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <DatePicker
                value={newYear.end_date}
                onChange={(val) => setNewYear({ ...newYear, end_date: val })}
                minDate={newYear.start_date}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-base">Bimestres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {periods.map((period, index) => (
            <div key={index} className="grid gap-4 md:grid-cols-3 items-end">
              <div className="space-y-2">
                <Label>{period.name}</Label>
                <Input
                  value={period.name}
                  onChange={(e) => handlePeriodChange(index, "name", e.target.value)}
                  placeholder="Ej: Bimestre I"
                />
              </div>
              <div className="space-y-2">
                <Label>Inicio</Label>
                <DatePicker
                  value={period.start_date}
                  onChange={(val) => handlePeriodChange(index, "start_date", val)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fin</Label>
                <DatePicker
                  value={period.end_date}
                  onChange={(val) => handlePeriodChange(index, "end_date", val)}
                  minDate={period.start_date}
                />
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
            <CalendarPlus className="mr-2 h-4 w-4" />
            Crear Año Académico
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// ==================== PASO 3: PROMOVER ====================
function StepPromote({ yearId, newYearId, onComplete }) {
  const [excludedIds, setExcludedIds] = useState({})
  const [promotedSections, setPromotedSections] = useState([])
  const [confirmSection, setConfirmSection] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ["transition-preview", yearId],
    queryFn: () => yearTransitionApi.preview({ academic_year_id: yearId }),
    enabled: !!yearId,
  })

  const promoteMutation = useMutation({
    mutationFn: (data) => yearTransitionApi.promote(data),
    onSuccess: (res, variables) => {
      const result = res.data.data
      toast.success(
        `${result.from_grade} ${result.section}: ${result.promoted} promovidos, ${result.retained} repitentes.`
      )
      setPromotedSections((prev) => [...prev, variables.section_id])
      setConfirmSection(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Error al promover.")
      setConfirmSection(null)
    },
  })

  const preview = (data?.data?.data || []).filter((s) => !s.is_last_grade)

  const toggleExclude = (sectionId, studentId) => {
    setExcludedIds((prev) => {
      const sectionExcludes = prev[sectionId] || []
      const updated = sectionExcludes.includes(studentId)
        ? sectionExcludes.filter((id) => id !== studentId)
        : [...sectionExcludes, studentId]
      return { ...prev, [sectionId]: updated }
    })
  }

  const handlePromote = (section) => {
    setConfirmSection(section)
  }

  const executePromotion = () => {
    if (!confirmSection) return
    promoteMutation.mutate({
      section_id: confirmSection.section_id,
      from_academic_year_id: yearId,
      to_academic_year_id: newYearId,
      exclude_student_ids: excludedIds[confirmSection.section_id] || [],
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!newYearId) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Debe crear el nuevo año académico primero (Paso 2).</AlertDescription>
      </Alert>
    )
  }

  if (!preview.length) {
    return (
      <Alert>
        <AlertDescription>No hay secciones para promover (de 1° a 4°).</AlertDescription>
      </Alert>
    )
  }

  const allPromoted = preview.every((s) => promotedSections.includes(s.section_id))

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          Desmarque los alumnos que <strong>repiten</strong> de grado. Los marcados serán promovidos.
        </AlertDescription>
      </Alert>

      {preview.map((section) => {
        const isPromoted = promotedSections.includes(section.section_id)
        const sectionExcludes = excludedIds[section.section_id] || []

        return (
          <Card key={section.section_id} className={isPromoted ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {section.grade_name} - Sección {section.section_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {section.target_grade && (
                    <Badge variant="outline">
                      → {section.target_grade.name} {section.target_section?.name || ""}
                    </Badge>
                  )}
                  {isPromoted && <Badge className="bg-green-600">Promovidos</Badge>}
                </div>
              </div>
              <CardDescription>
                {section.students.length} estudiantes
                {sectionExcludes.length > 0 && ` (${sectionExcludes.length} repitentes)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {section.students.map((student) => {
                  const isExcluded = sectionExcludes.includes(student.id)
                  return (
                    <label
                      key={student.id}
                      className={`flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer hover:bg-muted ${
                        isExcluded ? "bg-red-50 dark:bg-red-900/20" : ""
                      } ${isPromoted ? "pointer-events-none" : ""}`}
                    >
                      <Checkbox
                        checked={!isExcluded}
                        onCheckedChange={() => toggleExclude(section.section_id, student.id)}
                        disabled={isPromoted}
                      />
                      <span className={isExcluded ? "line-through text-muted-foreground" : ""}>
                        {student.full_name}
                      </span>
                      {isExcluded && (
                        <Badge variant="destructive" className="text-xs ml-auto">
                          Repite
                        </Badge>
                      )}
                    </label>
                  )
                })}
              </div>
            </CardContent>
            {!isPromoted && (
              <CardFooter>
                <Button
                  onClick={() => handlePromote(section)}
                  disabled={promoteMutation.isPending}
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Promover Sección
                </Button>
              </CardFooter>
            )}
          </Card>
        )
      })}

      {allPromoted && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>Todas las secciones han sido promovidas. Puede continuar.</AlertDescription>
        </Alert>
      )}

      <ConfirmDialog
        open={!!confirmSection}
        onOpenChange={() => setConfirmSection(null)}
        title="Confirmar Promoción"
        description={
          confirmSection
            ? `¿Promover ${confirmSection.grade_name} - Sección ${confirmSection.section_name}?${
                (excludedIds[confirmSection.section_id] || []).length > 0
                  ? ` (${(excludedIds[confirmSection.section_id] || []).length} repitentes)`
                  : ""
              }`
            : ""
        }
        onConfirm={executePromotion}
        loading={promoteMutation.isPending}
      />
    </div>
  )
}

// ==================== PASO 4: EGRESAR ====================
function StepGraduate({ yearId }) {
  const [graduatedSections, setGraduatedSections] = useState([])
  const [confirmSection, setConfirmSection] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ["transition-preview", yearId],
    queryFn: () => yearTransitionApi.preview({ academic_year_id: yearId }),
    enabled: !!yearId,
  })

  const graduateMutation = useMutation({
    mutationFn: (data) => yearTransitionApi.graduate(data),
    onSuccess: (res, variables) => {
      const result = res.data.data
      toast.success(`${result.grade} - ${result.section}: ${result.graduated} egresados.`)
      setGraduatedSections((prev) => [...prev, variables.section_id])
      setConfirmSection(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Error al egresar.")
      setConfirmSection(null)
    },
  })

  const lastGradeSections = (data?.data?.data || []).filter((s) => s.is_last_grade)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!lastGradeSections.length) {
    return (
      <Alert>
        <AlertDescription>No hay alumnos de 5° grado para egresar.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Alert>
        <GraduationCap className="h-4 w-4" />
        <AlertDescription>
          Los alumnos de 5° serán marcados como <strong>egresados</strong> y desactivados.
        </AlertDescription>
      </Alert>

      {lastGradeSections.map((section) => {
        const isGraduated = graduatedSections.includes(section.section_id)

        return (
          <Card key={section.section_id} className={isGraduated ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {section.grade_name} - Sección {section.section_name}
                </CardTitle>
                {isGraduated && <Badge className="bg-green-600">Egresados</Badge>}
              </div>
              <CardDescription>{section.students.length} estudiantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {section.students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-2 p-2 rounded-md text-sm bg-muted/50"
                  >
                    <GraduationCap className="h-3 w-3 text-muted-foreground" />
                    {student.full_name}
                  </div>
                ))}
              </div>
            </CardContent>
            {!isGraduated && (
              <CardFooter>
                <Button
                  onClick={() => setConfirmSection(section)}
                  disabled={graduateMutation.isPending}
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Egresar Sección
                </Button>
              </CardFooter>
            )}
          </Card>
        )
      })}

      <ConfirmDialog
        open={!!confirmSection}
        onOpenChange={() => setConfirmSection(null)}
        title="Confirmar Egreso"
        description={
          confirmSection
            ? `¿Egresar todos los alumnos de ${confirmSection.grade_name} - Sección ${confirmSection.section_name}?`
            : ""
        }
        onConfirm={() => {
          graduateMutation.mutate({
            section_id: confirmSection.section_id,
            from_academic_year_id: yearId,
          })
        }}
        loading={graduateMutation.isPending}
      />
    </div>
  )
}

// ==================== PASO 5: FINALIZAR ====================
function StepFinalize({ yearId, newYearId, yearName, newYearName }) {
  const queryClient = useQueryClient()
  const [yearClosed, setYearClosed] = useState(false)
  const [yearActivated, setYearActivated] = useState(false)
  const [assignmentsCopied, setAssignmentsCopied] = useState(false)
  const [copyResult, setCopyResult] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  const closeMutation = useMutation({
    mutationFn: () => yearTransitionApi.closeYear({ academic_year_id: yearId }),
    onSuccess: () => {
      toast.success("Año académico cerrado.")
      setYearClosed(true)
      queryClient.invalidateQueries(["academic-years"])
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al cerrar año."),
  })

  const activateMutation = useMutation({
    mutationFn: () => yearTransitionApi.activateYear({ academic_year_id: newYearId }),
    onSuccess: () => {
      toast.success("Nuevo año académico activado.")
      setYearActivated(true)
      queryClient.invalidateQueries(["academic-years"])
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al activar año."),
  })

  const rollbackMutation = useMutation({
    mutationFn: () =>
      yearTransitionApi.rollback({
        from_academic_year_id: yearId,
        to_academic_year_id: newYearId,
      }),
    onSuccess: (res) => {
      const result = res.data.data
      toast.success(`Rollback completado: ${result.reverted} registros revertidos.`)
      queryClient.invalidateQueries()
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error en rollback."),
  })

  const copyMutation = useMutation({
    mutationFn: () =>
      yearTransitionApi.copyAssignments({
        from_academic_year_id: yearId,
        to_academic_year_id: newYearId,
      }),
    onSuccess: (res) => {
      const result = res.data.data
      setCopyResult(result)
      setAssignmentsCopied(true)
      const parts = [`${result.copied} copiadas`]
      if (result.skipped > 0) parts.push(`${result.skipped} omitidas`)
      if (result.skipped_inactive > 0) parts.push(`${result.skipped_inactive} docentes inactivos excluidos`)
      toast.success(`Asignaciones: ${parts.join(", ")}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al copiar asignaciones."),
  })

  const handleConfirm = () => {
    if (confirmAction === "close") closeMutation.mutate()
    else if (confirmAction === "activate") activateMutation.mutate()
    else if (confirmAction === "copy") copyMutation.mutate()
    else if (confirmAction === "rollback") rollbackMutation.mutate()
    setConfirmAction(null)
  }

  const confirmMessages = {
    close: {
      title: "Cerrar Año Académico",
      description: `¿Cerrar "${yearName}"? Se desactivarán periodos y asignaciones.`,
    },
    activate: {
      title: "Activar Nuevo Año",
      description: `¿Activar "${newYearName}" como año académico vigente?`,
    },
    copy: {
      title: "Copiar Asignaciones Docentes",
      description: `¿Copiar las asignaciones docentes de "${yearName}" a "${newYearName}"? Los docentes inactivos serán excluidos.`,
    },
    rollback: {
      title: "Revertir Transición",
      description: `¿Revertir la promoción de "${yearName}" a "${newYearName}"? Solo funciona si no hay asistencia registrada.`,
    },
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Cerrar Año Actual
            </CardTitle>
            <CardDescription>
              Desactiva "{yearName}", sus periodos y asignaciones docentes.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant={yearClosed ? "secondary" : "default"}
              disabled={yearClosed || closeMutation.isPending}
              onClick={() => setConfirmAction("close")}
            >
              {yearClosed ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Cerrado
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Cerrar Año
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Activar Nuevo Año
            </CardTitle>
            <CardDescription>
              Activa "{newYearName}" como el año académico vigente.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant={yearActivated ? "secondary" : "default"}
              disabled={yearActivated || !newYearId || activateMutation.isPending}
              onClick={() => setConfirmAction("activate")}
            >
              {yearActivated ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Activado
                </>
              ) : (
                <>
                  <Unlock className="mr-2 h-4 w-4" /> Activar Año
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Copiar asignaciones docentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copiar Asignaciones Docentes
          </CardTitle>
          <CardDescription>
            Copia las asignaciones docente-materia-sección de "{yearName}" a "{newYearName}". Los docentes inactivos serán excluidos automáticamente.
          </CardDescription>
        </CardHeader>
        {copyResult && (
          <CardContent>
            <div className="flex gap-2 flex-wrap text-sm">
              <Badge className="bg-green-600">{copyResult.copied} copiadas</Badge>
              {copyResult.skipped > 0 && (
                <Badge variant="secondary">{copyResult.skipped} omitidas</Badge>
              )}
              {copyResult.skipped_inactive > 0 && (
                <Badge variant="outline">{copyResult.skipped_inactive} docentes inactivos</Badge>
              )}
            </div>
          </CardContent>
        )}
        <CardFooter>
          <Button
            variant={assignmentsCopied ? "secondary" : "default"}
            disabled={assignmentsCopied || !newYearId || copyMutation.isPending}
            onClick={() => setConfirmAction("copy")}
          >
            {assignmentsCopied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Copiadas
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" /> Copiar Asignaciones
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {yearClosed && yearActivated && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            Transición completada exitosamente. El año "{newYearName}" está activo.
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <Undo2 className="h-4 w-4" />
            Revertir Transición
          </CardTitle>
          <CardDescription>
            Revierte la promoción solo si no hay asistencia registrada en el nuevo año.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="destructive"
            disabled={!newYearId || rollbackMutation.isPending}
            onClick={() => setConfirmAction("rollback")}
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Revertir
          </Button>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction ? confirmMessages[confirmAction].title : ""}
        description={confirmAction ? confirmMessages[confirmAction].description : ""}
        onConfirm={handleConfirm}
        loading={closeMutation.isPending || activateMutation.isPending || copyMutation.isPending || rollbackMutation.isPending}
      />
    </div>
  )
}

// ==================== HISTORIAL ====================
function PromotionHistory({ yearId }) {
  const { data, isLoading } = useQuery({
    queryKey: ["transition-history", yearId],
    queryFn: () => yearTransitionApi.history({ academic_year_id: yearId }),
    enabled: !!yearId,
  })

  const history = data?.data?.data || []

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    )
  }

  if (!history.length) {
    return <p className="text-sm text-muted-foreground">Sin registros de promoción.</p>
  }

  const actionLabels = {
    promovido: { label: "Promovido", variant: "default" },
    repitente: { label: "Repitente", variant: "secondary" },
    egresado: { label: "Egresado", variant: "outline" },
    retirado: { label: "Retirado", variant: "destructive" },
    trasladado: { label: "Trasladado", variant: "destructive" },
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium">Estudiante</th>
              <th className="px-4 py-2 text-left font-medium">Acción</th>
              <th className="px-4 py-2 text-left font-medium">Desde</th>
              <th className="px-4 py-2 text-left font-medium">Hacia</th>
              <th className="px-4 py-2 text-left font-medium">Ejecutado por</th>
            </tr>
          </thead>
          <tbody>
            {history.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="px-4 py-2">{log.student?.full_name || "—"}</td>
                <td className="px-4 py-2">
                  <Badge variant={actionLabels[log.action]?.variant || "secondary"}>
                    {actionLabels[log.action]?.label || log.action}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{log.from_section || "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{log.to_section || "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{log.executed_by || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== PÁGINA PRINCIPAL ====================
export default function YearTransitionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])
  const [selectedYearId, setSelectedYearId] = useState(null)
  const [selectedYearName, setSelectedYearName] = useState("")
  const [newYear, setNewYear] = useState({ name: "", start_date: "", end_date: "" })
  const [createdYear, setCreatedYear] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  // Obtener años académicos
  const { data: yearsData } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => academicYearsApi.getAll(),
  })

  const years = yearsData?.data?.data?.data || yearsData?.data?.data || []
  const activeYear = years.find((y) => y.status === true || y.status === 1)

  // Auto-seleccionar el año activo
  useEffect(() => {
    if (activeYear && !selectedYearId) {
      setSelectedYearId(activeYear.id)
      setSelectedYearName(activeYear.name)
    }
  }, [activeYear, selectedYearId])

  const markStepComplete = (step) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step])
    }
  }

  const goNext = () => {
    markStepComplete(currentStep)
    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleYearCreated = (year) => {
    setCreatedYear(year)
    markStepComplete(2)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transición de Año Escolar"
        description="Gestione la promoción de alumnos, egreso de 5° y activación del nuevo año académico."
        action={showHistory ? "Volver al Wizard" : "Ver Historial"}
        onAction={() => setShowHistory(!showHistory)}
        icon={History}
      />

      {showHistory ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label>Año académico:</Label>
            <SearchableSelect
              value={selectedYearId ? String(selectedYearId) : ""}
              onValueChange={(val) => {
                setSelectedYearId(Number(val))
                const y = years.find((yr) => yr.id === Number(val))
                if (y) setSelectedYearName(y.name)
              }}
              options={years.map((y) => ({
                value: String(y.id),
                label: `${y.name}${y.status ? " (Activo)" : ""}`,
              }))}
              placeholder="Seleccione año"
              className="w-48"
            />
          </div>
          <PromotionHistory yearId={selectedYearId} />
        </div>
      ) : (
        <>
          {/* Selector de año */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap">Año actual a transicionar:</Label>
                <SearchableSelect
                  value={selectedYearId ? String(selectedYearId) : ""}
                  onValueChange={(val) => {
                    setSelectedYearId(Number(val))
                    const y = years.find((yr) => yr.id === Number(val))
                    if (y) setSelectedYearName(y.name)
                  }}
                  options={years.map((y) => ({
                    value: String(y.id),
                    label: `${y.name}${y.status ? " (Activo)" : ""}`,
                  }))}
                  placeholder="Seleccione año"
                  className="w-48"
                />
              </div>
            </CardContent>
          </Card>

          <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

          {/* Contenido del paso */}
          <div>
            {currentStep === 1 && <StepSummary yearId={selectedYearId} />}
            {currentStep === 2 && (
              <StepCreateYear
                newYear={newYear}
                setNewYear={setNewYear}
                onCreated={handleYearCreated}
                existingNewYear={createdYear}
              />
            )}
            {currentStep === 3 && (
              <StepPromote
                yearId={selectedYearId}
                newYearId={createdYear?.id}
                onComplete={() => markStepComplete(3)}
              />
            )}
            {currentStep === 4 && <StepGraduate yearId={selectedYearId} />}
            {currentStep === 5 && (
              <StepFinalize
                yearId={selectedYearId}
                newYearId={createdYear?.id}
                yearName={selectedYearName}
                newYearName={createdYear?.name || ""}
              />
            )}
          </div>

          {/* Navegación */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={goBack} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            {currentStep < 5 && (
              <Button onClick={goNext}>
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
