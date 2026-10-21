import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Card, CardContent } from "../components/ui/Card"
import { Search, Calendar, Users, UserCheck, UserX, Clock } from "lucide-react"
import { Fragment, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import { useApi } from "../lib/useApi"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const toMinutes = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t || "")
  if (!m) return 0
  return ((parseInt(m[1]) % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + parseInt(m[2])
}
const workingDays = (schedule: any) => {
  const days = DAYS.filter((d) => schedule?.[d]?.length)
  return days.length ? days.join(", ") : "Not set"
}
const workingHours = (schedule: any) => {
  const all = DAYS.flatMap((d) => schedule?.[d] || []).sort((a: string, b: string) => toMinutes(a) - toMinutes(b))
  return all.length ? `${all[0]}–${all[all.length - 1]}` : "-"
}
const slotCount = (schedule: any) => DAYS.reduce((t, d) => t + (schedule?.[d]?.length || 0), 0)

export function Availability() {
  const { data, error } = useApi(() => api.getProviders({ status: "ALL" }))
  const appts = useApi(() => api.getAppointments())
  const [view, setView] = useState<"Day" | "Week" | "Month">("Week")
  const [search, setSearch] = useState("")
  const [statusSel, setStatusSel] = useState("")
  const todayKey = DAYS[(new Date().getDay() + 6) % 7]
  const providers = ((data as any)?.providers || []).filter((p: any) => (!statusSel || (statusSel === "today" ? p.status === "ACTIVE" && (p.schedule?.[todayKey] || []).length > 0 : statusSel === "none" ? !slotCount(p.schedule) : p.status === statusSel)) && (!search || `${p.name} ${p.spec} ${p.loc || ""}`.toLowerCase().includes(search.toLowerCase())))

  // ----- live schedule overview -----
  const activeProviders = ((data as any)?.providers || []).filter((p: any) => p.status === "ACTIVE")
  const bookings = ((appts.data as any)?.appointments || []).filter((a: any) => a.status !== "Cancelled")
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const days = Array.from({ length: view === "Day" ? 1 : view === "Week" ? 7 : 30 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  const dayKeyOf = (d: Date) => DAYS[(d.getDay() + 6) % 7]
  const hourOf = (slot: string) => Math.floor(toMinutes(slot) / 60)
  const allSlotHours = activeProviders.flatMap((p: any) => DAYS.flatMap((d) => (p.schedule?.[d] || []).map(hourOf)))
  const firstHour = allSlotHours.length ? Math.min(...allSlotHours) : 9
  const lastHour = allSlotHours.length ? Math.max(...allSlotHours) : 17
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i)
  const hourLabel = (h: number) => `${String(h % 12 || 12).padStart(2, "0")}:00 ${h >= 12 ? "PM" : "AM"}`
  const availableAt = (d: Date, h: number) => activeProviders.filter((p: any) => (p.schedule?.[dayKeyOf(d)] || []).some((slot: string) => hourOf(slot) === h))
  const bookedAt = (d: Date, h: number) => bookings.filter((a: any) => { const t = new Date(a.scheduledAt); return t.toDateString() === d.toDateString() && t.getHours() === h })
  const daySlots = (d: Date) => activeProviders.reduce((t: number, p: any) => t + (p.schedule?.[dayKeyOf(d)]?.length || 0), 0)
  const dayBooked = (d: Date) => bookings.filter((a: any) => new Date(a.scheduledAt).toDateString() === d.toDateString()).length
  const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })
  const available = providers.filter((p: any) => p.status === "ACTIVE" && slotCount(p.schedule) > 0)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Availability</h1>
        <p className="text-muted mt-1">Manage provider schedules, working hours and appointment availability.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Available Providers", value: String(available.length), icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Currently Online", value: String(available.filter((p: any) => p.schedule?.[todayKey]?.length).length), icon: UserCheck, color: "text-success", bg: "bg-green-50" },
          { label: "Unavailable", value: String(providers.length - available.length), icon: UserX, color: "text-error", bg: "bg-red-50" },
          { label: "Today's Open Slots", value: String(available.reduce((t: number, p: any) => t + (p.schedule?.[todayKey]?.length || 0), 0)), icon: Clock, color: "text-info", bg: "bg-blue-50" }
        ].map(stat => (
          <div key={stat.label} className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">{stat.label}</p>
              <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
            type="text" 
            placeholder="Search doctor, provider or specialization..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-surface text-sm">
            <Calendar className="h-4 w-4 text-muted" />
            <span>Today, {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
          <select aria-label="Availability filter" value={statusSel} onChange={(e) => setStatusSel(e.target.value)} className="h-10 w-full sm:w-auto rounded-lg border border-slate-200 bg-surface px-3 text-sm">
            <option value="">All professionals</option>
            <option value="today">Available today</option>
            <option value="ACTIVE">Active</option>
            <option value="none">No schedule set</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="font-semibold text-charcoal">Schedule Overview</h3>
            <div className="flex bg-slate-100 rounded-lg p-1">
              {(["Day", "Week", "Month"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={view === v ? "px-3 py-1 text-sm font-medium bg-white text-charcoal shadow-sm rounded-md" : "px-3 py-1 text-sm font-medium text-muted rounded-md hover:text-charcoal transition-colors"}>{v}</button>
              ))}
            </div>
          </div>
          <div className="p-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {view === "Month" ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-7 gap-px bg-slate-200">
                  {days.map((d) => (
                    <div key={d.toISOString()} className="bg-surface p-3 text-xs">
                      <div className={`font-semibold mb-2 ${d.getTime() === start.getTime() ? "text-brand-600" : "text-charcoal"}`}>{d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</div>
                      <div className="rounded px-1.5 py-1 mb-1 bg-green-100/50 border border-green-200 text-green-700">{daySlots(d)} open slots</div>
                      <div className="rounded px-1.5 py-1 bg-blue-100/50 border border-blue-200 text-blue-700">{dayBooked(d)} booked</div>
                    </div>
                  ))}
                </div>
              ) : (
              <>
              {/* Live calendar grid: provider availability + bookings per hour */}
              <div className="grid border-b border-slate-200 bg-slate-50 text-sm font-medium text-muted text-center" style={{ gridTemplateColumns: `repeat(${days.length + 1}, minmax(0, 1fr))` }}>
                <div className="p-3 border-r border-slate-200">Time</div>
                {days.map((d, i) => (
                  <div key={d.toISOString()} className={`p-3 border-r border-slate-200 last:border-0 ${i === 0 ? "text-brand-600 font-bold" : ""}`}>{fmtDay(d)}</div>
                ))}
              </div>
              <div className="grid relative max-h-[400px] overflow-y-auto" style={{ gridTemplateColumns: `repeat(${days.length + 1}, minmax(0, 1fr))` }}>
                {hours.map((h) => (
                  <Fragment key={h}>
                    <div className="h-16 border-r border-b border-slate-100 text-xs text-muted p-2 text-right">{hourLabel(h)}</div>
                    {days.map((d) => {
                      const avail = availableAt(d, h)
                      const booked = bookedAt(d, h)
                      return (
                        <div key={`${d.toISOString()}-${h}`} className="h-16 border-r border-b border-slate-100 last:border-r-0 p-1 space-y-1 overflow-hidden">
                          {avail.length > 0 && (
                            <div title={avail.map((p: any) => p.name).join(", ")} className="bg-green-100/50 border border-green-200 rounded p-1 text-xs text-green-700 truncate">
                              <span className="font-semibold">Available</span> · {avail.length === 1 ? avail[0].name : `${avail.length} providers`}
                            </div>
                          )}
                          {booked.length > 0 && (
                            <div title={booked.map((a: any) => `${a.provider} – ${a.patient}`).join(", ")} className="bg-blue-100/50 border border-blue-200 rounded p-1 text-xs text-blue-700 truncate">
                              <span className="font-semibold">Booked</span> · {booked.length}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </Fragment>
                ))}
              </div>
              </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Working Days</TableHead>
            <TableHead>Working Hours</TableHead>
            <TableHead>Available Slots</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((p: any) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell>{p.spec}</TableCell>
            <TableCell>{workingDays(p.schedule)}</TableCell>
            <TableCell>{workingHours(p.schedule)}</TableCell>
            <TableCell>{slotCount(p.schedule)} Slots</TableCell>
            <TableCell>{p.status === "ACTIVE" && slotCount(p.schedule) > 0 ? <Badge variant="success">Available</Badge> : <Badge variant="default">Unavailable</Badge>}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link to={`/admin/providers/${p.id}/edit`}><Button variant="ghost" size="sm" className="h-8 text-brand-600">Edit Schedule</Button></Link>
                <Link to={`/admin/providers/${p.id}`}><Button variant="ghost" size="sm" className="h-8 text-charcoal">View</Button></Link>
              </div>
            </TableCell>
          </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
