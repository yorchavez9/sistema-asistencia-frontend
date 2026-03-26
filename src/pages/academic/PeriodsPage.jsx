import { useQuery } from "@tanstack/react-query"
import CrudPage from "@/components/shared/CrudPage"
import { periodsApi, academicYearsApi } from "@/api/endpoints"
import { formatDate } from "@/lib/formatDate"

export default function PeriodsPage() {
  const { data: years } = useQuery({
    queryKey: ["academic-years-list"],
    queryFn: () => academicYearsApi.getAll().then((r) => r.data.data),
  })

  const yearsList = Array.isArray(years) ? years : years?.data || []

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "number", label: "Número" },
    {
      key: "academic_year_id", label: "Año Académico",
      render: (item) => item.academic_year?.name || "-",
    },
    { key: "start_date", label: "Inicio", render: (r) => formatDate(r.start_date) },
    { key: "end_date", label: "Fin", render: (r) => formatDate(r.end_date) },
    { key: "status", label: "Estado" },
  ]

  const fields = [
    { name: "name", label: "Nombre", required: true, placeholder: "Ej: Bimestre I" },
    { name: "number", label: "Número", type: "number", required: true, placeholder: "Ej: 1" },
    {
      name: "academic_year_id", label: "Año Académico", type: "select", searchable: true, required: true,
      options: yearsList.map((y) => ({ value: String(y.id), label: y.name })),
    },
    { name: "start_date", label: "Fecha inicio", type: "date", required: true },
    { name: "end_date", label: "Fecha fin", type: "date", required: true },
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
      title="Periodos"
      queryKey="periods"
      api={periodsApi}
      columns={columns}
      fields={fields}
      permissions={{
        view: "periodos.ver",
        create: "periodos.crear",
        edit: "periodos.editar",
        delete: "periodos.eliminar",
      }}
    />
  )
}
