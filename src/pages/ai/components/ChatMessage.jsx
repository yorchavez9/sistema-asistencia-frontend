import { User, AlertTriangle, Lightbulb, ShieldAlert, TrendingDown, Cpu, Target, Sparkles } from "lucide-react"
import AnimatedBrainIcon from "./AnimatedBrainIcon"
import { Badge } from "@/components/ui/badge"
import { PieChart } from "@mui/x-charts/PieChart"
import { BarChart } from "@mui/x-charts/BarChart"
import { CHART_SX, C } from "@/lib/chartTheme"

/* ── Text formatting ── */
function formatContent(text) {
  if (!text) return null
  const lines = text.split("\n")
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />)
      i++
      continue
    }

    if (/^\*\*(.+)\*\*$/.test(line.trim())) {
      const match = line.trim().match(/^\*\*(.+)\*\*$/)
      elements.push(<p key={i} className="font-semibold text-sm mt-2 mb-1">{match[1]}</p>)
      i++
      continue
    }

    if (/^[\-\*•]\s/.test(line.trim()) || /^\d+[\.\)]\s/.test(line.trim())) {
      const listItems = []
      while (i < lines.length && (/^[\-\*•]\s/.test(lines[i].trim()) || /^\d+[\.\)]\s/.test(lines[i].trim()))) {
        const item = lines[i].trim().replace(/^[\-\*•]\s/, "").replace(/^\d+[\.\)]\s/, "")
        listItems.push(item)
        i++
      }
      elements.push(
        <ul key={`list-${i}`} className="space-y-1 my-1">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-40 shrink-0" />
              <span>{formatInlineText(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    elements.push(<p key={i} className="text-sm leading-relaxed">{formatInlineText(line)}</p>)
    i++
  }

  return elements
}

function formatInlineText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/)
    if (boldMatch) return <strong key={i}>{boldMatch[1]}</strong>
    return part
  })
}

/* ── Charts for analysis ── */
const SEV_COLORS = { baja: "#10b981", media: "#f59e0b", alta: "#ef4444" }
const PRI_COLORS = { baja: C.primary, media: C.amber, alta: C.red }

