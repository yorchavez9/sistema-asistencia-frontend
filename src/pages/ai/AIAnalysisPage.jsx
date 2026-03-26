import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { chatApi } from "@/api/endpoints"
import { toast } from "sonner"
import { DesktopSidebar, MobileSidebar } from "./components/ChatSidebar"
import ChatArea from "./components/ChatArea"

export default function AIAnalysisPage() {
  const queryClient = useQueryClient()
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const { data: conversationsData } = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: () => chatApi.getConversations().then((r) => r.data.data || r.data),
  })

  const conversations = conversationsData || []

  const createMutation = useMutation({
    mutationFn: () => chatApi.createConversation({ title: "Nueva conversación" }),
    onSuccess: (res) => {
      const conv = res.data.data || res.data
      setActiveConversationId(conv.id)
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => chatApi.deleteConversation(id),
    onSuccess: (_, deletedId) => {
      if (activeConversationId === deletedId) {
        setActiveConversationId(null)
      }
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] })
      toast.success("Conversación eliminada")
    },
  })

  // Analizar sección → crea conversación con resultado en el chat
  const handleAnalyzeSection = async (sectionId) => {
    setAnalyzing(true)
    try {
      const res = await chatApi.analyzeSection(sectionId)
      const data = res.data.data || res.data
      const convId = data.conversation?.id
      if (convId) {
        setActiveConversationId(convId)
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] })
        queryClient.invalidateQueries({ queryKey: ["chat-messages", convId] })
      }
      toast.success("Análisis completado")
    } catch (err) {
      toast.error(err.response?.data?.message || "Error en análisis")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(true)
    } else {
      setSidebarOpen((prev) => !prev)
    }
  }

  const sidebarProps = {
    conversations,
    activeId: activeConversationId,
    onSelect: setActiveConversationId,
    onDelete: (id) => deleteMutation.mutate(id),
    onCreate: () => createMutation.mutate(),
    onAnalyzeSection: handleAnalyzeSection,
    analyzing,
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 sm:-m-6 bg-background dark:bg-[#0C1013] overflow-hidden">
      {sidebarOpen && <DesktopSidebar {...sidebarProps} onCollapse={() => setSidebarOpen(false)} />}

      <MobileSidebar open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen} {...sidebarProps} />

      <ChatArea
        conversationId={activeConversationId}
        onToggleSidebar={handleToggleSidebar}
        onNewConversation={(id) => setActiveConversationId(id)}
        analyzing={analyzing}
      />
    </div>
  )
}
