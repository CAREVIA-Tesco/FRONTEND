import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Filter, Download, Plus, MoreHorizontal, CalendarCheck, CalendarClock, CalendarX, CalendarDays } from "lucide-react"

const appointments = [
  {
    id: "APT-10284",
    patient: "Arun Kumar",
    provider: "Dr. Priya Kumar",
    specialization: "General Medicine",
    date: "21 Sep 2026",
    time: "10:30 AM",
    type: "Online",
    payment: "₹499",
    status: "Confirmed",
  },
  {
    id: "APT-10285",
    patient: "Sneha Patel",
    provider: "Dr. Rahul Sharma",
    specialization: "Dentist",
    date: "21 Sep 2026",
    time: "11:00 AM",
    type: "In-Clinic",
    payment: "₹800",
    status: "Completed",
  },
  {
    id: "APT-10286",
    patient: "Vikram Singh",
    provider: "Dr. Kabir Das",
    specialization: "Cardiology",
    date: "22 Sep 2026",
    time: "02:30 PM",
    type: "Online",
    payment: "₹699",
    status: "Pending",
  },
  {
    id: "APT-10287",
    patient: "Neha Sharma",
    provider: "Dr. Ananya Singh",
    specialization: "Gynecology",
    date: "23 Sep 2026",
    time: "04:00 PM",
    type: "Home Visit",
    payment: "₹1200",
    status: "Cancelled",
  }
]

export function Appointments() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Appointments</h1>
          <p className="text-muted mt-1">Manage all patient appointments and healthcare bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", value: "128", icon: CalendarCheck, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Upcoming", value: "486", icon: CalendarClock, color: "text-info", bg: "bg-blue-50" },
          { label: "Completed", value: "3,842", icon: CalendarDays, color: "text-success", bg: "bg-green-50" },
          { label: "Cancelled", value: "214", icon: CalendarX, color: "text-error", bg: "bg-red-50" }
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
            placeholder="Search patient, doctor or appointment ID..." 
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
            <TableHead className="w-12 text-center">
              <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            </TableHead>
            <TableHead>Appointment ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map(apt => (
            <TableRow key={apt.id}>
              <TableCell className="text-center">
                <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              </TableCell>
              <TableCell className="text-brand-600 font-medium">{apt.id}</TableCell>
              <TableCell className="font-medium">{apt.patient}</TableCell>
              <TableCell>{apt.provider}</TableCell>
              <TableCell className="text-muted">{apt.specialization}</TableCell>
              <TableCell>
                <div>{apt.date}</div>
                <div className="text-xs text-muted">{apt.time}</div>
              </TableCell>
              <TableCell>{apt.type}</TableCell>
              <TableCell>{apt.payment}</TableCell>
              <TableCell>
                {apt.status === "Confirmed" && <Badge variant="info">Confirmed</Badge>}
                {apt.status === "Completed" && <Badge variant="success">Completed</Badge>}
                {apt.status === "Pending" && <Badge variant="warning">Pending</Badge>}
                {apt.status === "Cancelled" && <Badge variant="error">Cancelled</Badge>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-brand-600">View</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-muted" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