function SeverityChart({ patrones }) {
  const counts = patrones.reduce((acc, p) => {
    const s = typeof p === "object" ? p.severidad || "media" : "media"
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})
  const data = Object.entries(counts).map(([label, value], id) => ({ id, value, label, color: SEV_COLORS[label] || "#94a3b8" }))
  if (data.length === 0) return null
  return (
    <div className="flex items-center gap-4">
      <PieChart series={[{ data, innerRadius: 18, outerRadius: 32, paddingAngle: 3, cx: 32, cy: 32 }]} width={70} height={70} slotProps={{ legend: { hidden: true } }} sx={CHART_SX} />
      <div className="space-y-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5 text-[10px]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="capitalize text-muted-foreground">{d.label}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PriorityChart({ recomendaciones }) {
  const counts = recomendaciones.reduce((acc, r) => {
    const p = typeof r === "object" ? r.prioridad || "media" : "media"
    acc[p] = (acc[p] || 0) + 1
    return acc
  }, {})
  const labels = Object.keys(counts)
  const values = Object.values(counts)
  const colors = labels.map((l) => PRI_COLORS[l] || "#94a3b8")
  if (labels.length === 0) return null
  return <BarChart xAxis={[{ data: labels, scaleType: "band" }]} series={[{ data: values, color: colors[0] }]} height={80} margin={{ top: 5, right: 5, bottom: 20, left: 5 }} slotProps={{ legend: { hidden: true } }} sx={CHART_SX} borderRadius={4} />
}

/* ── Analysis Message (full analysis with charts) ── */
function AnalysisMessage({ metadata }) {
  const rd = metadata.response_data || {}
  const patrones = Array.isArray(rd.patrones_detectados) ? rd.patrones_detectados : rd.patrones_detectados ? [rd.patrones_detectados] : []
  const recomendaciones = Array.isArray(rd.recomendaciones) ? rd.recomendaciones : rd.recomendaciones ? [rd.recomendaciones] : []
  const factores = Array.isArray(rd.factores_riesgo) ? rd.factores_riesgo : []

  const riskLevelColors = { normal: "bg-emerald-500", bajo: "bg-emerald-500", moderado: "bg-amber-500", medio: "bg-amber-500", alto: "bg-orange-500", critico: "bg-red-500" }
  const severityColors = { baja: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", media: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", alta: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
  const priorityColors = { baja: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300", media: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", alta: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }

  return (
    <div className="space-y-4">
      {/* Header pills */}
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] dark:bg-white/[0.06]  px-2.5 py-1 text-[10px] font-medium">
          <Cpu className="h-3 w-3 text-muted-foreground" />{metadata.ai_provider} / {metadata.ai_model}
        </span>
        {metadata.confidence_score != null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] dark:bg-white/[0.06]  px-2.5 py-1 text-[10px] font-medium">
            <Target className="h-3 w-3 text-muted-foreground" />Confianza: {(metadata.confidence_score * 100).toFixed(0)}%
          </span>
        )}
        {rd.nivel_riesgo && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            rd.nivel_riesgo === "alto" || rd.nivel_riesgo === "critico" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            : rd.nivel_riesgo === "moderado" || rd.nivel_riesgo === "medio" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${riskLevelColors[rd.nivel_riesgo] || "bg-gray-400"}`} />
            Riesgo {rd.nivel_riesgo}
          </span>
        )}
      </div>

      {/* Resumen */}
      {rd.resumen && (
        <div className="rounded-xl dark:bg-[#0C1013] p-3">
          <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1.5">Resumen</p>
          <p className="text-sm leading-relaxed">{rd.resumen}</p>
        </div>
      )}

      {/* Patrones */}
      {patrones.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-semibold">Patrones detectados</p>
            <Badge variant="outline" className="text-[10px]">{patrones.length}</Badge>
          </div>
          <div className="rounded-xl  dark:bg-[#0C1013] p-3"><SeverityChart patrones={patrones} /></div>
          <div className="space-y-1.5">
            {patrones.map((p, i) => {
              const isObj = typeof p === "object"
              return (
                <div key={i} className="rounded-xl  dark:bg-[#0C1013] p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">{i + 1}</span>
                    {isObj && p.tipo && <Badge variant="outline" className="text-[10px] capitalize">{p.tipo}</Badge>}
                    {isObj && p.severidad && <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${severityColors[p.severidad] || "bg-muted text-muted-foreground"}`}>{p.severidad}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-7">{typeof p === "string" ? p : p.descripcion || p.description || JSON.stringify(p)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Factores de riesgo */}
      {factores.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <p className="text-xs font-semibold">Factores de riesgo</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {factores.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 text-xs text-red-700 dark:text-red-400">
                <TrendingDown className="h-3 w-3" />{typeof f === "string" ? f : JSON.stringify(f)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {recomendaciones.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold">Recomendaciones</p>
            <Badge variant="outline" className="text-[10px]">{recomendaciones.length} acciones</Badge>
          </div>
          <div className="rounded-xl  dark:bg-[#0C1013] p-3">
            <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Distribución por prioridad</p>
            <PriorityChart recomendaciones={recomendaciones} />
          </div>
          <div className="space-y-1.5">
            {recomendaciones.map((r, i) => {
              const isObj = typeof r === "object"
              return (
                <div key={i} className="rounded-xl  dark:bg-[#0C1013] p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold mt-0.5">{i + 1}</span>
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <p className="text-sm leading-relaxed">{typeof r === "string" ? r : r.accion || r.descripcion || r.description || r.recomendacion || JSON.stringify(r)}</p>
                      {isObj && (r.prioridad || r.dirigido_a) && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {r.prioridad && <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColors[r.prioridad] || "bg-muted text-muted-foreground"}`}>Prioridad: {r.prioridad}</span>}
                          {r.dirigido_a && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"><User className="h-2.5 w-2.5" />{r.dirigido_a}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center pt-1">
        <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
          <Sparkles className="h-3 w-3" />Generado con {metadata.ai_provider} · {metadata.ai_model}
        </span>
      </div>
    </div>
  )
}

/* ── Main ChatMessage component ── */
export default function ChatMessage({ message }) {
  const isUser = message.role === "user"
  const hasAnalysis = !isUser && message.metadata?.type === "section_analysis"

  return (
    <div className={`flex items-start gap-3 px-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5 bg-primary">
        {isUser ? <User className="h-4 w-4 text-white" /> : <AnimatedBrainIcon className="h-4.5 w-4.5 text-white" />}
      </div>

      {/* Bubble */}
      <div className={`${isUser ? "rounded-xl px-3 py-2" : "rounded-2xl p-4"} ${isUser
        ? "rounded-tr-sm bg-primary text-primary-foreground max-w-[80%]"
        : hasAnalysis
          ? "rounded-tl-sm bg-card dark:bg-[#0C1013] text-foreground max-w-[90%] flex-1"
          : "rounded-tl-sm bg-card dark:bg-[#0C1013] text-foreground max-w-[80%]"
      }`}>
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : hasAnalysis ? (
          <AnalysisMessage metadata={message.metadata} />
        ) : (
          <div className="space-y-0.5">{formatContent(message.content)}</div>
        )}
      </div>
    </div>
  )
}
