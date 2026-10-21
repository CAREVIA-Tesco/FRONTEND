import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Filter, HandCoins, CheckCircle2, Users, CalendarCheck } from "lucide-react"
import { useState } from "react"
import api from "../../services/api"
import { useApi, inr } from "../lib/useApi"

export function ProviderPayouts() {
  const { data, error: loadError, reload } = useApi(() => api.getPayouts())
  const [search, setSearch] = useState("")
  const [notice, setNotice] = useState("")
  const [actionError, setActionError] = useState("")
  const error = loadError || actionError
  const summary = (data as any)?.summary || {}
  const payouts = ((data as any)?.payouts || []).filter((p: any) => !search || (p.provider || "").toLowerCase().includes(search.toLowerCase()))
  const nextPayout = (() => {
    const d = new Date()
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7)) // next Sunday
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  })()
  const handlePayout = async (p: any) => {
    setNotice(""); setActionError("")
    try {
      await api.processPayout(p.providerId)
      setNotice(`Payout of ${inr(p.pending)} processed for ${p.provider}.`)
      reload()
    } catch (err: any) {
      setActionError(err.message)
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Provider Payouts</h1>
        <p className="text-muted mt-1">Manage and process provider earnings and commission payouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Payouts", value: inr(summary.pending), icon: HandCoins, color: "text-warning", bg: "bg-amber-50" },
          { label: "Processed This Month", value: inr(summary.processedThisMonth), icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
          { label: "Providers Paid", value: String(summary.providersPaid || 0), icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Next Payout", value: nextPayout, icon: CalendarCheck, color: "text-info", bg: "bg-blue-50" }
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
            placeholder="Search provider..." 
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
            <TableHead>Provider</TableHead>
            <TableHead>Completed Appointments</TableHead>
            <TableHead>Gross Earnings</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Refunds</TableHead>
            <TableHead>Net Payout</TableHead>
            <TableHead>Payout Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts.length === 0 && (
            <TableRow><TableCell colSpan={9} className="text-center text-muted py-8">No provider earnings yet.</TableCell></TableRow>
          )}
          {payouts.map((p: any) => (
          <TableRow key={p.providerId}>
            <TableCell className="font-medium">{p.provider}</TableCell>
            <TableCell>{p.appointments}</TableCell>
            <TableCell>{inr(p.gross)}</TableCell>
            <TableCell className="text-error">-{inr(p.commission)}</TableCell>
            <TableCell className="text-error">{inr(p.refunds)}</TableCell>
            <TableCell className="font-bold text-charcoal">{inr(p.pending)}</TableCell>
            <TableCell>{p.payoutDate}</TableCell>
            <TableCell>{p.status === "Pending" ? <Badge variant="warning">Pending</Badge> : <Badge variant="success">Paid</Badge>}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" className="h-8 text-brand-600" disabled={p.pending <= 0} onClick={() => handlePayout(p)}>Process Payout</Button>
            </TableCell>
          </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
