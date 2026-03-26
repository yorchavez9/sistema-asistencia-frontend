import CrudPage from "@/components/shared/CrudPage"
import { academicYearsApi } from "@/api/endpoints"
import { formatDate } from "@/lib/formatDate"

const columns = [
  { key: "name", label: "Nombre" },
  { key: "start_date", label: "Inicio", render: (r) => formatDate(r.start_date) },
  { key: "end_date", label: "Fin", render: (r) => formatDate(r.end_date) },
  { key: "status", label: "Estado" },
]

const fields = [
  { name: "name", label: "Nombre", required: true, placeholder: "Ej: 2026" },
  { name: "start_date", label: "Fecha inicio", type: "date", required: true },
  { name: "end_date", label: "Fecha fin", type: "date", required: true },
  {
    name: "status", label: "Estado", type: "select", searchable: true,
    defaultValue: "1",
    options: [
      { value: "1", label: "Activo" },
      { value: "0", label: "Inactivo" },
    ],
  },
]

export default function AcademicYearsPage() {
  return (
    <CrudPage
      title="Años Académicos"
      queryKey="academic-years"
      api={academicYearsApi}
      columns={columns}
      fields={fields}
      permissions={{
        view: "anios.ver",
        create: "anios.crear",
        edit: "anios.editar",
        delete: "anios.eliminar",
      }}
    />
  )
}
