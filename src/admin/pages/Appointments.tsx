import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Download, Plus, CalendarCheck, CalendarClock, CalendarX, CalendarDays } from "lucide-react"
import { useState, useEffect, Fragment } from "react"
import { useSearchParams } from "react-router-dom"
import { CreateAppointmentModal } from "../components/CreateAppointmentModal"
import { Notice } from "../components/ui/Notice"
import { Pager } from "../components/ui/Pager"
import { paginate, inputCls, SLOTS } from "../lib/forms"
import api from "../../services/api"
import { useApi, downloadCsv } from "../lib/useApi"

export function Appointments() {
  const { data, error: loadError, reload } = useApi(() => api.getAppointments())
  const [urlParams] = useSearchParams()
  const [search, setSearch] = useState(urlParams.get("q") || "")
  useEffect(() => { const q = urlParams.get("q"); if (q !== null) setSearch(q) }, [urlParams])
  const [statusFilter, setStatusFilter] = useState("All")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState("")
  const [page, setPage] = useState(1)
  const [moving, setMoving] = useState<{ id: string; date: string; time: string } | null>(null)
  useEffect(() => { setPage(1) }, [search, statusFilter])
  const error = loadError || actionError
  const all = (data as any)?.appointments || []
  const STATUS_LABEL: Record<string, string> = { Waiting: "Pending", Confirmed: "Confirmed", Completed: "Completed", Cancelled: "Cancelled" }
  const appointments = all
    .filter((a: any) => statusFilter === "All" || STATUS_LABEL[a.status] === statusFilter)
    .filter((a: any) => !search || `${a.code} ${a.patient} ${a.provider} ${a.specialization}`.toLowerCase().includes(search.toLowerCase()))
    .map((a: any) => ({ ...a, id: a.code, apiId: a.id, date: a.shortDate, time: a.timeSlot, status: STATUS_LABEL[a.status] || a.status }))
  const todayStr = new Date().toDateString()
  const paged = paginate(appointments, page)
  const changeStatus = async (apt: any, action: string) => {
    setActionError("")
    try {
      if (action === "cancel") await api.cancelAppointment(apt.apiId)
      else if (action === "complete") await api.completeAppointment(apt.apiId, {})
      else await api.setAppointmentStatus(apt.apiId, "Confirmed")
      setNotice(`${apt.id} ${action === "cancel" ? "cancelled" : action === "complete" ? "marked completed" : "confirmed"}`)
      reload()
    } catch (err: any) {
      setActionError(err.message)
    }
  }
  const reschedule = async (apt: any) => {
    if (!moving?.date || !moving?.time) { setActionError("Choose the new date and time"); return }
    setActionError("")
    try {
      await api.rescheduleAppointment(apt.apiId, new Date(`${moving.date}T12:00:00`).toISOString(), moving.time)
      setMoving(null); setNotice(`${apt.id} moved to ${moving.date} at ${moving.time}`); reload()
    } catch (err: any) { setActionError(err.message) }
  }
  const exportCsv = () => downloadCsv("carevaa-appointments.csv", [["Appointment ID", "Patient", "Doctor", "Specialization", "Date", "Time", "Type", "Payment", "Status"], ...appointments.map((a: any) => [a.id, a.patient, a.provider, a.specialization, a.date, a.time, a.type, a.fee, a.status])])
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Appointments</h1>
          <p className="text-muted mt-1">Manage all patient appointments and healthcare bookings.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Appointment
          </Button>
        </div>
      </div>

      <Notice text={notice} onClose={() => setNotice("")} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", value: String(all.filter((a: any) => new Date(a.scheduledAt).toDateString() === todayStr).length), icon: CalendarCheck, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Upcoming", value: String(all.filter((a: any) => a.status === "Waiting" || a.status === "Confirmed").length), icon: CalendarClock, color: "text-info", bg: "bg-blue-50" },
          { label: "Completed", value: String(all.filter((a: any) => a.status === "Completed").length), icon: CalendarDays, color: "text-success", bg: "bg-green-50" },
          { label: "Cancelled", value: String(all.filter((a: any) => a.status === "Cancelled").length), icon: CalendarX, color: "text-error", bg: "bg-red-50" }
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
            placeholder="Search patient, doctor or appointment ID..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select aria-label="Status filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-full sm:w-auto rounded-lg border border-slate-200 bg-surface px-3 text-sm">
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm">
      <Table className="border-0 rounded-none shadow-none">
        <TableHeader>
          <TableRow>
            <TableHead>Appointment ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.rows.length === 0 && (
            <TableRow><TableCell colSpan={10} className="text-center text-muted py-8">No appointments found.</TableCell></TableRow>
          )}
          {paged.rows.map((apt: any) => (
            <Fragment key={apt.id}>
            <TableRow>
              <TableCell className="text-brand-600 font-medium">{apt.id}</TableCell>
              <TableCell className="font-medium">{apt.patient}</TableCell>
              <TableCell>{apt.provider}</TableCell>
              <TableCell className="text-muted">{apt.specialization}</TableCell>
              <TableCell>
                <div>{apt.date}</div>
                <div className="text-xs text-muted">{apt.time}</div>
              </TableCell>
              <TableCell>{apt.type}</TableCell>
              <TableCell>{apt.payment}</TableCell>
              <TableCell>
                {apt.status === "Confirmed" && <Badge variant="info">Confirmed</Badge>}
                {apt.status === "Completed" && <Badge variant="success">Completed</Badge>}
                {apt.status === "Pending" && <Badge variant="warning">Pending</Badge>}
                {apt.status === "Cancelled" && <Badge variant="error">Cancelled</Badge>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-brand-600" aria-expanded={expandedId === apt.id} onClick={() => { setExpandedId(expandedId === apt.id ? null : apt.id); setMoving(null) }}>{expandedId === apt.id ? "Close" : "Manage"}</Button>
                </div>
              </TableCell>
            </TableRow>
            {expandedId === apt.id && (
              <TableRow>
                <TableCell colSpan={10} className="bg-slate-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
                    <div className="space-y-1 text-muted">
                      <div><span className="font-medium text-charcoal">Phone:</span> {apt.phone} · <span className="font-medium text-charcoal">Location:</span> {apt.location} · <span className="font-medium text-charcoal">Payment:</span> {apt.paymentStatus} ({apt.paymentMethod})</div>
                      {apt.visitNotes?.prescription && <div><span className="font-medium text-charcoal">Prescription:</span> {apt.visitNotes.prescription}</div>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {apt.status === "Completed" && <a href={`/visit-summary/${apt.apiId}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline">Visit summary (PDF)</Button></a>}
                      {apt.phone && apt.phone !== "-" && <a href={`tel:${apt.phone}`}><Button size="sm" variant="outline">Call patient</Button></a>}
                      {(apt.status === "Pending" || apt.status === "Confirmed") && (
                        <>
                          {apt.status === "Pending" && <Button size="sm" variant="outline" onClick={() => changeStatus(apt, "confirm")}>Confirm</Button>}
                          <Button size="sm" variant="outline" onClick={() => setMoving(moving?.id === apt.id ? null : { id: apt.id, date: "", time: "" })}>Reschedule</Button>
                          <Button size="sm" variant="outline" onClick={() => changeStatus(apt, "complete")}>Mark Completed</Button>
                          <Button size="sm" variant="danger" onClick={() => changeStatus(apt, "cancel")}>Cancel</Button>
                        </>
                      )}
                    </div>
                  </div>
                  {moving?.id === apt.id && (
                    <div className="mt-3 flex flex-wrap items-end gap-2">
                      <input type="date" aria-label="New date" min={new Date().toISOString().slice(0, 10)} className={`${inputCls} w-auto bg-white`} value={moving.date} onChange={(e) => setMoving({ ...moving, date: e.target.value })} />
                      <select aria-label="New time" className={`${inputCls} w-auto bg-white`} value={moving.time} onChange={(e) => setMoving({ ...moving, time: e.target.value })}>
                        <option value="">Time</option>
                        {SLOTS.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <Button size="sm" onClick={() => reschedule(apt)}>Save new time</Button>
                      <Button size="sm" variant="ghost" onClick={() => setMoving(null)}>Cancel</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
      <Pager page={paged.current} pages={paged.pages} from={paged.from} to={paged.to} total={appointments.length} label="appointments" onPage={setPage} />
      </div>

      <CreateAppointmentModal open={creating} onClose={() => setCreating(false)} appointments={all} onCreated={(a: any) => { setCreating(false); setNotice(`Appointment ${a?.code || ""} created – the professional can now confirm it`); reload() }} />
    </div>
  )
}
