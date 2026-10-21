import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { getSessionUser } from "../../../services/api"
import { 
  LayoutDashboard, Users, UserRoundCog, Stethoscope, 
  HeartHandshake, FlaskConical, Stethoscope as ServicesIcon,
  CalendarDays, Video, Clock, Siren,
  CreditCard, ArrowRightLeft, Undo2, HandCoins,
  ChevronRight, Inbox, Briefcase, FileEdit, X, ExternalLink
} from "lucide-react"

const mainNav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
]

const managementNav = [
  { title: "Patients", href: "/admin/patients", icon: Users },
  { title: "Doctors & Providers", href: "/admin/providers", icon: UserRoundCog },
  { title: "Specializations", href: "/admin/specializations", icon: Stethoscope },
  { title: "Caretakers", href: "/admin/caretakers", icon: HeartHandshake },
  { title: "Lab Centres", href: "/admin/labs", icon: FlaskConical },
  { title: "Services", href: "/admin/services", icon: ServicesIcon },
]

const operationsNav = [
  { title: "Enquiries & Callbacks", href: "/admin/enquiries", icon: Inbox },
  { title: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { title: "Consultations", href: "/admin/consultations", icon: Video },
  { title: "Availability", href: "/admin/availability", icon: Clock },
  { title: "Emergency Requests", href: "/admin/emergency", icon: Siren },
]

const websiteNav = [
  { title: "Website Content", href: "/admin/content", icon: FileEdit },
  { title: "Job Applications", href: "/admin/applications", icon: Briefcase },
]

const financeNav = [
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Transactions", href: "/admin/transactions", icon: ArrowRightLeft },
  { title: "Refunds", href: "/admin/refunds", icon: Undo2 },
  { title: "Provider Payouts", href: "/admin/payouts", icon: HandCoins },
]

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const location = useLocation()
  const user = getSessionUser()
  const name = user?.name || "Admin"
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()

  const NavGroup = ({ title, items }: { title: string, items: any[] }) => (
    <div className="mb-5">
      <h4 className="mb-1.5 px-6 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {title}
      </h4>
      <nav className="space-y-0.5 px-3">
        {items.map((item) => {
          const isActive = item.href === "/admin"
            ? location.pathname === "/admin" || location.pathname === "/admin/"
            : location.pathname === item.href || location.pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors",
                isActive
                  ? "bg-white/[0.12] text-white"
                  : "text-white/65 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-secondary-bright" aria-hidden="true" />}
              <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-secondary-soft" : "text-white/55")} />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      <div
        className={cn("fixed inset-0 z-40 bg-deep/50 lg:hidden transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-deep text-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Admin navigation"
      >
        <div className="flex h-16 lg:h-[72px] shrink-0 items-center justify-between gap-3 px-5 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block text-[17px] font-semibold tracking-tight">Carevaa</span>
              <span className="block text-[11px] text-white/50">Admin console</span>
            </span>
          </Link>
          <button type="button" onClick={onClose} className="lg:hidden p-2 -mr-2 rounded-lg text-white/70 hover:bg-white/10" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.15)_transparent]">
          <NavGroup title="Main" items={mainNav} />
          <NavGroup title="Management" items={managementNav} />
          <NavGroup title="Operations" items={operationsNav} />
          <NavGroup title="Website" items={websiteNav} />
          <NavGroup title="Finance" items={financeNav} />
          <div className="px-3">
            <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-white/65 hover:bg-white/[0.06] hover:text-white">
              <ExternalLink className="h-[18px] w-[18px] text-white/55" /> View website
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 p-3">
          <Link to="/admin/settings" className="flex items-center justify-between w-full rounded-xl p-2.5 hover:bg-white/[0.06] transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-full bg-secondary flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{name}</p>
                <p className="truncate text-xs text-white/50">{user?.email || ""}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-white/40 group-hover:text-white" />
          </Link>
        </div>
      </aside>
    </>
  )
}
