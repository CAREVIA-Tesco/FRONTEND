import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Plus, HeartHandshake, CheckCircle2, Users, Star } from "lucide-react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import { useApi, providerCode } from "../lib/useApi"

export function Caretakers() {
  const { data, error } = useApi(() => api.getProviders({ status: "ALL" }))
  const caretakers = ((data as any)?.providers || []).filter((p: any) => p.profession === "Caretaker" || p.profession === "Nurse")
  const active = caretakers.filter((p: any) => p.status === "ACTIVE")
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Caretakers</h1>
          <p className="text-muted mt-1">Manage Carevaa home care and caretaker professionals.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Caretaker
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Caretakers", value: String(caretakers.length), icon: HeartHandshake, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Available", value: String(active.length), icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
          { label: "Currently Booked", value: String(caretakers.reduce((t: number, p: any) => t + (p.bookings || 0), 0)), icon: Users, color: "text-info", bg: "bg-blue-50" },
          { label: "Pending Verification", value: String(caretakers.filter((p: any) => p.status === "PENDING").length), icon: Star, color: "text-warning", bg: "bg-amber-50" }
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
            <TableHead>Caretaker</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {caretakers.length === 0 && (
            <TableRow><TableCell colSpan={10} className="text-center text-muted py-8">No caretakers or nurses registered yet.</TableCell></TableRow>
          )}
          {caretakers.map((c: any) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell className="text-brand-600 font-medium">{providerCode("CAR", c.id)}</TableCell>
            <TableCell>{c.exp}</TableCell>
            <TableCell>{c.loc || "-"}</TableCell>
            <TableCell>{c.status === "ACTIVE" ? <Badge variant="success">Available</Badge> : <Badge variant="default">Unavailable</Badge>}</TableCell>
            <TableCell>{c.bookings || 0}</TableCell>
            <TableCell>{c.rating}</TableCell>
            <TableCell>{c.status === "PENDING" ? <Badge variant="warning">Pending</Badge> : c.status === "ACTIVE" ? <Badge variant="success">Verified</Badge> : <Badge variant="error">Rejected</Badge>}</TableCell>
            <TableCell>{c.status === "ACTIVE" ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge>}</TableCell>
            <TableCell className="text-right">
              <Link to={`/admin/providers/${c.id}`}><Button variant="ghost" size="sm" className="h-8 text-brand-600">View</Button></Link>
            </TableCell>
          </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
