import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Filter, Download, ArrowRightLeft, CheckCircle2, Clock, XCircle, Undo2 } from "lucide-react"
import { useState } from "react"
import api from "../../services/api"
import { useApi, downloadCsv } from "../lib/useApi"

export function Transactions() {
  const { data, error } = useApi(() => api.getPayments())
  const [search, setSearch] = useState("")
  const notice = ""
  const all = (data as any)?.payments || []
  const txns = all.filter((t: any) => !search || `${t.txnId} ${t.patient} ${t.provider} ${t.type}`.toLowerCase().includes(search.toLowerCase()))
  const exportCsv = () => downloadCsv("carevaa-transactions.csv", [["Transaction ID", "Type", "Patient", "Provider", "Amount", "Method", "Date", "Status"], ...txns.map((t: any) => [t.txnId, t.type, t.patient, t.provider, t.amount, t.method, t.date, t.status])])
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Transactions</h1>
          <p className="text-muted mt-1">View and manage all financial transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download CSV
          </Button>
          <Button variant="outline" onClick={exportCsv}>Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Transactions", value: String(all.length), icon: ArrowRightLeft, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Successful", value: String(all.filter((t: any) => t.status === "Success").length), icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
          { label: "Pending", value: String(all.filter((t: any) => t.status === "Pending").length), icon: Clock, color: "text-warning", bg: "bg-amber-50" },
          { label: "Failed", value: String(all.filter((t: any) => t.status === "Failed").length), icon: XCircle, color: "text-error", bg: "bg-red-50" },
          { label: "Refunded", value: String(all.filter((t: any) => t.type === "Refund").length), icon: Undo2, color: "text-charcoal", bg: "bg-slate-100" }
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
            placeholder="Search transaction ID..." 
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
      {notice && <p className="text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3">{notice}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {txns.length === 0 && (
            <TableRow><TableCell colSpan={8} className="text-center text-muted py-8">No transactions yet.</TableCell></TableRow>
          )}
          {txns.map((t: any) => (
          <TableRow key={t.id}>
            <TableCell className="text-brand-600 font-medium">{t.txnId}</TableCell>
            <TableCell className="font-medium">{t.patient || "-"}</TableCell>
            <TableCell>{t.provider}</TableCell>
            <TableCell className="font-semibold text-charcoal">{t.type === "Payment" ? t.amountLabel : `-${t.amountLabel}`}</TableCell>
            <TableCell>{t.method}</TableCell>
            <TableCell>{t.date}</TableCell>
            <TableCell>{t.type === "Payment" ? (t.status === "Success" ? <Badge variant="success">Successful</Badge> : t.status === "Pending" ? <Badge variant="warning">Pending</Badge> : t.status === "Refunded" ? <Badge variant="default">Refunded</Badge> : <Badge variant="error">Failed</Badge>) : <Badge variant="info">{t.type}</Badge>}</TableCell>
            <TableCell className="text-right">
              <span className="text-xs text-muted">{t.appointmentCode || t.note || ""}</span>
            </TableCell>
          </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
