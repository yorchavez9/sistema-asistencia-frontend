import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { attendanceApi, assignmentsApi, sectionsApi, studentsApi } from "@/api/endpoints"
import PageHeader from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import SearchableSelect from "@/components/shared/SearchableSelect"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "presente", label: "P", fullLabel: "Presente", variant: "default", activeClass: "bg-green-600 text-white border-green-600" },
  { value: "tardanza", label: "T", fullLabel: "Tardanza", variant: "secondary", activeClass: "bg-yellow-500 text-white border-yellow-500" },
  { value: "falta_justificada", label: "FJ", fullLabel: "F. Justificada", variant: "outline", activeClass: "bg-blue-500 text-white border-blue-500" },
  { value: "falta_injustificada", label: "FI", fullLabel: "F. Injustificada", variant: "destructive", activeClass: "bg-red-600 text-white border-red-600" },
]

export default function AttendanceManagementPage() {
  const queryClient = useQueryClient()
  const today = new Date().toISOString().split("T")[0]

  const [sectionId, setSectionId] = useState("")
  const [date, setDate] = useState(today)
  const [assignmentId, setAssignmentId] = useState("")
  const [attendances, setAttendances] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // Fetch all sections
  const { data: sections } = useQuery({
    queryKey: ["all-sections"],
    queryFn: () => sectionsApi.getAll().then((r) => r.data.data),
  })
  const sectionsList = Array.isArray(sections) ? sections : sections?.data || []

  // Fetch assignments for selected section
  const { data: sectionAssignments } = useQuery({
    queryKey: ["section-assignments", sectionId],
    queryFn: () => assignmentsApi.getBySection(sectionId).then((r) => r.data.data),
    enabled: !!sectionId,
  })
  const assignmentsList = Array.isArray(sectionAssignments) ? sectionAssignments : sectionAssignments?.data || []

  // Fetch students for selected section
  const { data: students } = useQuery({
    queryKey: ["section-students", sectionId],
    queryFn: () => studentsApi.getBySection(sectionId).then((r) => r.data.data),
    enabled: !!sectionId,
  })
  const studentsList = Array.isArray(students) ? students : students?.data || []

  const selectedAssignment = assignmentsList.find((a) => String(a.id) === assignmentId)

  const handleSectionChange = (v) => {
    setSectionId(v)
    setAssignmentId("")
    setAttendances([])
    setLoaded(false)
  }

  const handleLoad = async () => {
    if (!assignmentId || !date) return
    setLoadingData(true)
    try {
      const checkRes = await attendanceApi.checkRegistered(assignmentId, date)
      const isReg = checkRes.data?.data?.registered || checkRes.data?.registered

      if (isReg) {
        const attRes = await attendanceApi.getByAssignmentAndDate({
          teacher_assignment_id: assignmentId, date,
        })
        const attData = attRes.data?.data || attRes.data || []
        const attList = Array.isArray(attData) ? attData : attData?.data || []
        setAttendances(
          attList.map((a) => ({
            student_id: a.student_id,
            status: a.status,
            observation: a.observation || "",
          }))
        )
        setIsEditing(true)
      } else {
        setAttendances(
          studentsList.map((s) => ({
            student_id: s.id,
            status: "presente",
            observation: "",
          }))
        )
        setIsEditing(false)
      }
      setLoaded(true)
    } catch {
      toast.error("Error al cargar datos de asistencia")
    } finally {
      setLoadingData(false)
    }
  }

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing ? attendanceApi.bulkUpdate(data) : attendanceApi.bulkStore(data),
    onSuccess: () => {
      toast.success(isEditing ? "Asistencia actualizada" : "Asistencia registrada")
      queryClient.invalidateQueries({ queryKey: ["attendance-check"] })
      setIsEditing(true)
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error al guardar"),
  })

  const handleSave = () => {
    saveMutation.mutate({
      teacher_assignment_id: Number(assignmentId),
      date,
      attendances,
    })
  }

  const updateStatus = (studentId, status) => {
    setAttendances((prev) =>
      prev.map((a) => (a.student_id === studentId ? { ...a, status } : a))
    )
  }

  const updateObservation = (studentId, observation) => {
    setAttendances((prev) =>
      prev.map((a) => (a.student_id === studentId ? { ...a, observation } : a))
    )
  }

  const getStudentName = (studentId) => {
    const s = studentsList.find((st) => st.id === studentId)
    return s ? `${s.last_name}, ${s.first_name}` : "-"
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Control de Asistencia" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
        <div className="space-y-1 flex-1 min-w-[180px] max-w-xs">
          <label className="text-sm font-medium">Sección</label>
          <SearchableSelect
            value={sectionId}
            onValueChange={handleSectionChange}
            options={sectionsList.map((s) => ({
              value: String(s.id),
              label: s.grade?.name ? `${s.grade.name} "${s.name}"` : s.name,
            }))}
            placeholder="Seleccionar sección"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha</label>
          <DatePicker
            value={date}
            onChange={(v) => { setDate(v); setLoaded(false) }}
            maxDate={today}
            className="w-52"
          />
        </div>
        <div className="space-y-1 flex-1 min-w-[180px] max-w-xs">
          <label className="text-sm font-medium">Curso / Materia</label>
          <SearchableSelect
            value={assignmentId}
            onValueChange={(v) => { setAssignmentId(v); setLoaded(false) }}
            options={assignmentsList.map((a) => ({
              value: String(a.id),
              label: `${a.subject?.name || "Sin materia"} - ${a.teacher?.name || a.teacher?.last_name || "Sin docente"}`,
            }))}
            placeholder={sectionId ? "Seleccionar curso" : "Primero seleccione sección"}
          />
        </div>
        <Button onClick={handleLoad} disabled={!assignmentId || !date || loadingData}>
          {loadingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cargar
        </Button>
      </div>

      {/* Summary badges */}
      {loaded && attendances.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => {
            const count = attendances.filter((a) => a.status === opt.value).length
            return (
              <Badge key={opt.value} variant={opt.variant}>
                {opt.fullLabel}: {count}
              </Badge>
            )
          })}
        </div>
      )}

      {/* Attendance table - Desktop */}
      {loaded && attendances.length > 0 && (
        <>
          <div className="hidden sm:block rounded-xl bg-muted/30 dark:bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Observación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.map((att, idx) => (
                  <TableRow key={att.student_id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{getStudentName(att.student_id)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            title={opt.fullLabel}
                            onClick={() => updateStatus(att.student_id, opt.value)}
                            className={cn(
                              "h-7 min-w-[28px] px-1.5 rounded-md border text-xs font-semibold transition-colors",
                              att.status === opt.value
                                ? opt.activeClass
                                : "bg-muted/60 text-muted-foreground hover:bg-accent"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={att.observation}
                        onChange={(e) => updateObservation(att.student_id, e.target.value)}
                        placeholder="Opcional..."
                        className="h-8"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: cards */}
          <div className="sm:hidden space-y-2">
            {attendances.map((att, idx) => (
              <div key={att.student_id} className="rounded-xl bg-muted/40 dark:bg-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                    {getStudentName(att.student_id)}
                  </span>
                </div>
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateStatus(att.student_id, opt.value)}
                      className={cn(
                        "h-8 flex-1 rounded-md border text-xs font-semibold transition-colors",
                        att.status === opt.value
                          ? opt.activeClass
                          : "bg-muted/60 text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <Input
                  value={att.observation}
                  onChange={(e) => updateObservation(att.student_id, e.target.value)}
                  placeholder="Observación (opcional)"
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </>
      )}

      {loaded && attendances.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No se encontraron estudiantes para esta sección.
        </div>
      )}
    </div>
  )
}
