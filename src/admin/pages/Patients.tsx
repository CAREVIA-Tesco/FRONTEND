import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Modal } from "../components/ui/Modal"
import { Notice } from "../components/ui/Notice"
import { Pager } from "../components/ui/Pager"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Download, Plus, Copy } from "lucide-react"
import { useEffect, useState } from "react"
import api from "../../services/api"
import { useApi, downloadCsv } from "../lib/useApi"
import { inputCls, labelCls, paginate } from "../lib/forms"

const blank = { name: "", phone: "", email: "", age: "", gender: "", city: "", pincode: "", conditions: "", password: "" }

export function Patients() {
  const navigate = useNavigate()
  const { data, error, reload } = useApi(() => api.getPatients())
  const [urlParams] = useSearchParams()
  const [search, setSearch] = useState(urlParams.get("q") || "")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(blank)
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<{ patient: any; password?: string } | null>(null)
  const [notice, setNotice] = useState("")
  useEffect(() => { const q = urlParams.get("q"); if (q !== null) setSearch(q) }, [urlParams])
  useEffect(() => { setPage(1) }, [search, status])
  const allPatients = (data as any)?.patients || []
  const summary = (data as any)?.summary || { total: 0, active: 0, inactive: 0, newThisMonth: 0 }
  const patientList = allPatients.filter((p: any) => (!status || p.status === status) && (!search || `${p.name} ${p.email || ""} ${p.phone || ""} ${p.code} ${p.city || ""} ${p.pincode || ""}`.toLowerCase().includes(search.toLowerCase())))
  const paged = paginate(patientList, page)
  const exportCsv = () => downloadCsv("carevaa-patients.csv", [["Patient ID", "Name", "Email", "Phone", "Age", "Gender", "City", "PIN code", "Appointments", "Status", "Joined"], ...patientList.map((p: any) => [p.code, p.name, p.email, p.phone, p.age, p.gender, p.city, p.pincode, p.appointments, p.status, p.joined])])
  const set = (k: keyof typeof blank) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.name.trim()) { setFormError("Patient name is required"); return }
    if (!/^[6-9]\d{9}$/.test(form.phone)) { setFormError("Please enter a valid 10-digit mobile number"); return }
    if (form.pincode && !/^[1-9]\d{5}$/.test(form.pincode)) { setFormError("Please enter a valid 6-digit PIN code"); return }
    if (form.password && form.password.length < 6) { setFormError("Password must be at least 6 characters"); return }
    setSaving(true); setFormError("")
    try {
      const res: any = await api.createPatient(form)
      setOpen(false)
      setCreated({ patient: res.patient, password: res.temporaryPassword })
      reload()
    } catch (err: any) { setFormError(err.message) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Patients</h1>
          <p className="text-muted mt-1">Manage and monitor all registered Carevaa patients.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => { setForm(blank); setFormError(""); setOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </div>
      </div>

      <Notice text={notice} onClose={() => setNotice("")} />

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

      <div className="flex flex-col sm:flex-row gap-3 items-center bg-surface p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search name, phone, email, city or PIN..." className="w-full pl-10 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select aria-label="Status filter" value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-full sm:w-auto rounded-lg border border-slate-200 bg-surface px-3 text-sm">
          <option value="">All patients</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm">
      <Table className="border-0 rounded-none shadow-none">
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Patient ID</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Appointments</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.rows.length === 0 && (
            <TableRow><TableCell colSpan={9} className="text-center text-muted py-8">No patients found.</TableCell></TableRow>
          )}
          {paged.rows.map((patient: any) => (
               <TableRow key={patient.id} className="cursor-pointer" onClick={() => navigate(`/admin/patients/${patient.id}`)}>
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
                     <div>{patient.phone ? `+91 ${patient.phone}` : '-'}</div>
                     <div className="text-xs text-muted">{patient.email || ''}</div>
                  </TableCell>
                  <TableCell className="text-sm">{patient.age ?? '-'}{patient.gender ? ` · ${patient.gender}` : ''}</TableCell>
                  <TableCell className="text-sm">{patient.city || '-'}{patient.pincode ? ` · ${patient.pincode}` : ''}</TableCell>
                  <TableCell className="text-sm font-medium">{patient.appointments}</TableCell>
                  <TableCell>
                     {patient.status === "Active" ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted">{patient.joined}</TableCell>
                  <TableCell className="text-right">
                     <Link to={`/admin/patients/${patient.id}`} onClick={(e) => e.stopPropagation()} className="h-8 px-2.5 inline-flex items-center rounded-md text-sm font-medium text-brand-600 hover:bg-slate-100">View</Link>
                  </TableCell>
               </TableRow>
            ))}
        </TableBody>
      </Table>
      <Pager page={paged.current} pages={paged.pages} from={paged.from} to={paged.to} total={patientList.length} label="patients" onPage={setPage} />
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Patient" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-muted">For patients who call in. They can log in on the website with this mobile number and the password below, and earlier bookings made with this number are added to their account.</p>
          {formError && <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label htmlFor="ap-name" className={labelCls}>Full name *</label><input id="ap-name" className={inputCls} value={form.name} onChange={set("name")} /></div>
            <div><label htmlFor="ap-phone" className={labelCls}>Mobile *</label><input id="ap-phone" inputMode="numeric" maxLength={10} className={inputCls} placeholder="10-digit mobile" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} /></div>
            <div><label htmlFor="ap-email" className={labelCls}>Email</label><input id="ap-email" type="email" className={inputCls} value={form.email} onChange={set("email")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="ap-age" className={labelCls}>Age</label><input id="ap-age" type="number" min="0" max="120" className={inputCls} value={form.age} onChange={set("age")} /></div>
              <div><label htmlFor="ap-gender" className={labelCls}>Gender</label><select id="ap-gender" className={inputCls} value={form.gender} onChange={set("gender")}><option value="">—</option><option>Female</option><option>Male</option><option>Other</option></select></div>
            </div>
            <div><label htmlFor="ap-city" className={labelCls}>City</label><input id="ap-city" className={inputCls} value={form.city} onChange={set("city")} /></div>
            <div><label htmlFor="ap-pin" className={labelCls}>PIN code</label><input id="ap-pin" inputMode="numeric" maxLength={6} className={inputCls} value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} /></div>
            <div className="sm:col-span-2"><label htmlFor="ap-cond" className={labelCls}>Medical conditions / allergies</label><input id="ap-cond" className={inputCls} placeholder="e.g. Diabetes, BP (comma separated)" value={form.conditions} onChange={set("conditions")} /></div>
            <div className="sm:col-span-2"><label htmlFor="ap-pass" className={labelCls}>Password <span className="font-normal text-muted">(leave empty to create a temporary one)</span></label><input id="ap-pass" type="text" autoComplete="off" className={inputCls} value={form.password} onChange={set("password")} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Patient"}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!created} onClose={() => setCreated(null)} title="Patient added">
        {created && (
          <div className="space-y-4 text-sm">
            <p><span className="font-semibold">{created.patient.name}</span> can now log in on the website with <span className="font-semibold">{created.patient.phone}</span>.</p>
            {created.password && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                <p className="text-amber-800">Temporary password – share it with the patient now. It is not shown again.</p>
                <p className="mt-2 flex items-center gap-2"><code className="text-base font-bold text-charcoal" data-testid="temp-password">{created.password}</code>
                  <button type="button" onClick={() => { navigator.clipboard?.writeText(created.password!).catch(() => {}); setNotice("Password copied") }} className="p-1 rounded hover:bg-amber-100" aria-label="Copy password"><Copy className="h-4 w-4" /></button></p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCreated(null)}>Close</Button>
              <Button onClick={() => navigate(`/admin/patients/${created.patient.id}`)}>Open profile</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
