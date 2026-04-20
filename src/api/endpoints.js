import api from "./axios"

// Helpers genéricos para CRUD
const crud = (resource) => ({
  getAll: (params) => api.get(`/${resource}`, { params }),
  getById: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  delete: (id) => api.delete(`/${resource}/${id}`),
})

// Endpoints por módulo
export const usersApi = {
  ...crud("users"),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  import: (formData) => api.post("/users/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  downloadTemplate: () => api.get("/users/template", { responseType: "blob" }),
}

export const rolesApi = {
  ...crud("roles"),
  assignPermissions: (id, data) => api.put(`/roles/${id}/permissions`, data),
}

export const permissionsApi = {
  ...crud("permissions"),
  assignToRoles: (id, data) => api.post(`/permissions/${id}/assign-roles`, data),
  removeFromRoles: (id, data) => api.post(`/permissions/${id}/remove-roles`, data),
}

export const academicYearsApi = {
  ...crud("academic-years"),
  getActive: () => api.get("/academic-years/active"),
}

export const periodsApi = crud("periods")
export const gradesApi = {
  ...crud("grades"),
  getSubjects: (id) => api.get(`/grades/${id}/subjects`),
  syncSubjects: (id, data) => api.post(`/grades/${id}/subjects`, data),
}
export const sectionsApi = crud("sections")

export const studentsApi = {
  ...crud("students"),
  getBySection: (sectionId) => api.get(`/sections/${sectionId}/students`),
  import: (formData) => api.post("/students/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  downloadTemplate: () => api.get("/students/template", { responseType: "blob" }),
}

export const subjectsApi = crud("subjects")

export const assignmentsApi = {
  ...crud("teacher-assignments"),
  myAssignments: () => api.get("/my-assignments"),
  getBySection: (sectionId) => api.get("/teacher-assignments", { params: { section_id: sectionId } }),
}

export const attendanceApi = {
  bulkStore: (data) => api.post("/attendances/bulk", data),
  bulkUpdate: (data) => api.put("/attendances/bulk", data),
  getByAssignmentAndDate: (params) => api.get("/attendances", { params }),
  getByStudent: (id, params) => api.get(`/attendances/student/${id}`, { params }),
  getBySection: (id, params) => api.get(`/attendances/section/${id}`, { params }),
  myCourses: () => api.get("/attendances/my-courses"),
  checkRegistered: (assignmentId, date) => api.get(`/attendances/check/${assignmentId}/${date}`),
  todaySummary: () => api.get("/attendances/today-summary"),
  summary: (params) => api.get("/attendances/summary", { params }),
}

export const alertsApi = {
  getAll: (params) => api.get("/alerts", { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  markAsRead: (id) => api.patch(`/alerts/${id}/read`),
  markAllAsRead: (params) => api.patch("/alerts/mark-all-read", null, { params }),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`),
  delete: (id) => api.delete(`/alerts/${id}`),
  unresolvedCount: () => api.get("/alerts/unresolved-count"),
  studentProfile: (id) => api.get(`/students/${id}/absence-profile`),
}

export const reportsApi = {
  student: (id, params) => api.get(`/reports/student/${id}`, { params }),
  section: (id, params) => api.get(`/reports/section/${id}`, { params }),
  period: (id) => api.get(`/reports/period/${id}`),
  institutional: (params) => api.get("/reports/institutional", { params }),
  risk: (params) => api.get("/reports/risk", { params }),
  // Exports (devuelven blob)
  exportExcel: (type, id, params) => {
    const url = id ? `/reports/${type}/${id}/excel` : `/reports/${type}/excel`
    return api.get(url, { params, responseType: "blob" })
  },
  exportPdf: (type, id, params) => {
    const url = id ? `/reports/${type}/${id}/pdf` : `/reports/${type}/pdf`
    return api.get(url, { params, responseType: "blob" })
  },
}

export const aiApi = {
  analyzeStudent: (id) => api.post(`/ai/analyze/student/${id}`),
  analyzeSection: (id) => api.post(`/ai/analyze/section/${id}`),
  getAnalyses: (params) => api.get("/ai/analyses", { params }),
  getAnalysis: (id) => api.get(`/ai/analyses/${id}`),
  getRecommendations: (studentId) => api.get(`/ai/student/${studentId}/recommendations`),
  getStudentHistory: (studentId) => api.get(`/ai/student/${studentId}/history`),
  getProviders: () => api.get("/ai/providers"),
}

export const chatApi = {
  getConversations: () => api.get("/ai/chat/conversations"),
  createConversation: (data) => api.post("/ai/chat/conversations", data),
  deleteConversation: (id) => api.delete(`/ai/chat/conversations/${id}`),
  getMessages: (id) => api.get(`/ai/chat/conversations/${id}/messages`),
  sendMessage: (id, data) => api.post(`/ai/chat/conversations/${id}/messages`, data),
  analyzeSection: (sectionId) => api.post(`/ai/chat/analyze/section/${sectionId}`),
  /**
   * Streaming SSE - retorna un ReadableStream para consumo en tiempo real.
   */
  streamMessage: async (id, message, onChunk, onDone, onError) => {
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
    const token = localStorage.getItem("token")

    try {
      const response = await fetch(`${baseURL}/ai/chat/conversations/${id}/messages/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data: ")) continue
          const data = trimmed.slice(6)
          if (data === "[DONE]") {
            onDone?.()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              onError?.(parsed.error)
              return
            }
            if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch {
            // ignore parse errors for incomplete chunks
          }
        }
      }
      onDone?.()
    } catch (err) {
      onError?.(err.message || "Error de conexión")
    }
  },
}

export const settingsApi = {
  getAll: () => api.get("/settings"),
  getPublic: () => api.get("/settings/public"),
  getById: (id) => api.get(`/settings/${id}`),
  update: (id, data) => api.put(`/settings/${id}`, data),
  bulkUpdate: (data) => api.put("/settings", data),
  uploadImage: (key, file) => {
    const formData = new FormData()
    formData.append("image", file)
    formData.append("key", key)
    return api.post("/settings/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  deleteImage: (key) => api.post("/settings/delete-image", { key }),
  backup: () => api.post("/settings/backup", {}, { responseType: "blob" }),
}

export const yearTransitionApi = {
  summary: (params) => api.get("/year-transition/summary", { params }),
  preview: (params) => api.get("/year-transition/preview", { params }),
  history: (params) => api.get("/year-transition/history", { params }),
  createYear: (data) => api.post("/year-transition/create-year", data),
  promote: (data) => api.post("/year-transition/promote", data),
  graduate: (data) => api.post("/year-transition/graduate", data),
  closeYear: (data) => api.post("/year-transition/close-year", data),
  activateYear: (data) => api.post("/year-transition/activate-year", data),
  rollback: (data) => api.post("/year-transition/rollback", data),
  copyAssignments: (data) => api.post("/year-transition/copy-assignments", data),
}

export const dashboardApi = {
  director: () => api.get("/dashboard/director"),
  teacher: () => api.get("/dashboard/teacher"),
}

export const dniApi = {
  lookup: (dni) => api.get(`/dni-lookup/${dni}`),
}
