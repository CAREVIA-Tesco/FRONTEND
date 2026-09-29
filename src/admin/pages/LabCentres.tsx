import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Plus, FlaskConical, CheckCircle2, AlertTriangle, Users } from "lucide-react"

export function LabCentres() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Lab Centres</h1>
          <p className="text-muted mt-1">Manage diagnostic laboratories and testing centres.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Lab Centre
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Lab Centres", value: "84", icon: FlaskConical, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Verified", value: "72", icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
          { label: "Pending Verification", value: "12", icon: AlertTriangle, color: "text-warning", bg: "bg-amber-50" },
          { label: "Active", value: "78", icon: Users, color: "text-info", bg: "bg-blue-50" }
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lab Centre</TableHead>
            <TableHead>Centre ID</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Tests Available</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Apollo Diagnostics</TableCell>
            <TableCell className="text-brand-600 font-medium">LAB-1028</TableCell>
            <TableCell>Chennai</TableCell>
            <TableCell>184 Tests</TableCell>
            <TableCell>1,284</TableCell>
            <TableCell>4.7</TableCell>
            <TableCell><Badge variant="success">Verified</Badge></TableCell>
            <TableCell><Badge variant="success">Active</Badge></TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" className="h-8 text-brand-600">View</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
