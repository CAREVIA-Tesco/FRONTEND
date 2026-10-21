import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Card, CardContent } from "../components/ui/Card"
import { Search, Video, Users, CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { useApi } from "../lib/useApi"

export function Consultations() {
  const navigate = useNavigate()
  const { data, error } = useApi(() => api.getAppointments())
  const [search, setSearch] = useState("")
  const [statusSel, setStatusSel] = useState("")
  const online = ((data as any)?.appointments || []).filter((a: any) => a.consultationType === "online")
  const today = new Date().toDateString()
  const isLive = (a: any) => (a.status === "Waiting" || a.status === "Confirmed") && new Date(a.scheduledAt).toDateString() === today
  const live = online.filter(isLive).slice(0, 3)
  const initials = (n: string) => (n || "").replace(/^Dr\.?\s*/, "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
  const consultations = online
    .filter((a: any) => !statusSel || (statusSel === "Live" ? isLive(a) : a.status === statusSel))
    .filter((a: any) => !search || `${a.code} ${a.patient} ${a.provider}`.toLowerCase().includes(search.toLowerCase()))
    .map((a: any) => ({
      id: a.code,
      patient: a.patient,
      provider: a.provider,
      startTime: `${a.shortDate}, ${a.timeSlot}`,
      duration: a.status === "Completed" ? "Completed" : "-",
      type: "Video",
      status: isLive(a) ? "Live" : a.status === "Confirmed" ? "Waiting" : a.status,
    }))
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Consultations</h1>
        <p className="text-muted mt-1">Monitor and manage online healthcare consultations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Consultations", value: String(online.length), icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Active Now", value: String(online.filter(isLive).length), icon: Video, color: "text-success", bg: "bg-green-50" },
          { label: "Completed", value: String(online.filter((a: any) => a.status === "Completed").length), icon: CheckCircle2, color: "text-charcoal", bg: "bg-slate-100" },
          { label: "Cancelled", value: String(online.filter((a: any) => a.status === "Cancelled").length), icon: XCircle, color: "text-error", bg: "bg-red-50" }
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

      <div>
        <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
          Live Consultations
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {live.length === 0 && <p className="text-sm text-muted col-span-full">No consultations scheduled for today.</p>}
          {live.map((c: any) => (
            <Card key={c.id} className="border-success/30 bg-green-50/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium text-xs">{initials(c.patient)}</div>
                    <span className="font-medium text-sm">{c.patient}</span>
                  </div>
                  <Badge variant="success" className="animate-pulse">LIVE</Badge>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-charcoal font-medium text-xs">{initials(c.provider)}</div>
                  <span className="font-medium text-sm">{c.provider}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted mb-4">
                  <div>Starts: <span className="text-charcoal font-medium">{c.timeSlot}</span></div>
                  <div>Status: <span className="text-charcoal font-medium">{c.status}</span></div>
                </div>
                <Button variant="outline" onClick={() => navigate("/admin/appointments")} className="w-full text-brand-600 border-brand-200 hover:bg-brand-50">
                  <Video className="h-4 w-4 mr-2" /> View Consultation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-2xl border border-slate-200 shadow-sm mt-8">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
            type="text" 
            placeholder="Search consultation ID, patient..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select aria-label="Status filter" value={statusSel} onChange={(e) => setStatusSel(e.target.value)} className="h-10 w-full sm:w-auto rounded-lg border border-slate-200 bg-surface px-3 text-sm">
            <option value="">All consultations</option>
            <option value="Live">Live today</option>
            <option value="Waiting">Waiting</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Consultation ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultations.length === 0 && (
            <TableRow><TableCell colSpan={8} className="text-center text-muted py-8">No online consultations yet.</TableCell></TableRow>
          )}
          {consultations.map((con: any) => (
            <TableRow key={con.id}>
              <TableCell className="text-brand-600 font-medium">{con.id}</TableCell>
              <TableCell className="font-medium">{con.patient}</TableCell>
              <TableCell>{con.provider}</TableCell>
              <TableCell>{con.startTime}</TableCell>
              <TableCell>{con.duration}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-muted" /> {con.type}
                </div>
              </TableCell>
              <TableCell>
                {con.status === "Live" && <Badge variant="success" className="animate-pulse">Live</Badge>}
                {con.status === "Completed" && <Badge variant="default">Completed</Badge>}
                {con.status === "Waiting" && <Badge variant="warning">Waiting</Badge>}
                {con.status === "Cancelled" && <Badge variant="error">Cancelled</Badge>}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-brand-600" onClick={() => navigate("/admin/appointments")}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
