import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { attendanceApi, assignmentsApi, studentsApi } from "@/api/endpoints"
import PageHeader from "@/components/shared/PageHeader"
import DataTable from "@/components/shared/DataTable"
import useClientPagination from "@/hooks/useClientPagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import SearchableSelect from "@/components/shared/SearchableSelect"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Save, CheckCircle, ClipboardList } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "presente", label: "P", fullLabel: "Presente", variant: "default", activeClass: "bg-green-600 text-white border-green-600" },
  { value: "tardanza", label: "T", fullLabel: "Tardanza", variant: "secondary", activeClass: "bg-yellow-500 text-white border-yellow-500" },
  { value: "falta_justificada", label: "FJ", fullLabel: "F. Justificada", variant: "outline", activeClass: "bg-blue-500 text-white border-blue-500" },
  { value: "falta_injustificada", label: "FI", fullLabel: "F. Injustificada", variant: "destructive", activeClass: "bg-red-600 text-white border-red-600" },
]

export default function AttendancePage() {
  const queryClient = useQueryClient()
  const [assignmentId, setAssignmentId] = useState("")
  const today = new Date().toISOString().split("T")[0]
  const [date, setDate] = useState(today)
  const [attendances, setAttendances] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: assignments } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: () => assignmentsApi.myAssignments().then((r) => r.data.data),
  })

  const { data: myCourses, isLoading: loadingCourses } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => attendanceApi.myCourses().then((r) => r.data.data || r.data),
  })

  const assignmentsList = Array.isArray(assignments) ? assignments : assignments?.data || []
  const coursesList = Array.isArray(myCourses) ? myCourses : myCourses?.data || []
  const selectedAssignment = assignmentsList.find((a) => String(a.id) === assignmentId)

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["section-students", selectedAssignment?.section_id],
    queryFn: () => studentsApi.getBySection(selectedAssignment.section_id).then((r) => r.data.data),
    enabled: !!selectedAssignment?.section_id,
  })

  const { data: existing } = useQuery({
    queryKey: ["attendance-check", assignmentId, date],
    queryFn: () => attendanceApi.checkRegistered(assignmentId, date).then((r) => r.data),
    enabled: !!assignmentId && !!date,
  })

  const studentsList = Array.isArray(students) ? students : students?.data || []
  const isRegistered = existing?.registered === true

  const initAttendances = () => {
    if (date !== today) {
      toast.error("Solo se puede registrar asistencia para el día de hoy")
      return
    }
    if (isRegistered && existing?.attendances) {
      setAttendances(
        existing.attendances.map((a) => ({
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
    setModalOpen(true)
  }

  const openFromCourse = async (courseAssignmentId) => {
    const today = new Date().toISOString().split("T")[0]
    setAssignmentId(String(courseAssignmentId))
    setDate(today)
    try {
      const checkRes = await attendanceApi.checkRegistered(courseAssignmentId, today)
      const isReg = checkRes.data?.data?.registered || checkRes.data?.registered
      const assignment = assignmentsList.find((a) => a.id === courseAssignmentId)
      const sectionId = assignment?.section_id

      if (isReg) {
        const attRes = await attendanceApi.getByAssignmentAndDate({
          teacher_assignment_id: courseAssignmentId, date: today,
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
      } else if (sectionId) {
        const studRes = await studentsApi.getBySection(sectionId)
        const studs = studRes.data?.data?.data || studRes.data?.data || []
        setAttendances(
          (Array.isArray(studs) ? studs : []).map((s) => ({
            student_id: s.id,
            status: "presente",
            observation: "",
          }))
        )
        setIsEditing(false)
      }
      setModalOpen(true)
    } catch {
      toast.error("Error al cargar datos de asistencia")
    }
  }

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing ? attendanceApi.bulkUpdate(data) : attendanceApi.bulkStore(data),
    onSuccess: () => {
      toast.success(isEditing ? "Asistencia actualizada" : "Asistencia registrada")
      queryClient.invalidateQueries({ queryKey: ["attendance-check", assignmentId, date] })
      queryClient.invalidateQueries({ queryKey: ["my-courses"] })
      setModalOpen(false)
      setAttendances([])
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

  const assignmentLabel = selectedAssignment
    ? `${selectedAssignment.subject?.name} - ${selectedAssignment.section?.full_name || selectedAssignment.section?.name}`
    : ""

  // DataTable columns for "Mis cursos"
  const coursesColumns = [
    {
      key: "subject", label: "Materia", primary: true,
      render: (c) => <span className="font-medium">{(c.assignment || c).subject?.name || "-"}</span>,
    },
    {
      key: "section", label: "Sección",
      render: (c) => {
        const a = c.assignment || c
        return a.section?.full_name || a.section?.name || "-"
      },
    },
    {
      key: "status_today", label: "Estado hoy",
      render: (c) => (
        <Badge variant={c.registered_today ? "default" : "outline"}>
          {c.registered_today ? `Registrado (${c.today_count || 0})` : "Pendiente"}
        </Badge>
      ),
    },
  ]

  const { data: paginatedCourses, pagination: coursesPagination, onPageChange, onPerPageChange, sortKey, sortDirection, onSortChange } =
    useClientPagination(coursesList, 10)

  return (
    <div className="space-y-4">
      <PageHeader title="Registro de Asistencia" />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="space-y-1 flex-1 max-w-xs">
          <label className="text-sm font-medium">Asignación</label>
          <SearchableSelect
            value={assignmentId}
            onValueChange={(v) => { setAssignmentId(v); setAttendances([]) }}
            options={assignmentsList.map((a) => ({ value: String(a.id), label: `${a.subject?.name} - ${a.section?.full_name || a.section?.name}` }))}
            placeholder="Seleccionar curso"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha</label>
          <DatePicker
            value={date}
            onChange={(v) => { setDate(v); setAttendances([]) }}
            minDate={today}
            maxDate={today}
            className="w-52"
          />
        </div>
        <Button onClick={initAttendances} disabled={!assignmentId || !date || loadingStudents}>
          {isRegistered ? "Editar asistencia" : "Iniciar registro"}
        </Button>
      </div>

      {isRegistered && !modalOpen && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
          <CheckCircle className="h-4 w-4" />
          Asistencia ya registrada para esta fecha. Pulse "Editar asistencia" para modificar.
        </div>
      )}

      {/* Tabla de mis cursos con DataTable */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Mis cursos - Estado de hoy
        </h3>
        <DataTable
          columns={coursesColumns}
          data={paginatedCourses}
          pagination={coursesPagination}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          loading={loadingCourses}
          emptyMessage="No tiene asignaciones"
          actions={(c) => {
            const a = c.assignment || c
            return (
              <Button
                variant={c.registered_today ? "outline" : "default"}
                size="sm"
                onClick={() => openFromCourse(a.id)}
              >
                {c.registered_today ? "Ver/Editar" : "Registrar"}
              </Button>
            )
          }}
        />
      </div>

      {/* Modal de asistencia - NO se modifica, mantiene tabla interactiva original */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] h-[90vh] sm:h-auto flex flex-col p-0 sm:p-4 gap-0 sm:gap-4">
          <DialogHeader className="px-4 pt-4 sm:px-0 sm:pt-0">
            <DialogTitle>Registro de Asistencia</DialogTitle>
            <div className="flex flex-col sm:flex-row sm:gap-x-4 gap-y-1 text-sm text-muted-foreground pt-1">
              <span><span className="font-medium text-foreground">Asignación:</span> {assignmentLabel}</span>
              <span><span className="font-medium text-foreground">Fecha:</span> {date}</span>
            </div>
          </DialogHeader>

          <div className="flex gap-2 flex-wrap px-4 sm:px-0">
            {STATUS_OPTIONS.map((opt) => {
              const count = attendances.filter((a) => a.status === opt.value).length
              return (
                <Badge key={opt.value} variant={opt.variant}>
                  {opt.fullLabel}: {count}
                </Badge>
              )
            })}
          </div>

          {/* Desktop: tabla */}
          <div className="flex-1 overflow-y-auto hidden sm:block rounded-xl bg-muted/30 dark:bg-card overflow-hidden">
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

          {/* Mobile: cards apiladas */}
          <div className="flex-1 overflow-y-auto sm:hidden px-4 space-y-2">
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

          <DialogFooter className="px-4 pb-4 sm:px-0 sm:pb-0">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
