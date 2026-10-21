import { KPICard } from "../components/dashboard/KPICard"
import { RevenueChart } from "../components/dashboard/RevenueChart"
import { AppointmentDonut } from "../components/dashboard/AppointmentDonut"
import { RecentAppointmentsTable } from "../components/dashboard/RecentAppointmentsTable"
import { Users, UserRoundCog, CalendarDays, Video, IndianRupee, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const formatINRShort = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}
const pct = (n: number | undefined) => `${(n || 0) >= 0 ? "+" : ""}${n || 0}%`

export function Dashboard() {
  const navigate = useNavigate()
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
    a.download = "carevia-dashboard-report.csv"
    a.click()
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Dashboard</h1>
          <p className="text-muted mt-1">
            Welcome back, Admin. Here's what's happening across Carevia today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="h-10 rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          <button onClick={exportReport} className="h-10 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        />
        <KPICard
          title="Appointments"
          value={stats.appointments.toLocaleString("en-IN")}
          change={pct(growth.appointments)}
          isPositive={(growth.appointments || 0) >= 0}
          icon={CalendarDays}
        />
        <KPICard
          title="Consultations"
          value={stats.consultations.toLocaleString("en-IN")}
          change={pct(growth.consultations)}
          isPositive={(growth.consultations || 0) >= 0}
          icon={Video}
        />
        <KPICard
          title="Revenue"
          value={formatINRShort(stats.revenue)}
          change={pct(growth.revenue)}
          isPositive={(growth.revenue || 0) >= 0}
          icon={IndianRupee}
        />
        <KPICard
          title="Pending Approvals"
          value={stats.pendingProviders.toLocaleString("en-IN")}
          change={pct(growth.pendingApprovals)}
          isPositive={(growth.pendingApprovals || 0) <= 0}
          icon={AlertCircle}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <RevenueChart data={revenueSeries} totalRevenue={stats.revenue} />
        <AppointmentDonut data={breakdown} />
      </div>

      <RecentAppointmentsTable appointments={recent} onViewAll={() => navigate("/admin/appointments")} />
    </div>
  )
}
