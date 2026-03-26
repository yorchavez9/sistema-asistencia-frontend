import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { sectionsApi } from "@/api/endpoints"
import { formatDate } from "@/lib/formatDate"
import { Button } from "@/components/ui/button"
import SearchableSelect from "@/components/shared/SearchableSelect"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Plus, Trash2 } from "lucide-react"
import AnimatedBrainIcon from "./AnimatedBrainIcon"

function SidebarContent({ conversations, activeId, onSelect, onDelete, onCreate, onAnalyzeSection, analyzing }) {
  const [sectionId, setSectionId] = useState("")

  const { data: sections } = useQuery({
    queryKey: ["sections-list"],
    queryFn: () => sectionsApi.getAll().then((r) => r.data.data),
  })

  const sectionsList = Array.isArray(sections) ? sections : sections?.data || []

  return (
    <div className="flex flex-col h-full">
      {/* ── Top fixed: Analysis section ── */}
      <div className="px-3 pt-3 pb-2 space-y-2.5 shrink-0">
        <SearchableSelect
          value={sectionId}
          onValueChange={setSectionId}
          options={sectionsList.map((s) => ({ value: String(s.id), label: s.full_name || s.name }))}
          placeholder="Buscar sección..."
        />
        <Button
          onClick={() => { onAnalyzeSection(sectionId); setSectionId("") }}
          disabled={!sectionId || analyzing}
          className="w-full gap-2 rounded-xl h-10 bg-primary hover:bg-primary/90"
        >
          {analyzing ? (
            <><AnimatedBrainIcon className="h-4 w-4" animate />Analizando...</>
          ) : (
            <><AnimatedBrainIcon className="h-4 w-4" />Analizar con IA</>
          )}
        </Button>

        {/* Spacer */}
        <div className="h-px" />

        <Button onClick={onCreate} variant="outline" className="w-full gap-2 rounded-xl h-9" size="sm">
          <Plus className="h-4 w-4" />Nueva conversación
        </Button>
      </div>

      {/* ── Scrollable: Conversations list ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-3 pb-3 space-y-0.5">
          {conversations?.map((conv) => (
            <div
              key={conv.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(conv.id)}
              onKeyDown={(e) => { if (e.key === "Enter") onSelect(conv.id) }}
              className={`group w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left cursor-pointer transition-colors ${
                activeId === conv.id
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <p className="flex-1 truncate text-sm">{conv.title}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
                className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded hover:text-red-500 transition-all"
                title="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {(!conversations || conversations.length === 0) && (
            <p className="text-xs text-muted-foreground text-center py-6">Sin conversaciones aún</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* Desktop sidebar */
export function DesktopSidebar({ conversations, activeId, onSelect, onDelete, onCreate, onAnalyzeSection, analyzing }) {
  return (
    <div className="hidden md:flex w-80 flex-col bg-card dark:bg-[#0C1013] shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <AnimatedBrainIcon className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-none">Asistente IA</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Análisis inteligente</p>
          </div>
        </div>
      </div>
      <SidebarContent conversations={conversations} activeId={activeId} onSelect={onSelect} onDelete={onDelete} onCreate={onCreate} onAnalyzeSection={onAnalyzeSection} analyzing={analyzing} />
    </div>
  )
}

/* Mobile sidebar */
export function MobileSidebar({ open, onOpenChange, conversations, activeId, onSelect, onDelete, onCreate, onAnalyzeSection, analyzing }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 dark:bg-[#0C1013]">
        <SheetHeader className="px-4 py-3">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <AnimatedBrainIcon className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Asistente IA</p>
              <p className="text-[10px] text-muted-foreground font-normal mt-0.5">Análisis inteligente</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <SidebarContent
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => { onSelect(id); onOpenChange(false) }}
          onDelete={onDelete}
          onCreate={() => { onCreate(); onOpenChange(false) }}
          onAnalyzeSection={(id) => { onAnalyzeSection(id); onOpenChange(false) }}
          analyzing={analyzing}
        />
      </SheetContent>
    </Sheet>
  )
}
