import { useState, useRef, useEffect } from "react"
import { Calendar } from "./calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { es } from "react-day-picker/locale"

function DatePicker({ value, onChange, disabled, minDate, maxDate, className }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const selected = value ? new Date(value + "T00:00:00") : undefined

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr + "T00:00:00")
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  const handleSelect = (day) => {
    if (day) {
      const yyyy = day.getFullYear()
      const mm = String(day.getMonth() + 1).padStart(2, "0")
      const dd = String(day.getDate()).padStart(2, "0")
      onChange(`${yyyy}-${mm}-${dd}`)
    }
    setOpen(false)
  }

  const disabledDays = []
  if (minDate) disabledDays.push({ before: new Date(minDate + "T00:00:00") })
  if (maxDate) disabledDays.push({ after: new Date(maxDate + "T00:00:00") })

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-lg border border-input bg-transparent py-2 px-2.5 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
          !value && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left truncate">
          {formatDateDisplay(value) || "Seleccionar fecha"}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 rounded-lg bg-popover text-popover-foreground shadow-lg">
          <Calendar
            mode="single"
            locale={es}
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            disabled={disabledDays}
          />
        </div>
      )}
    </div>
  )
}

export { DatePicker }
