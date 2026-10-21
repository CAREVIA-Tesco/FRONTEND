import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Undo2, Clock, CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"
import api from "../../services/api"
import { useApi } from "../lib/useApi"

export function Refunds() {
  const { data, error } = useApi(() => api.getPayments({ type: "Refund" }))
  const [search, setSearch] = useState("")
  const [statusSel, setStatusSel] = useState("")
  const notice = ""
  const all = (data as any)?.payments || []
  const refunds = all.filter((r: any) => !statusSel || r.status === statusSel).filter((r: any) => !search || `${r.txnId} ${r.patient} ${r.appointmentCode}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Refunds</h1>
        <p className="text-muted mt-1">Manage patient refund requests and processing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Refund Requests", value: String(all.length), icon: Undo2, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Pending", value: String(all.filter((r: any) => r.status === "Pending").length), icon: Clock, color: "text-warning", bg: "bg-amber-50" },
          { label: "Approved", value: String(all.filter((r: any) => r.status !== "Failed").length), icon: CheckCircle2, color: "text-info", bg: "bg-blue-50" },
          { label: "Completed", value: String(all.filter((r: any) => r.status === "Success").length), icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
          { label: "Rejected", value: String(all.filter((r: any) => r.status === "Failed").length), icon: XCircle, color: "text-error", bg: "bg-red-50" }
        ].map(stat => (
          <div key={stat.label} className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">{stat.label}</p>
              <p className="text-xl font-bold text-charcoal mt-1">{stat.value}</p>
            </div>
            <div className={`h-10 w-10 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
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
            placeholder="Search refund ID, transaction ID..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select aria-label="Status filter" value={statusSel} onChange={(e) => setStatusSel(e.target.value)} className="h-10 w-full sm:w-auto rounded-lg border border-slate-200 bg-surface px-3 text-sm">
            <option value="">All refunds</option>
            <option value="Success">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Rejected</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      {notice && <p className="text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3">{notice}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Refund ID</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Requested Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.length === 0 && (
            <TableRow><TableCell colSpan={8} className="text-center text-muted py-8">No refunds yet. Refunds are created when a paid appointment is cancelled or refunded from Payments.</TableCell></TableRow>
          )}
          {refunds.map((r: any) => (
          <TableRow key={r.id}>
            <TableCell className="text-brand-600 font-medium">{r.txnId.replace("TXN", "REF-")}</TableCell>
            <TableCell className="text-muted">{r.appointmentCode || "-"}</TableCell>
            <TableCell className="font-medium">{r.patient}</TableCell>
            <TableCell className="font-semibold text-charcoal">{r.amountLabel}</TableCell>
            <TableCell>{r.note || "Refund"}</TableCell>
            <TableCell>{r.date}</TableCell>
            <TableCell><Badge variant="success">Completed</Badge></TableCell>
            <TableCell className="text-right">
              <span className="text-xs text-muted">{r.method}</span>
            </TableCell>
          </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
