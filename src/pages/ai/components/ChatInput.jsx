import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { SendHorizonal } from "lucide-react"

export default function ChatInput({ onSend, disabled }) {
  const textareaRef = useRef(null)

  const handleSubmit = () => {
    const value = textareaRef.current?.value?.trim()
    if (!value || disabled) return
    onSend(value)
    textareaRef.current.value = ""
    textareaRef.current.style.height = "auto"
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e) => {
    const el = e.target
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 160) + "px"
  }

  return (
    <div className="bg-background dark:bg-[#0C1013] p-4 shrink-0">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          rows={1}
          placeholder="Escribe un mensaje sobre asistencia estudiantil..."
          className="flex-1 resize-none rounded-xl bg-card dark:bg-[#131920] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-50 max-h-40"
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled}
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl"
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
