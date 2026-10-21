import { useEffect, useState } from "react"
import { Outlet, Navigate, useLocation } from "react-router-dom"
import { getSessionUser } from "../../../services/api"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

export function Layout() {
  // Admin panel is only available to logged-in admins
  const user = getSessionUser()
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()
  useEffect(() => { setNavOpen(false) }, [location.pathname])
  if (!user || user.role !== "admin") return <Navigate to="/login?redirect=/admin" replace />

  return (
    <div className="theme-admin min-h-screen bg-background text-charcoal">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="lg:pl-[264px]">
        <Topbar onMenu={() => setNavOpen(true)} />
        <main className="py-6 px-4 sm:px-6 lg:py-8 lg:px-8 max-w-[1600px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
