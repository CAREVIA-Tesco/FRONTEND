import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { getSessionUser } from "../../../services/api"
import { 
  LayoutDashboard, Users, UserRoundCog, Stethoscope, 
  HeartHandshake, FlaskConical, Stethoscope as ServicesIcon,
  CalendarDays, Video, Clock, Siren,
  CreditCard, ArrowRightLeft, Undo2, HandCoins,
  ChevronRight
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
  { title: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { title: "Consultations", href: "/admin/consultations", icon: Video },
  { title: "Availability", href: "/admin/availability", icon: Clock },
  { title: "Emergency Requests", href: "/admin/emergency", icon: Siren },
]

const financeNav = [
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Transactions", href: "/admin/transactions", icon: ArrowRightLeft },
  { title: "Refunds", href: "/admin/refunds", icon: Undo2 },
  { title: "Provider Payouts", href: "/admin/payouts", icon: HandCoins },
]

export function Sidebar() {
  const location = useLocation()

  const NavGroup = ({ title, items }: { title: string, items: any[] }) => (
    <div className="mb-6">
      <h4 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h4>
      <nav className="space-y-1 px-3">
        {items.map((item) => {
          const isActive = location.pathname === item.href || 
                           (item.href !== "/" && location.pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-brand-50 text-brand-600" 
                  : "text-charcoal hover:bg-slate-50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-surface">
      <div className="flex h-[76px] shrink-0 items-center px-6 border-b border-slate-200">
        <span className="text-2xl font-bold text-brand-600">CAREvia</span>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <NavGroup title="Main" items={mainNav} />
        <NavGroup title="Management" items={managementNav} />
        <NavGroup title="Operations" items={operationsNav} />
        <NavGroup title="Finance" items={financeNav} />
      </div>
      <div className="border-t border-slate-200 p-4 min-h-[90px] flex items-center">
        <Link to="/admin/settings" className="flex items-center justify-between w-full rounded-xl p-2 hover:bg-brand-50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-semibold border border-brand-100">
              {(getSessionUser()?.name || "Admin").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-charcoal">{getSessionUser()?.name || "Admin"}</p>
              <p className="truncate text-xs text-muted">{getSessionUser()?.email || ""}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted group-hover:text-brand-600" />
        </Link>
      </div>
    </div>
  )
}
