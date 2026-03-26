import CrudPage from "@/components/shared/CrudPage"
import { subjectsApi } from "@/api/endpoints"

const columns = [
  { key: "code", label: "Código" },
  { key: "name", label: "Nombre" },
  { key: "description", label: "Descripción" },
  { key: "status", label: "Estado" },
]

const fields = [
  { name: "code", label: "Código", required: true, placeholder: "Ej: MAT-01" },
  { name: "name", label: "Nombre", required: true, placeholder: "Ej: Matemáticas" },
  { name: "description", label: "Descripción", type: "textarea", placeholder: "Descripción de la materia" },
  {
    name: "status", label: "Estado", type: "select", searchable: true, defaultValue: "1",
    options: [
      { value: "1", label: "Activo" },
      { value: "0", label: "Inactivo" },
    ],
  },
]

export default function SubjectsPage() {
  return (
    <CrudPage
      title="Materias"
      queryKey="subjects"
      api={subjectsApi}
      columns={columns}
      fields={fields}
      permissions={{
        view: "materias.ver",
        create: "materias.crear",
        edit: "materias.editar",
        delete: "materias.eliminar",
      }}
    />
  )
}
