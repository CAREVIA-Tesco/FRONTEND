import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Plus, FlaskConical, CheckCircle2, AlertTriangle, Users } from "lucide-react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import { useApi, providerCode } from "../lib/useApi"

export function LabCentres() {
  const { data, error } = useApi(() => api.getProviders({ status: "ALL", profession: "Lab Centre" }))
  const labs = (data as any)?.providers || []
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
          { label: "Total Lab Centres", value: String(labs.length), icon: FlaskConical, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Verified", value: String(labs.filter((l: any) => l.status === "ACTIVE").length), icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
          { label: "Pending Verification", value: String(labs.filter((l: any) => l.status === "PENDING").length), icon: AlertTriangle, color: "text-warning", bg: "bg-amber-50" },
          { label: "Active", value: String(labs.filter((l: any) => l.status === "ACTIVE").length), icon: Users, color: "text-info", bg: "bg-blue-50" }
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

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
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
          {labs.length === 0 && (
            <TableRow><TableCell colSpan={9} className="text-center text-muted py-8">No lab centres registered yet.</TableCell></TableRow>
          )}
          {labs.map((l: any) => (
          <TableRow key={l.id}>
            <TableCell className="font-medium">{l.name}</TableCell>
            <TableCell className="text-brand-600 font-medium">{providerCode("LAB", l.id)}</TableCell>
            <TableCell>{l.loc || "-"}</TableCell>
            <TableCell>{l.specialization || "General Diagnostic Tests"}</TableCell>
            <TableCell>{l.bookings || 0}</TableCell>
            <TableCell>{l.rating}</TableCell>
            <TableCell>{l.status === "PENDING" ? <Badge variant="warning">Pending</Badge> : l.status === "ACTIVE" ? <Badge variant="success">Verified</Badge> : <Badge variant="error">Rejected</Badge>}</TableCell>
            <TableCell>{l.status === "ACTIVE" ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge>}</TableCell>
            <TableCell className="text-right">
              <Link to={`/admin/providers/${l.id}`}><Button variant="ghost" size="sm" className="h-8 text-brand-600">View</Button></Link>
            </TableCell>
          </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
