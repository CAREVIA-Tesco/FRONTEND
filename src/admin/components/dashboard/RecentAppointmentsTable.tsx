import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"

const appointments = [
  {
    id: "#APT-10482",
    patient: "Arun Kumar",
    provider: "Dr. Priya",
    specialization: "General Medicine",
    date: "21 Sep 2026",
    time: "10:30 AM",
    type: "Online",
    status: "Completed",
  },
  {
    id: "#APT-10483",
    patient: "Sneha Patel",
    provider: "Dr. Rahul",
    specialization: "Cardiology",
    date: "21 Sep 2026",
    time: "11:00 AM",
    type: "In-Clinic",
    status: "Upcoming",
  },
  {
    id: "#APT-10484",
    patient: "Vikram Singh",
    provider: "Dr. Ananya",
    specialization: "Dermatology",
    date: "21 Sep 2026",
    time: "11:30 AM",
    type: "Online",
    status: "Pending",
  },
  {
    id: "#APT-10485",
    patient: "Neha Sharma",
    provider: "Dr. Kabir",
    specialization: "Pediatrics",
    date: "21 Sep 2026",
    time: "12:00 PM",
    type: "Home Visit",
    status: "Cancelled",
  },
]

export function RecentAppointmentsTable() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return <Badge variant="success">Completed</Badge>
      case "Upcoming": return <Badge variant="info">Upcoming</Badge>
      case "Pending": return <Badge variant="warning">Pending</Badge>
      case "Cancelled": return <Badge variant="error">Cancelled</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Appointments</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Appointment ID</th>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Specialization</th>
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-brand-600">{apt.id}</td>
                  <td className="px-4 py-3">{apt.patient}</td>
                  <td className="px-4 py-3">{apt.provider}</td>
                  <td className="px-4 py-3 text-muted">{apt.specialization}</td>
                  <td className="px-4 py-3">
                    <div>{apt.date}</div>
                    <div className="text-xs text-muted">{apt.time}</div>
                  </td>
                  <td className="px-4 py-3">{apt.type}</td>
                  <td className="px-4 py-3">{getStatusBadge(apt.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-brand-600">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
