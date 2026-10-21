import { useState } from "react"
import { Search, Download } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import api from "../../services/api"
import { useApi, downloadCsv } from "../lib/useApi"

const STATUSES = ["New", "Contacted", "Hired", "Rejected"]
const BADGE: Record<string, "warning" | "info" | "success" | "error"> = { New: "warning", Contacted: "info", Hired: "success", Rejected: "error" }

// Applications submitted from the Careers / Find Jobs page
export function JobApplications() {
  const { data, error: loadError, reload } = useApi(() => api.getApplications())
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [actionError, setActionError] = useState("")
  const all: any[] = (data as any)?.applications || []
  const list = all
    .filter((a) => !status || a.status === status)
    .filter((a) => !search || `${a.name} ${a.phone} ${a.email || ""} ${a.role || ""} ${a.city || ""}`.toLowerCase().includes(search.toLowerCase()))

  const setAppStatus = async (id: string, s: string) => {
    setActionError("")
    try { await api.updateApplication(id, s); reload() } catch (err: any) { setActionError(err.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Job Applications</h1>
          <p className="text-muted mt-1">Candidates who applied from the Careers page.</p>
        </div>
        <Button variant="outline" onClick={() => downloadCsv("carevaa-applications.csv", [["Name", "Phone", "Email", "Role", "City", "Experience", "About", "Status", "Applied"], ...list.map((a) => [a.name, a.phone, a.email, a.role, a.city, a.experience, a.about, a.status, new Date(a.createdAt).toLocaleDateString("en-IN")])])}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-surface p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, role or city..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select aria-label="Status filter" value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-surface px-3 text-sm">
          <option value="">All statuses ({all.length})</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s} ({all.filter((a) => a.status === s).length})</option>)}
        </select>
      </div>

      {(loadError || actionError) && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{loadError || actionError}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted py-8">No applications yet.</TableCell></TableRow>}
          {list.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.name}<span className="block text-xs text-muted">{a.phone}{a.email ? ` · ${a.email}` : ""}</span>{a.about && <span className="block text-xs text-muted max-w-xs truncate" title={a.about}>{a.about}</span>}</TableCell>
              <TableCell>{a.role || "-"}</TableCell>
              <TableCell>{a.city || "-"}</TableCell>
              <TableCell>{a.experience || "-"}</TableCell>
              <TableCell>{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
              <TableCell><Badge variant={BADGE[a.status]}>{a.status}</Badge></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-2">
                  <a href={`tel:${a.phone}`}><Button variant="ghost" size="sm" className="h-8">Call</Button></a>
                  <select aria-label={`Status for ${a.name}`} value={a.status} onChange={(e) => setAppStatus(a.id, e.target.value)} className="h-8 rounded-lg border border-slate-200 px-2 text-sm">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
