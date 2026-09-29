import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-[260px]">
        <Topbar />
        <main className="py-8 px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
