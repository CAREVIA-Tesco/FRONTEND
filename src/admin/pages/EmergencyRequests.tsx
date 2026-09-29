import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Filter, AlertTriangle, Clock, UserCheck, CheckCircle2 } from "lucide-react"

export function EmergencyRequests() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Emergency Requests</h1>
        <p className="text-muted mt-1">Monitor urgent healthcare requests and coordinate immediate assistance.</p>
      </div>

      <div className="bg-error/10 border border-error/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-error" />
          <span className="font-semibold text-error">12 active emergency requests require attention.</span>
        </div>
        <Button variant="danger" size="sm">View Active Requests</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Emergencies", value: "12", icon: AlertTriangle, color: "text-error", bg: "bg-red-50" },
          { label: "Waiting for Response", value: "5", icon: Clock, color: "text-warning", bg: "bg-amber-50" },
          { label: "Assigned", value: "7", icon: UserCheck, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Resolved Today", value: "28", icon: CheckCircle2, color: "text-success", bg: "bg-green-50" }
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
          <TableRow>
            <TableCell className="text-brand-600 font-medium">EMR-10284</TableCell>
            <TableCell className="font-medium">Arun Kumar</TableCell>
            <TableCell>Chennai</TableCell>
            <TableCell>Emergency Medical Assistance</TableCell>
            <TableCell>
               <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  <span className="font-semibold text-orange-600">HIGH</span>
               </div>
            </TableCell>
            <TableCell>10:32 AM</TableCell>
            <TableCell>Dr. Priya Kumar</TableCell>
            <TableCell><Badge variant="info">Assigned</Badge></TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-brand-600">View</Button>
                <Button variant="ghost" size="sm" className="h-8">Contact</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
