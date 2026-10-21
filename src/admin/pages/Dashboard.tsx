import { KPICard } from "../components/dashboard/KPICard"
import { RevenueChart } from "../components/dashboard/RevenueChart"
import { AppointmentDonut } from "../components/dashboard/AppointmentDonut"
import { RecentAppointmentsTable } from "../components/dashboard/RecentAppointmentsTable"
import { Users, UserRoundCog, CalendarDays, Video, IndianRupee, AlertCircle, Inbox, Briefcase, ChevronRight, Download } from "lucide-react"
import { getSessionUser } from "../../services/api"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../../services/api"

const formatINRShort = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening" }
const pct = (n: number | undefined) => `${(n || 0) >= 0 ? "+" : ""}${n || 0}%`

export function Dashboard() {
  const navigate = useNavigate()
  const firstName = getSessionUser()?.name || "Admin"
  const [stats, setStats] = useState<any>({ providers: 0, patients: 0, appointments: 0, consultations: 0, revenue: 0, pendingProviders: 0 });
  const [growth, setGrowth] = useState<any>({});
  const [revenueSeries, setRevenueSeries] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getStats()
      .then((data: any) => {
        setStats(data.stats);
        setGrowth(data.growth || {});
        setRevenueSeries(data.revenueSeries || []);
        setBreakdown(data.appointmentBreakdown || []);
        setRecent(data.recentAppointments || []);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const exportReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Patients", stats.patients],
      ["Total Providers", stats.providers],
      ["Appointments", stats.appointments],
      ["Consultations", stats.consultations],
      ["Revenue (INR)", stats.revenue],
      ["Pending Approvals", stats.pendingProviders],
    ]
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "carevaa-dashboard-report.csv"
    a.click()
  }
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-deep text-white px-6 py-7 sm:px-8 sm:py-8">
        <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-accent/40 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-on-deep">{greeting()}, {firstName}</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-white/70 mt-1.5 text-sm sm:text-[15px]">Here's what's happening across Carevaa today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/admin/enquiries" className="h-10 inline-flex items-center gap-2 rounded-xl bg-white/10 ring-1 ring-white/20 px-4 text-sm font-medium hover:bg-white/15 transition-colors">
              <Inbox className="h-4 w-4" /> Enquiries{stats.openEnquiries ? <span className="ml-1 rounded-full bg-secondary px-1.5 text-[11px] font-semibold">{stats.openEnquiries}</span> : null}
            </Link>
            <Link to="/admin/appointments" className="h-10 inline-flex items-center gap-2 rounded-xl bg-white/10 ring-1 ring-white/20 px-4 text-sm font-medium hover:bg-white/15 transition-colors">Appointments</Link>
            <button onClick={exportReport} className="h-10 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold text-white hover:brightness-95 shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--color-secondary)_80%,transparent)] transition">
              <Download className="h-4 w-4" /> Export Report
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      {(stats.newEnquiries > 0 || stats.newApplications > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.newEnquiries > 0 && (
            <Link to="/admin/enquiries" className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 hover:bg-amber-100 transition-colors">
              <Inbox className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-sm font-semibold">{stats.newEnquiries} new {stats.newEnquiries === 1 ? "enquiry is" : "enquiries are"} waiting for a callback</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
          {stats.newApplications > 0 && (
            <Link to="/admin/applications" className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-brand-700 hover:bg-brand-100 transition-colors">
              <Briefcase className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-sm font-semibold">{stats.newApplications} new job {stats.newApplications === 1 ? "application" : "applications"} to review</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
      <div className="grid gap-4 lg:gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <KPICard
          title="Total Patients"
          value={stats.patients.toLocaleString("en-IN")}
          change={pct(growth.patients)}
          isPositive={(growth.patients || 0) >= 0}
          icon={Users}
        />
        <KPICard
          title="Total Providers"
          value={stats.providers.toLocaleString("en-IN")}
          change={pct(growth.providers)}
          isPositive={(growth.providers || 0) >= 0}
          icon={UserRoundCog}
          tone="violet"
        />
        <KPICard
          title="Appointments"
          value={stats.appointments.toLocaleString("en-IN")}
          change={pct(growth.appointments)}
          isPositive={(growth.appointments || 0) >= 0}
          icon={CalendarDays}
          tone="rose"
        />
        <KPICard
          title="Consultations"
          value={stats.consultations.toLocaleString("en-IN")}
          change={pct(growth.consultations)}
          isPositive={(growth.consultations || 0) >= 0}
          icon={Video}
          tone="teal"
        />
        <KPICard
          title="Revenue"
          value={formatINRShort(stats.revenue)}
          change={pct(growth.revenue)}
          isPositive={(growth.revenue || 0) >= 0}
          icon={IndianRupee}
          tone="plum"
        />
        <KPICard
          title="Pending Approvals"
          value={stats.pendingProviders.toLocaleString("en-IN")}
          change={pct(growth.pendingApprovals)}
          isPositive={(growth.pendingApprovals || 0) <= 0}
          icon={AlertCircle}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:gap-6 md:grid-cols-7">
        <RevenueChart data={revenueSeries} totalRevenue={stats.revenue} />
        <AppointmentDonut data={breakdown} />
      </div>

      <RecentAppointmentsTable appointments={recent} onViewAll={() => navigate("/admin/appointments")} />
    </div>
  )
}
