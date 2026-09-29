import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Card, CardContent } from "../components/ui/Card"
import { Search, Filter, Calendar, Users, UserCheck, UserX, Clock } from "lucide-react"

export function Availability() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Availability</h1>
        <p className="text-muted mt-1">Manage provider schedules, working hours and appointment availability.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Available Providers", value: "824", icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Currently Online", value: "142", icon: UserCheck, color: "text-success", bg: "bg-green-50" },
          { label: "Unavailable", value: "218", icon: UserX, color: "text-error", bg: "bg-red-50" },
          { label: "Today's Open Slots", value: "2,486", icon: Clock, color: "text-info", bg: "bg-blue-50" }
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
            placeholder="Search doctor, provider or specialization..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-surface text-sm">
            <Calendar className="h-4 w-4 text-muted" />
            <span>Today, 21 Sep 2026</span>
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="font-semibold text-charcoal">Schedule Overview</h3>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button className="px-3 py-1 text-sm font-medium text-muted rounded-md hover:text-charcoal transition-colors">Day</button>
              <button className="px-3 py-1 text-sm font-medium bg-white text-charcoal shadow-sm rounded-md">Week</button>
              <button className="px-3 py-1 text-sm font-medium text-muted rounded-md hover:text-charcoal transition-colors">Month</button>
            </div>
          </div>
          <div className="p-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Mock Calendar Grid */}
              <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-sm font-medium text-muted text-center">
                <div className="p-3 border-r border-slate-200">Time</div>
                <div className="p-3 border-r border-slate-200 text-brand-600 font-bold">Mon 21</div>
                <div className="p-3 border-r border-slate-200">Tue 22</div>
                <div className="p-3 border-r border-slate-200">Wed 23</div>
                <div className="p-3 border-r border-slate-200">Thu 24</div>
                <div className="p-3 border-r border-slate-200">Fri 25</div>
                <div className="p-3 border-r border-slate-200">Sat 26</div>
                <div className="p-3">Sun 27</div>
              </div>
              <div className="grid grid-cols-8 relative h-[400px] overflow-y-auto">
                <div className="border-r border-slate-200">
                  {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'].map(t => (
                    <div key={t} className="h-16 border-b border-slate-100 text-xs text-muted p-2 text-right">{t}</div>
                  ))}
                </div>
                {/* Mock Schedule Blocks */}
                <div className="relative border-r border-slate-200">
                  <div className="absolute top-2 left-1 right-1 h-28 bg-green-100/50 border border-green-200 rounded p-1 text-xs text-green-700">
                    <div className="font-semibold">Available</div>
                    Dr. Priya
                  </div>
                  <div className="absolute top-[136px] left-1 right-1 h-12 bg-blue-100/50 border border-blue-200 rounded p-1 text-xs text-blue-700">
                    <div className="font-semibold">Booked</div>
                  </div>
                  <div className="absolute top-[264px] left-1 right-1 h-12 bg-red-100/50 border border-red-200 rounded p-1 text-xs text-red-700">
                    <div className="font-semibold">Emergency</div>
                  </div>
                </div>
                {/* Fill empty columns */}
                {[2, 3, 4, 5, 6, 7].map(col => (
                   <div key={col} className="border-r border-slate-200 last:border-0 relative">
                     <div className="absolute top-4 left-1 right-1 h-24 bg-green-100/50 border border-green-200 rounded p-1 text-xs text-green-700">
                        Available
                     </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Working Days</TableHead>
            <TableHead>Working Hours</TableHead>
            <TableHead>Available Slots</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Dr. Priya Kumar</TableCell>
            <TableCell>General Medicine</TableCell>
            <TableCell>Mon–Sat</TableCell>
            <TableCell>09:00 AM–06:00 PM</TableCell>
            <TableCell>18 Slots</TableCell>
            <TableCell><Badge variant="success">Available</Badge></TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-brand-600">Edit Schedule</Button>
                <Button variant="ghost" size="sm" className="h-8 text-charcoal">Block Time</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
