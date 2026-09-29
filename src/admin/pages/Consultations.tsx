import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Card, CardContent } from "../components/ui/Card"
import { Search, Filter, Video, Users, CheckCircle2, XCircle } from "lucide-react"

const consultations = [
  {
    id: "CON-10282",
    patient: "Arun Kumar",
    provider: "Dr. Priya Kumar",
    startTime: "10:30 AM",
    duration: "32 min",
    type: "Video",
    status: "Completed",
  },
  {
    id: "CON-10283",
    patient: "Sneha Patel",
    provider: "Dr. Rahul Sharma",
    startTime: "11:15 AM",
    duration: "18:42",
    type: "Video",
    status: "Live",
  },
  {
    id: "CON-10284",
    patient: "Vikram Singh",
    provider: "Dr. Kabir Das",
    startTime: "11:45 AM",
    duration: "-",
    type: "Audio",
    status: "Waiting",
  }
]

export function Consultations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Consultations</h1>
        <p className="text-muted mt-1">Monitor and manage online healthcare consultations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Consultations", value: "2,196", icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Active Now", value: "18", icon: Video, color: "text-success", bg: "bg-green-50" },
          { label: "Completed", value: "1,948", icon: CheckCircle2, color: "text-charcoal", bg: "bg-slate-100" },
          { label: "Cancelled", value: "230", icon: XCircle, color: "text-error", bg: "bg-red-50" }
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

      <div>
        <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
          Live Consultations
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-success/30 bg-green-50/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium text-xs">AK</div>
                    <span className="font-medium text-sm">Arun K.</span>
                  </div>
                  <Badge variant="success" className="animate-pulse">LIVE</Badge>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-charcoal font-medium text-xs">PK</div>
                  <span className="font-medium text-sm">Dr. Priya K.</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted mb-4">
                  <div>Started: <span className="text-charcoal font-medium">10:30 AM</span></div>
                  <div>Duration: <span className="text-charcoal font-medium">18:42</span></div>
                </div>
                <Button variant="outline" className="w-full text-brand-600 border-brand-200 hover:bg-brand-50">
                  <Video className="h-4 w-4 mr-2" /> View Consultation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-2xl border border-slate-200 shadow-sm mt-8">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input 
            type="text" 
            placeholder="Search consultation ID, patient..." 
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
            <TableHead>Consultation ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultations.map(con => (
            <TableRow key={con.id}>
              <TableCell className="text-brand-600 font-medium">{con.id}</TableCell>
              <TableCell className="font-medium">{con.patient}</TableCell>
              <TableCell>{con.provider}</TableCell>
              <TableCell>{con.startTime}</TableCell>
              <TableCell>{con.duration}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-muted" /> {con.type}
                </div>
              </TableCell>
              <TableCell>
                {con.status === "Live" && <Badge variant="success" className="animate-pulse">Live</Badge>}
                {con.status === "Completed" && <Badge variant="default">Completed</Badge>}
                {con.status === "Waiting" && <Badge variant="warning">Waiting</Badge>}
                {con.status === "Cancelled" && <Badge variant="error">Cancelled</Badge>}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-brand-600">View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
