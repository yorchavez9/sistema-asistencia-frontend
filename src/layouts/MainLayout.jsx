import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import AppSidebar from "./AppSidebar"
import AppHeader from "./AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import useSettings from "@/hooks/useSettings"

export default function MainLayout() {
  const { logoUrl } = useSettings()

  useEffect(() => {
    if (!logoUrl) return
    const link = document.querySelector("link[rel='icon']") || document.createElement("link")
    link.rel = "icon"
    link.href = logoUrl
    document.head.appendChild(link)
  }, [logoUrl])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
