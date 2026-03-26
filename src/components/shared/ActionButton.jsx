import { cn } from "@/lib/utils"

const presets = {
  view: {
    bg: "bg-blue-500 hover:bg-blue-600",
    title: "Ver",
  },
  edit: {
    bg: "bg-amber-500 hover:bg-amber-600",
    title: "Editar",
  },
  delete: {
    bg: "bg-red-500 hover:bg-red-600",
    title: "Eliminar",
  },
  toggle: {
    bg: "bg-emerald-500 hover:bg-emerald-600",
    title: "Estado",
  },
  permissions: {
    bg: "bg-violet-500 hover:bg-violet-600",
    title: "Permisos",
  },
  resolve: {
    bg: "bg-emerald-500 hover:bg-emerald-600",
    title: "Resolver",
  },
}

export default function ActionButton({ preset, icon: Icon, onClick, title, className, disabled }) {
  const p = presets[preset] || presets.view

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || p.title}
      className={cn(
        "inline-flex items-center justify-center size-6 rounded-md transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:opacity-50 disabled:pointer-events-none",
        "active:scale-95 shadow-sm",
        p.bg,
        className,
      )}
    >
      <Icon className="size-3.5 text-white" />
    </button>
  )
}
