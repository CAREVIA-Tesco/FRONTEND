import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Filter, HandCoins, CheckCircle2, Users, CalendarCheck } from "lucide-react"

export function ProviderPayouts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Provider Payouts</h1>
        <p className="text-muted mt-1">Manage and process provider earnings and commission payouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Payouts", value: "₹4.2L", icon: HandCoins, color: "text-warning", bg: "bg-amber-50" },
          { label: "Processed This Month", value: "₹12.8L", icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
          { label: "Providers Paid", value: "824", icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Next Payout", value: "28 Sep 2026", icon: CalendarCheck, color: "text-info", bg: "bg-blue-50" }
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
          <TableRow>
            <TableCell className="font-medium">Dr. Priya Kumar</TableCell>
            <TableCell>42</TableCell>
            <TableCell>₹20,958</TableCell>
            <TableCell className="text-error">-₹2,095</TableCell>
            <TableCell className="text-error">₹0</TableCell>
            <TableCell className="font-bold text-charcoal">₹18,863</TableCell>
            <TableCell>28 Sep 2026</TableCell>
            <TableCell><Badge variant="warning">Pending</Badge></TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" className="h-8 text-brand-600">Process Payout</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
