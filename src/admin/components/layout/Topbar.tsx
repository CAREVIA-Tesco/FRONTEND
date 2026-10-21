import { useEffect, useState } from "react"
import { Search, Bell, LogOut, Menu, ExternalLink } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import api, { getSessionUser, logout } from "../../../services/api"

const TITLES: Record<string, string> = {
  "": "Dashboard", patients: "Patients", providers: "Doctors & Providers", specializations: "Specializations",
  caretakers: "Caretakers", labs: "Lab Centres", services: "Services", enquiries: "Enquiries & Callbacks",
  appointments: "Appointments", consultations: "Consultations", availability: "Availability",
  emergency: "Emergency Requests", content: "Website Content", applications: "Job Applications",
  payments: "Payments", transactions: "Transactions", refunds: "Refunds", payouts: "Provider Payouts", settings: "My Profile",
}

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getSessionUser()
  const name = user?.name || "Super Admin"
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
  const section = location.pathname.replace(/^\/admin\/?/, "").split("/")[0]
  const title = TITLES[section] || "Admin"
  const [alerts, setAlerts] = useState(0)
  const [query, setQuery] = useState("")

  useEffect(() => {
    api.getStats().then((d: any) => setAlerts((d?.stats?.newEnquiries || 0) + (d?.stats?.pendingProviders || 0))).catch(() => {})
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })

  return (
    <header className="sticky top-0 z-30 flex h-16 lg:h-[72px] shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 lg:px-8">
      <button type="button" onClick={onMenu} className="lg:hidden -ml-1 p-2 rounded-lg text-charcoal hover:bg-slate-100" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 hidden sm:block">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Admin · {today}</p>
        <p className="text-[15px] font-semibold text-charcoal truncate">{title}</p>
      </div>

      <form
        className="relative ml-auto flex-1 max-w-md"
        onSubmit={(e) => { e.preventDefault(); const q = query.trim(); if (q) navigate(/^ENQ-/i.test(q) ? `/admin/enquiries?q=${encodeURIComponent(q)}` : `/admin/patients?q=${encodeURIComponent(q)}`) }}
        role="search"
      >
        <label htmlFor="search-field" className="sr-only">Search</label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" aria-hidden="true" />
        <input
          id="search-field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-charcoal placeholder:text-muted focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition"
          placeholder="Search Carevaa..."
          type="search"
          name="search"
        />
      </form>

      <div className="flex items-center gap-1 sm:gap-2">
        <Link to="/admin/enquiries" className="relative p-2.5 rounded-xl text-muted hover:text-charcoal hover:bg-slate-100" title="Notifications">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
          {alerts > 0 && <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-white text-[10px] font-semibold flex items-center justify-center">{alerts > 99 ? "99+" : alerts}</span>}
        </Link>
        <a href="/" target="_blank" rel="noreferrer" className="hidden md:flex p-2.5 rounded-xl text-muted hover:text-charcoal hover:bg-slate-100" title="View website">
          <span className="sr-only">View website</span>
          <ExternalLink className="h-5 w-5" aria-hidden="true" />
        </a>
        <div className="hidden lg:block h-8 w-px bg-slate-200 mx-2" aria-hidden="true" />
        <Link to="/admin/settings" className="hidden sm:flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100">
          <span className="h-9 w-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-sm">{initials}</span>
          <span className="hidden lg:block leading-tight">
            <span className="block text-sm font-semibold text-charcoal">{name}</span>
            <span className="block text-[11px] text-muted">Super admin</span>
          </span>
        </Link>
        <button type="button" onClick={handleLogout} title="Logout" className="flex items-center gap-1.5 rounded-xl p-2.5 lg:px-3 text-muted hover:text-secondary hover:bg-secondary/10">
          <LogOut className="h-5 w-5" aria-hidden="true" />
          <span className="hidden lg:inline text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  )
}
