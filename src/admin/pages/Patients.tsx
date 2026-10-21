import { Link, useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Filter, Download, Plus, MoreHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import api from "../../services/api"
import { useApi, downloadCsv } from "../lib/useApi"

export function Patients() {
  const { data, error } = useApi(() => api.getPatients())
  const [urlParams] = useSearchParams()
  const [search, setSearch] = useState(urlParams.get("q") || "")
  useEffect(() => { const q = urlParams.get("q"); if (q !== null) setSearch(q) }, [urlParams])
  const allPatients = (data as any)?.patients || []
  const summary = (data as any)?.summary || { total: 0, active: 0, inactive: 0, newThisMonth: 0 }
  const patientList = allPatients.filter((p: any) => !search || `${p.name} ${p.email || ""} ${p.phone || ""} ${p.code}`.toLowerCase().includes(search.toLowerCase()))
  const exportCsv = () => downloadCsv("carevaa-patients.csv", [["Patient ID", "Name", "Email", "Phone", "Age", "Gender", "Appointments", "Status", "Joined"], ...patientList.map((p: any) => [p.code, p.name, p.email, p.phone, p.age, p.gender, p.appointments, p.status, p.joined])])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Patients</h1>
          <p className="text-muted mt-1">Manage and monitor all registered Carevaa patients.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Patients", value: String(summary.total) },
          { label: "Active Patients", value: String(summary.active) },
          { label: "New This Month", value: String(summary.newThisMonth) },
          { label: "Inactive Patients", value: String(summary.inactive) }
        ].map(stat => (
          <div key={stat.label} className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
            type="text" 
            placeholder="Search patients..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">
              <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            </TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Patient ID</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Appointments</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patientList.length === 0 && (
            <TableRow><TableCell colSpan={10} className="text-center text-muted py-8">No patients found.</TableCell></TableRow>
          )}
          {patientList.map((patient: any) => (
               <TableRow key={patient.id}>
                  <TableCell className="text-center">
                     <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                           {patient.name?.charAt(0) || 'P'}
                        </div>
                        <span className="font-medium text-charcoal">{patient.name || 'Anonymous'}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-muted text-sm">{patient.code}</TableCell>
                  <TableCell className="text-sm">
                     <div>{patient.email || '-'}</div>
                     <div className="text-xs text-muted">{patient.phone || ''}</div>
                  </TableCell>
                  <TableCell className="text-sm">{patient.age || '-'}</TableCell>
                  <TableCell className="text-sm">{patient.gender || '-'}</TableCell>
                  <TableCell className="text-sm font-medium">{patient.appointments}</TableCell>
                  <TableCell>
                     {patient.status === "Active" ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted">{patient.joined}</TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/patients/${patient.id}`}>
                           <MoreHorizontal className="h-4 w-4" />
                        </Link>
                     </Button>
                  </TableCell>
               </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
