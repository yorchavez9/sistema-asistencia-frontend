import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { chatApi } from "@/api/endpoints"
import { toast } from "sonner"
import { PanelLeft, Sparkles } from "lucide-react"
import AnimatedBrainIcon from "./AnimatedBrainIcon"
import ChatMessage from "./ChatMessage"
import ChatInput from "./ChatInput"
import ThinkingIndicator from "./ThinkingIndicator"

const SUGGESTIONS = [
  "¿Cuáles son los patrones de inasistencia más comunes?",
  "Analiza la asistencia de mi sección",
  "¿Qué estudiantes están en riesgo?",
  "Dame recomendaciones para mejorar la asistencia",
]

const SVG_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='%239C92AC' fill-opacity='0.12'%3E%3Cpath d='M20 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 4c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm-2 14l-4-4 1.4-1.4L18 25.2l6.6-6.6L26 20l-8 8zM52 18h8v2h-8v-2zm12 0h4v2h-4v-2zM50 34c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-6c-1.1 0-2-.9-2-2v-6zm2 0v6h6v-6h-6zM30 54c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2H32c-1.1 0-2-.9-2-2v-2zm2 0v2h12v-2H32zM80 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm4-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 42h2v4h-2v-4zm6 0h2v4h-2v-4zm-3 6h2v2h-2v-2zM110 14l4 4-1.4 1.4-4-4 1.4-1.4zm-2 8l-4-4 1.4-1.4 4 4-1.4 1.4zM140 30c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm20-10h2v8h-2v-8zm4 2h2v4h-2v-4zM10 80l6 6-1.4 1.4L10 82.8l-4.6 4.6L4 86l6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm50-2h12v2H60v-2zm16 0h4v2h-4v-2zM42 98c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-8c-1.1 0-2-.9-2-2v-4zm2 0v4h8v-4h-8zm60-18c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm28 10h2v6h-2v-6zm4 2h2v2h-2v-2zm-54 20c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-6c-1.1 0-2-.9-2-2v-6zm2 0v6h6v-6h-6zm-40 16l4 4-1.4 1.4-4-4 1.4-1.4zm8 0l-4 4 1.4 1.4 4-4-1.4-1.4zm90-46c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm20 26h8v2h-8v-2zm-10 6h2v8h-2v-8zm4 2h2v4h-2v-4zm-84 24c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm30-14l4 4-1.4 1.4-4-4 1.4-1.4zm2 8l-4-4 1.4-1.4 4 4-1.4 1.4zm60-24c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-8c-1.1 0-2-.9-2-2v-4zm2 0v4h8v-4h-8zm-8 30h12v2h-12v-2zm16 0h4v2h-4v-2zm-78 14l6 6-1.4 1.4L90 172.8l-4.6 4.6L84 176l6-6zm48 0c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm40-6h2v8h-2v-8zm4 2h2v4h-2v-4zm-168 16h8v2H10v-2zm12 0h4v2h-4v-2z'/%3E%3C/g%3E%3C/svg%3E")`

function WelcomeScreen({ onSuggestionClick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto dark:bg-[#0C1013]" style={{ backgroundImage: SVG_PATTERN }}>
      <div className="relative mb-5" style={{ width: 48, height: 48 }}>
        {/* Pulse rings like heartbeat */}
        <span
          className="absolute rounded-full bg-primary"
          style={{ inset: -6, animation: "welcome-ping 4s ease-out infinite" }}
        />
        <span
          className="absolute rounded-full bg-primary"
          style={{ inset: -3, animation: "welcome-ping 4s ease-out infinite 1s" }}
        />
        {/* Main circle with heartbeat */}
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/25"
          style={{ animation: "welcome-heartbeat 3.5s ease-in-out infinite" }}
        >
          <AnimatedBrainIcon className="h-6 w-6 text-white" animate />
        </div>
        <style>{`
          @keyframes welcome-ping {
            0% { opacity: 0.3; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.6); }
          }
          @keyframes welcome-heartbeat {
            0%, 100% { transform: scale(1); }
            15% { transform: scale(1.12); }
            30% { transform: scale(0.92); }
            45% { transform: scale(1.08); }
            60% { transform: scale(0.96); }
            75% { transform: scale(1); }
          }
        `}</style>
      </div>
      <h2 className="text-xl font-semibold mb-2">¿En qué puedo ayudarte?</h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-md">
        Soy tu asistente de análisis de asistencia estudiantil. Puedo ayudarte a identificar patrones, estudiantes en riesgo y darte recomendaciones.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestionClick(s)}
            className="rounded-xl bg-card dark:bg-[#131920] p-4 text-left text-sm hover:bg-muted transition-colors"
          >
            <Sparkles className="h-4 w-4 text-primary mb-2" />
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ChatArea({ conversationId, onToggleSidebar, onNewConversation, analyzing }) {
  const queryClient = useQueryClient()
  const scrollRef = useRef(null)
  const [optimisticMessages, setOptimisticMessages] = useState([])

  const { data: messagesData } = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: () => chatApi.getMessages(conversationId).then((r) => r.data.data || r.data),
    enabled: !!conversationId,
  })

  const messages = messagesData || []

  const sendMutation = useMutation({
    mutationFn: ({ conversationId: cId, message }) =>
      chatApi.sendMessage(cId, { message }).then((r) => r.data.data || r.data),
    onSuccess: () => {
      setOptimisticMessages([])
      queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] })
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] })
    },
    onError: (err) => {
      setOptimisticMessages([])
      toast.error(err.response?.data?.message || "Error al enviar mensaje")
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, optimisticMessages, sendMutation.isPending])

  const handleSend = async (text) => {
    let cId = conversationId

    if (!cId) {
      try {
        const res = await chatApi.createConversation({ title: text.substring(0, 50) })
        const conv = res.data.data || res.data
        cId = conv.id
        onNewConversation(cId)
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] })
      } catch {
        toast.error("Error al crear conversación")
        return
      }
    }

    setOptimisticMessages([{ id: "opt-user", role: "user", content: text }])
    sendMutation.mutate({ conversationId: cId, message: text })
  }

  const allMessages = [...messages, ...optimisticMessages]

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 dark:bg-[#0C1013]">
      {/* Header */}
      <div className="flex items-center px-4 py-2.5 shrink-0 dark:bg-[#0C1013]">
        <button type="button" onClick={onToggleSidebar} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors" title="Toggle sidebar">
          <PanelLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      {!conversationId && allMessages.length === 0 ? (
        <WelcomeScreen onSuggestionClick={handleSend} />
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto dark:bg-[#0C1013]" style={{ backgroundImage: SVG_PATTERN }}>
          <div className="max-w-3xl mx-auto py-6 space-y-4">
            {allMessages.map((msg, i) => (
              <ChatMessage key={msg.id || `msg-${i}`} message={msg} />
            ))}
            {(sendMutation.isPending || analyzing) && <ThinkingIndicator />}
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={sendMutation.isPending} />
    </div>
  )
}
