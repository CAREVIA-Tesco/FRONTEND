import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Plus, HeartHandshake, CheckCircle2, Users, Star } from "lucide-react"

export function Caretakers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Caretakers</h1>
          <p className="text-muted mt-1">Manage Carevia home care and caretaker professionals.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Caretaker
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Caretakers", value: "342", icon: HeartHandshake, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Available", value: "128", icon: CheckCircle2, color: "text-success", bg: "bg-green-50" },
          { label: "Currently Booked", value: "184", icon: Users, color: "text-info", bg: "bg-blue-50" },
          { label: "Pending Verification", value: "30", icon: Star, color: "text-warning", bg: "bg-amber-50" }
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
          <TableRow>
            <TableCell className="font-medium">Lakshmi Devi</TableCell>
            <TableCell className="text-brand-600 font-medium">CAR-1024</TableCell>
            <TableCell>5 Years</TableCell>
            <TableCell>Chennai</TableCell>
            <TableCell><Badge variant="success">Available</Badge></TableCell>
            <TableCell>82</TableCell>
            <TableCell>4.8</TableCell>
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
