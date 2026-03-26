import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const target = typeof value === "number" ? value : parseFloat(value) || 0
    if (target === 0) { setDisplay(0); return }
    const duration = 800
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target))
      if (progress < 1) ref.current = requestAnimationFrame(step)
    }
    ref.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(ref.current)
  }, [value])

  return <>{display}{suffix}</>
}

export default function ReportSummaryCards({ items = [] }) {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <Card key={i} className="overflow-hidden">
            <CardContent className="pt-3 pb-2 relative">
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.04]"
                style={{ backgroundColor: item.color, transform: "translate(30%, -30%)" }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {item.title}
                  </p>
                  <p className="text-xl font-bold mt-1 tracking-tight">
                    <AnimatedNumber value={item.value} suffix={item.suffix || ""} />
                  </p>
                </div>
                {Icon && (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${item.color}12` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
