import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Notice } from "../components/ui/Notice"
import { Pager } from "../components/ui/Pager"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Plus, Search, ExternalLink, FlaskConical, CheckCircle2, AlertTriangle, Users } from "lucide-react"
import api from "../../services/api"
import { useApi, providerCode } from "../lib/useApi"
import { paginate, useNotice } from "../lib/forms"

const statusBadge = (s: string) => s === "ACTIVE" ? <Badge variant="success">Active</Badge> : s === "PENDING" ? <Badge variant="warning">Pending</Badge> : <Badge variant="error">{s === "SUSPENDED" ? "Suspended" : "Rejected"}</Badge>

export function LabCentres() {
  const navigate = useNavigate()
  const { data, error, reload } = useApi(() => api.getProviders({ status: "ALL" }))
  const [notice, setNotice] = useNotice()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState("")
  const all = ((data as any)?.providers || []).filter((p: any) => p.profession === "Lab Centre")
  const list = all.filter((p: any) => (!status || p.status === status) && (!search || `${p.name} ${p.loc} ${p.pincode || ""} ${p.specialization || ""} ${p.phone || ""}`.toLowerCase().includes(search.toLowerCase())))
  const paged = paginate(list, page)
  const setActive = async (p: any, s: string) => {
    setActionError("")
    try { await api.setProviderStatus(p.id, s); setNotice(`${p.name} ${s === "ACTIVE" ? "is now shown on the website" : "is hidden from the website"}`); reload() } catch (err: any) { setActionError(err.message) }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Lab Centres</h1>
          <p className="text-muted mt-1">Diagnostic labs and sample-collection centres. Active ones appear on the Lab Tests page of the website.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/services/lab-tests" target="_blank" rel="noreferrer"><Button variant="outline"><ExternalLink className="mr-2 h-4 w-4" /> View on website</Button></a>
          <Button onClick={() => navigate("/admin/providers/new?profession=Lab%20Centre")}>
            <Plus className="mr-2 h-4 w-4" /> Add Lab Centre
          </Button>
        </div>
      </div>

      <Notice text={notice} onClose={() => setNotice("")} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Lab Centres", value: String(all.length), icon: FlaskConical, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Active on website", value: String(all.filter((l: any) => l.status === "ACTIVE").length), icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
          { label: "Pending Verification", value: String(all.filter((l: any) => l.status === "PENDING").length), icon: AlertTriangle, color: "text-warning", bg: "bg-amber-50" },
          { label: "Orders", value: String(all.reduce((t: number, p: any) => t + (p.bookings || 0), 0)), icon: Users, color: "text-info", bg: "bg-blue-50" }
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

      <div className="flex flex-col sm:flex-row gap-3 bg-surface p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search name, city, PIN code or phone..." className="w-full pl-10 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select aria-label="Status filter" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="h-10 rounded-lg border border-slate-200 bg-surface px-3 text-sm">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {(error || actionError) && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error || actionError}</p>}
      <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm">
      <Table className="border-0 rounded-none shadow-none">
        <TableHeader>
          <TableRow>
            <TableHead>Lab Centre</TableHead>
            <TableHead>Centre ID</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Home collection</TableHead>
            <TableHead>Walk-in</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.rows.length === 0 && (
            <TableRow><TableCell colSpan={12} className="text-center text-muted py-8">{all.length ? "No lab centres match your search." : "No lab centres yet. Click “Add Lab Centre” to add one."}</TableCell></TableRow>
          )}
          {paged.rows.map((c: any) => (
          <TableRow key={c.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <img src={c.img} alt="" className="h-9 w-9 rounded-full object-cover bg-slate-100" />
                <div><p className="font-medium text-charcoal">{c.name}</p><p className="text-xs text-muted">{c.specialization || c.profession}</p></div>
              </div>
            </TableCell>
            <TableCell className="text-brand-600 font-medium">{providerCode("LAB", c.id)}</TableCell>
            <TableCell>{c.loc || "-"}{c.pincode ? ` · ${c.pincode}` : ""}</TableCell>
            <TableCell>{c.fee ? `₹${c.fee}` : "-"}</TableCell>
            <TableCell>{c.clinicFee ? `₹${c.clinicFee}` : "-"}</TableCell>
            <TableCell>{c.bookings || 0}</TableCell>
            <TableCell>{c.rating}</TableCell>
            <TableCell>{statusBadge(c.status)}</TableCell>
            <TableCell className="text-right whitespace-nowrap">
              <Link to={`/admin/providers/${c.id}`}><Button variant="ghost" size="sm" className="h-8 text-brand-600">View</Button></Link>
              <Link to={`/admin/providers/${c.id}/edit?back=${encodeURIComponent(location.pathname)}`}><Button variant="ghost" size="sm" className="h-8">Edit</Button></Link>
              {c.status === "ACTIVE"
                ? <Button variant="ghost" size="sm" className="h-8 text-error" onClick={() => setActive(c, "SUSPENDED")}>Hide</Button>
                : <Button variant="ghost" size="sm" className="h-8 text-success" onClick={() => setActive(c, "ACTIVE")}>{c.status === "PENDING" ? "Approve" : "Activate"}</Button>}
            </TableCell>
          </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pager page={paged.current} pages={paged.pages} from={paged.from} to={paged.to} total={list.length} label="lab centres" onPage={setPage} />
      </div>
    </div>
  )
}
