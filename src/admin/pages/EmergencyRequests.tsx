import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Filter, AlertTriangle, Clock, UserCheck, CheckCircle2 } from "lucide-react"
import { Fragment, useState } from "react"
import api from "../../services/api"
import { useApi } from "../lib/useApi"

const PRIORITY_STYLE: Record<string, { dot: string; text: string }> = {
  CRITICAL: { dot: "bg-red-600", text: "text-red-700" },
  HIGH: { dot: "bg-orange-500", text: "text-orange-600" },
  MEDIUM: { dot: "bg-amber-400", text: "text-amber-600" },
  LOW: { dot: "bg-slate-400", text: "text-slate-600" },
}

export function EmergencyRequests() {
  const { data, error: loadError, reload } = useApi(() => api.getEmergencies())
  const providers = useApi(() => api.getProviders())
  const [search, setSearch] = useState("")
  const [activeOnly, setActiveOnly] = useState(false)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")
  const error = loadError || actionError
  const all = (data as any)?.requests || []
  const today = new Date().toDateString()
  const active = all.filter((r: any) => r.status !== "Resolved")
  const requests = all
    .filter((r: any) => !activeOnly || r.status !== "Resolved")
    .filter((r: any) => !search || `${r.code} ${r.patient} ${r.location} ${r.type}`.toLowerCase().includes(search.toLowerCase()))
  const doctorList = ((providers.data as any)?.providers || [])
  const update = async (id: string, body: any) => {
    setActionError("")
    try {
      await api.updateEmergency(id, body)
      setAssigningId(null)
      reload()
    } catch (err: any) {
      setActionError(err.message)
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Emergency Requests</h1>
        <p className="text-muted mt-1">Monitor urgent healthcare requests and coordinate immediate assistance.</p>
      </div>

      <div className="bg-error/10 border border-error/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-error" />
          <span className="font-semibold text-error">{active.length ? `${active.length} active emergency ${active.length === 1 ? "request requires" : "requests require"} attention.` : "No active emergency requests."}</span>
        </div>
        <Button variant="danger" size="sm" onClick={() => setActiveOnly(!activeOnly)}>{activeOnly ? "Show All Requests" : "View Active Requests"}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Emergencies", value: String(active.length), icon: AlertTriangle, color: "text-error", bg: "bg-red-50" },
          { label: "Waiting for Response", value: String(all.filter((r: any) => r.status === "Waiting").length), icon: Clock, color: "text-warning", bg: "bg-amber-50" },
          { label: "Assigned", value: String(all.filter((r: any) => r.status === "Assigned").length), icon: UserCheck, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Resolved Today", value: String(all.filter((r: any) => r.status === "Resolved" && r.resolvedAt && new Date(r.resolvedAt).toDateString() === today).length), icon: CheckCircle2, color: "text-success", bg: "bg-green-50" }
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
            placeholder="Search request ID, patient or location..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Request Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Requested Time</TableHead>
            <TableHead>Assigned Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 && (
            <TableRow><TableCell colSpan={9} className="text-center text-muted py-8">No emergency requests.</TableCell></TableRow>
          )}
          {requests.map((r: any) => (
          <Fragment key={r.id}>
          <TableRow>
            <TableCell className="text-brand-600 font-medium">{r.code}</TableCell>
            <TableCell className="font-medium">{r.patient}</TableCell>
            <TableCell>{r.location}</TableCell>
            <TableCell>{r.type}</TableCell>
            <TableCell>
               <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${(PRIORITY_STYLE[r.priority] || PRIORITY_STYLE.HIGH).dot}`}></span>
                  <span className={`font-semibold ${(PRIORITY_STYLE[r.priority] || PRIORITY_STYLE.HIGH).text}`}>{r.priority}</span>
               </div>
            </TableCell>
            <TableCell>{r.requestedTime}<span className="text-muted text-xs block">{r.requestedDate}</span></TableCell>
            <TableCell>{r.provider || "-"}</TableCell>
            <TableCell>{r.status === "Resolved" ? <Badge variant="success">Resolved</Badge> : r.status === "Assigned" ? <Badge variant="info">Assigned</Badge> : <Badge variant="warning">Waiting</Badge>}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {r.status !== "Resolved" && <Button variant="ghost" size="sm" className="h-8 text-brand-600" onClick={() => setAssigningId(assigningId === r.id ? null : r.id)}>{r.provider ? "Reassign" : "Assign"}</Button>}
                {r.status !== "Resolved" && <Button variant="ghost" size="sm" className="h-8 text-success" onClick={() => update(r.id, { status: "Resolved" })}>Resolve</Button>}
                <a href={`tel:${r.phone}`}><Button variant="ghost" size="sm" className="h-8">Contact</Button></a>
              </div>
            </TableCell>
          </TableRow>
          {assigningId === r.id && (
            <TableRow>
              <TableCell colSpan={9} className="bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                  <span className="text-muted">Assign a provider{r.notes ? ` · Note: ${r.notes}` : ""}:</span>
                  <select defaultValue="" onChange={(e) => e.target.value && update(r.id, { providerId: e.target.value })} className="h-9 rounded-lg border border-slate-200 bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Select provider</option>
                    {doctorList.filter((d: any) => d.loc === r.location).concat(doctorList.filter((d: any) => d.loc !== r.location)).map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name} · {d.spec} · {d.loc}</option>
                    ))}
                  </select>
                </div>
              </TableCell>
            </TableRow>
          )}
          </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
