import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Filter, Undo2, Clock, CheckCircle2, XCircle } from "lucide-react"

export function Refunds() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Refunds</h1>
        <p className="text-muted mt-1">Manage patient refund requests and processing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Refund Requests", value: "248", icon: Undo2, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Pending", value: "42", icon: Clock, color: "text-warning", bg: "bg-amber-50" },
          { label: "Approved", value: "18", icon: CheckCircle2, color: "text-info", bg: "bg-blue-50" },
          { label: "Completed", value: "164", icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
          { label: "Rejected", value: "24", icon: XCircle, color: "text-error", bg: "bg-red-50" }
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
            type="text" 
            placeholder="Search refund ID, transaction ID..." 
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
          <TableRow>
            <TableCell className="text-brand-600 font-medium">REF-4029</TableCell>
            <TableCell className="text-muted">TXN-98273</TableCell>
            <TableCell className="font-medium">Arun Kumar</TableCell>
            <TableCell className="font-semibold text-charcoal">₹499</TableCell>
            <TableCell>Doctor Cancelled</TableCell>
            <TableCell>21 Sep 2026</TableCell>
            <TableCell><Badge variant="warning">Pending</Badge></TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" className="h-8 text-brand-600">Review</Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-brand-600 font-medium">REF-4028</TableCell>
            <TableCell className="text-muted">TXN-98270</TableCell>
            <TableCell className="font-medium">Vikram Singh</TableCell>
            <TableCell className="font-semibold text-charcoal">₹800</TableCell>
            <TableCell>Patient No Show</TableCell>
            <TableCell>20 Sep 2026</TableCell>
            <TableCell><Badge variant="error">Rejected</Badge></TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" className="h-8 text-brand-600">View</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
