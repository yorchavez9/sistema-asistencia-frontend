import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { sectionsApi, periodsApi, assignmentsApi, subjectsApi } from "@/api/endpoints"
import { useAuth } from "@/contexts/AuthContext"
import PageHeader from "@/components/shared/PageHeader"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BarChart3, User, Users, Calendar, Building2, ShieldAlert } from "lucide-react"

import StudentReportTab from "./components/StudentReportTab"
import SectionReportTab from "./components/SectionReportTab"
import PeriodReportTab from "./components/PeriodReportTab"
import InstitutionalReportTab from "./components/InstitutionalReportTab"
import RiskReportTab from "./components/RiskReportTab"

export default function ReportsPage() {
  const { hasPermission } = useAuth()
  const canViewAll = hasPermission("asistencia.ver-todo")

  const { data: sections } = useQuery({
    queryKey: ["sections-list"],
    queryFn: () => sectionsApi.getAll().then((r) => r.data.data),
  })

  const { data: periods } = useQuery({
    queryKey: ["periods-list"],
    queryFn: () => periodsApi.getAll().then((r) => r.data.data),
  })

  const { data: subjects } = useQuery({
    queryKey: ["subjects-list"],
    queryFn: () => subjectsApi.getAll().then((r) => r.data.data),
  })

  const { data: myAssignments } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: () => assignmentsApi.myAssignments().then((r) => r.data.data),
    enabled: !canViewAll,
  })

  const sectionsList = Array.isArray(sections) ? sections : sections?.data || []
  const periodsList = Array.isArray(periods) ? periods : periods?.data || []
  const subjectsList = Array.isArray(subjects) ? subjects : subjects?.data || []
  const assignmentsList = Array.isArray(myAssignments) ? myAssignments : myAssignments?.data || []

  const teacherSectionIds = useMemo(
    () => [...new Set(assignmentsList.map((a) => a.section_id))],
    [assignmentsList]
  )

  const sectionOptions = useMemo(() => {
    const list = canViewAll
      ? sectionsList
      : sectionsList.filter((s) => teacherSectionIds.includes(s.id))
    return list.map((s) => ({ value: String(s.id), label: s.full_name || s.name }))
  }, [sectionsList, canViewAll, teacherSectionIds])

  const periodOptions = useMemo(
    () => periodsList.map((p) => ({ value: String(p.id), label: p.name })),
    [periodsList]
  )

  const periodsData = useMemo(
    () => periodsList.map((p) => ({ id: p.id, name: p.name, start_date: p.start_date, end_date: p.end_date })),
    [periodsList]
  )

  const subjectOptions = useMemo(() => {
    if (canViewAll) {
      return subjectsList.map((s) => ({ value: String(s.id), label: s.name }))
    }
    const uniqueSubjects = new Map()
    assignmentsList.forEach((a) => {
      if (a.subject && !uniqueSubjects.has(a.subject.id)) {
        uniqueSubjects.set(a.subject.id, a.subject)
      }
    })
    return [...uniqueSubjects.values()].map((s) => ({ value: String(s.id), label: s.name }))
  }, [subjectsList, assignmentsList, canViewAll])

  return (
    <div className="space-y-4">
      <PageHeader title="Reportes" icon={BarChart3} />

      <Tabs defaultValue="student">
        <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-muted/50 rounded-[7px] p-1.5">
          <TabsTrigger value="student" className="px-4 py-2 text-xs sm:text-sm rounded-[5px] data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-sm">
            <User className="h-4 w-4" /> Estudiante
          </TabsTrigger>
          <TabsTrigger value="section" className="px-4 py-2 text-xs sm:text-sm rounded-[5px] data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-sm">
            <Users className="h-4 w-4" /> Sección
          </TabsTrigger>
          {canViewAll && (
            <TabsTrigger value="period" className="px-4 py-2 text-xs sm:text-sm rounded-[5px] data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-sm">
              <Calendar className="h-4 w-4" /> Periodo
            </TabsTrigger>
          )}
          {canViewAll && (
            <TabsTrigger value="institutional" className="px-4 py-2 text-xs sm:text-sm rounded-[5px] data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-sm">
              <Building2 className="h-4 w-4" /> Institucional
            </TabsTrigger>
          )}
          <TabsTrigger value="risk" className="px-4 py-2 text-xs sm:text-sm rounded-[5px] data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-sm">
            <ShieldAlert className="h-4 w-4" /> En Riesgo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="student">
          <StudentReportTab sectionOptions={sectionOptions} />
        </TabsContent>

        <TabsContent value="section">
          <SectionReportTab sectionOptions={sectionOptions} subjectOptions={subjectOptions} periodOptions={periodOptions} periodsData={periodsData} />
        </TabsContent>

        {canViewAll && (
          <TabsContent value="period">
            <PeriodReportTab periodOptions={periodOptions} />
          </TabsContent>
        )}

        {canViewAll && (
          <TabsContent value="institutional">
            <InstitutionalReportTab />
          </TabsContent>
        )}

        <TabsContent value="risk">
          <RiskReportTab teacherSectionIds={teacherSectionIds} canViewAll={canViewAll} subjectOptions={subjectOptions} periodOptions={periodOptions} periodsData={periodsData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
