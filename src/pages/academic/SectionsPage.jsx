import { useQuery } from "@tanstack/react-query"
import CrudPage from "@/components/shared/CrudPage"
import { sectionsApi, gradesApi } from "@/api/endpoints"

export default function SectionsPage() {
  const { data: grades } = useQuery({
    queryKey: ["grades-list"],
    queryFn: () => gradesApi.getAll().then((r) => r.data.data),
  })

  const gradesList = Array.isArray(grades) ? grades : grades?.data || []

  const columns = [
    { key: "name", label: "Nombre" },
    {
      key: "grade_id", label: "Grado",
      render: (item) => item.grade?.name || "-",
    },
    {
      key: "students_count", label: "Estudiantes",
      render: (item) => item.students_count ?? "-",
    },
    { key: "status", label: "Estado" },
  ]

  const fields = [
    { name: "name", label: "Nombre", required: true, placeholder: "Ej: A" },
    {
      name: "grade_id", label: "Grado", type: "select", searchable: true, required: true,
      options: gradesList.map((g) => ({ value: String(g.id), label: g.name })),
    },
    {
      name: "status", label: "Estado", type: "select", searchable: true, defaultValue: "1",
      options: [
        { value: "1", label: "Activo" },
        { value: "0", label: "Inactivo" },
      ],
    },
  ]

  return (
    <CrudPage
      title="Secciones"
      queryKey="sections"
      api={sectionsApi}
      columns={columns}
      fields={fields}
      permissions={{
        view: "secciones.ver",
        create: "secciones.crear",
        edit: "secciones.editar",
        delete: "secciones.eliminar",
      }}
    />
  )
}
