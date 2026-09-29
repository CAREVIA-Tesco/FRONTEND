import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Filter, Download } from "lucide-react"

export function Payments() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Payments</h1>
          <p className="text-muted mt-1">Monitor payments, revenue and payment activity across Carevia.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <select className="h-10 rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Revenue", value: "₹18,60,450" },
          { label: "Today's Revenue", value: "₹84,250" },
          { label: "Successful Payments", value: "3,482" },
          { label: "Pending Payments", value: "₹1,20,400" },
          { label: "Refunds", value: "₹42,500" }
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
            type="text" 
            placeholder="Search transaction ID, patient..." 
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
          <TableRow>
            <TableCell className="text-brand-600 font-medium">TXN-98273</TableCell>
            <TableCell className="font-medium">Arun Kumar</TableCell>
            <TableCell>Dr. Priya Kumar</TableCell>
            <TableCell>APT-10284</TableCell>
            <TableCell className="font-semibold text-charcoal">₹499</TableCell>
            <TableCell>
               <div className="flex items-center gap-1.5">
                  <span className="text-sm">UPI</span>
               </div>
            </TableCell>
            <TableCell>21 Sep 2026</TableCell>
            <TableCell><Badge variant="success">Successful</Badge></TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-brand-600">View</Button>
                <Button variant="ghost" size="sm" className="h-8">Refund</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
