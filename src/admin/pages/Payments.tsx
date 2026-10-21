import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Download } from "lucide-react"
import { useState } from "react"
import api from "../../services/api"
import { useApi, inr, downloadCsv } from "../lib/useApi"

export function Payments() {
  const { data, error: loadError, reload } = useApi(() => api.getPayments({ type: "Payment" }))
  const stats = useApi(() => api.getStats())
  const [search, setSearch] = useState("")
  const [statusSel, setStatusSel] = useState("")
  const [range, setRange] = useState("Last 30 Days")
  const [notice, setNotice] = useState("")
  const [actionError, setActionError] = useState("")
  const error = loadError || actionError
  const days = range === "Last 7 Days" ? 7 : 30
  const since = range === "This Month" ? new Date(new Date().getFullYear(), new Date().getMonth(), 1) : new Date(Date.now() - days * 86400000)
  const payments = ((data as any)?.payments || [])
    .filter((t: any) => new Date(t.createdAt) >= since)
    .filter((t: any) => !statusSel || t.status === statusSel)
    .filter((t: any) => !search || `${t.txnId} ${t.patient} ${t.provider} ${t.appointmentCode}`.toLowerCase().includes(search.toLowerCase()))
  const st = (stats.data as any)?.stats || {}

  const handleRefund = async (t: any) => {
    setNotice(""); setActionError("")
    try {
      await api.refundPayment(t.id)
      setNotice(`Refund of ${t.amountLabel} processed for ${t.patient}.`)
      reload(); stats.reload()
    } catch (err: any) {
      setActionError(err.message)
    }
  }
  const exportCsv = () => downloadCsv("carevaa-payments.csv", [["Transaction ID", "Patient", "Provider", "Appointment", "Amount", "Method", "Date", "Status"], ...payments.map((t: any) => [t.txnId, t.patient, t.provider, t.appointmentCode, t.amount, t.method, t.date, t.status])])
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Payments</h1>
          <p className="text-muted mt-1">Monitor payments, revenue and payment activity across Carevaa.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <select value={range} onChange={(e) => setRange(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Revenue", value: inr(st.revenue) },
          { label: "Today's Revenue", value: inr(st.todayRevenue) },
          { label: "Successful Payments", value: String(st.successfulPayments || 0) },
          { label: "Pending Payments", value: inr(st.pendingPayments) },
          { label: "Refunds", value: inr(st.refunds) }
        ].map(stat => (
          <div key={stat.label} className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="text-xl font-bold text-charcoal mt-1">{stat.value}</p>
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
            placeholder="Search transaction ID, patient..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select aria-label="Status filter" value={statusSel} onChange={(e) => setStatusSel(e.target.value)} className="h-10 w-full sm:w-auto rounded-lg border border-slate-200 bg-surface px-3 text-sm">
            <option value="">All statuses</option>
            <option value="Success">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </select>
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
            <TableHead>Appointment</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 && (
            <TableRow><TableCell colSpan={9} className="text-center text-muted py-8">No payments in this period.</TableCell></TableRow>
          )}
          {payments.map((t: any) => (
          <TableRow key={t.id}>
            <TableCell className="text-brand-600 font-medium">{t.txnId}</TableCell>
            <TableCell className="font-medium">{t.patient}</TableCell>
            <TableCell>{t.provider}</TableCell>
            <TableCell>{t.appointmentCode}</TableCell>
            <TableCell className="font-semibold text-charcoal">{t.amountLabel}</TableCell>
            <TableCell>
               <div className="flex items-center gap-1.5">
                  <span className="text-sm">{t.method}</span>
               </div>
            </TableCell>
            <TableCell>{t.date}</TableCell>
            <TableCell>{t.status === "Success" ? <Badge variant="success">Successful</Badge> : t.status === "Pending" ? <Badge variant="warning">Pending</Badge> : t.status === "Refunded" ? <Badge variant="default">Refunded</Badge> : <Badge variant="error">Failed</Badge>}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-8" disabled={t.status !== "Success"} onClick={() => handleRefund(t)}>Refund</Button>
              </div>
            </TableCell>
          </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
