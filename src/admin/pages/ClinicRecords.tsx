import { useEffect, useMemo, useState } from "react"
import { Users, CalendarCheck, CalendarDays, ClipboardList, Search, Download, Link2 } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { Modal } from "../components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Pager } from "../components/ui/Pager"
import { paginate } from "../lib/forms"
import api from "../../services/api"
import { PatientRecord, downloadCsv, visitCsvRows } from "../../components/PatientVisits"

// Patient Visit Management – all doctors' clinic patients and visits, with doctor-wise reports.
const pad = (n: number) => String(n).padStart(2, "0")
const localDay = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fmt = (d: string) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : "-")
const inputCls = "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"

export function ClinicRecords() {
  const today = localDay()
  const [tab, setTab] = useState<"report" | "visits" | "patients" | "links">("report")
  const [from, setFrom] = useState(`${today.slice(0, 7)}-01`)
  const [to, setTo] = useState(today)
  const [doctor, setDoctor] = useState("")
  const [search, setSearch] = useState("")
  const [report, setReport] = useState<any>(null)
  const [doctorsList, setDoctorsList] = useState<any[]>([])
  const [visits, setVisits] = useState<any[] | null>(null)
  const [patients, setPatients] = useState<any[] | null>(null)
  const [links, setLinks] = useState<any[] | null>(null)
  const [error, setError] = useState("")
  const [open, setOpen] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // every doctor with records (or registered) – for the doctor filter
  useEffect(() => { api.adminClinicReport({ from, to }).then((d: any) => setDoctorsList(d.doctors || [])).catch(() => {}) }, [from, to])
  useEffect(() => {
    setError("")
    api.adminClinicReport({ from, to, providerId: doctor }).then(setReport).catch((e: any) => setError(e.message))
  }, [from, to, doctor])
  useEffect(() => {
    setVisits(null)
    const t = setTimeout(() => { api.clinicVisits({ from, to, providerId: doctor, search, limit: 5000 }).then((d: any) => setVisits(d.visits || [])).catch((e: any) => setError(e.message)) }, 250)
    return () => clearTimeout(t)
  }, [from, to, doctor, search])
  useEffect(() => {
    setPatients(null)
    const t = setTimeout(() => { api.clinicPatients({ providerId: doctor, search, limit: 1000 }).then((d: any) => setPatients(d.patients || [])).catch((e: any) => setError(e.message)) }, 250)
    return () => clearTimeout(t)
  }, [doctor, search])
  useEffect(() => {
    setLinks(null)
    const t = setTimeout(() => { api.getRegistrationLinks({ providerId: doctor, search, limit: 500 }).then((d: any) => setLinks(d.links || [])).catch((e: any) => setError(e.message)) }, 250)
    return () => clearTimeout(t)
  }, [doctor, search])
  useEffect(() => { setPage(1) }, [tab, from, to, doctor, search])

  const totals = report?.totals
  const cards = [
    ["Total patients", totals?.totalPatients, Users],
    ["Today's visits", totals?.todayVisits, CalendarCheck],
    ["This month", totals?.monthVisits, CalendarDays],
    ["Visits in period", totals?.visits, ClipboardList],
  ] as const
  const max = Math.max(1, ...((report?.daily || []).map((d: any) => d.visits)))
  const pagedVisits = paginate(visits || [], page)
  const pagedPatients = paginate(patients || [], page)
  const pagedLinks = paginate(links || [], page)
  const doctorName = useMemo(() => doctorsList.find((d) => d.providerId === doctor)?.doctor, [doctorsList, doctor])

  const exportReport = () => downloadCsv(`doctor-visit-report-${from}-to-${to}.csv`, [
    ["Doctor", "Speciality", "Total patients", `Visits ${from} to ${to}`, `Patients ${from} to ${to}`, "Today's visits", "This month's visits"],
    ...(report?.doctors || []).map((d: any) => [d.doctor, d.spec, d.totalPatients, d.visitsInRange, d.patientsInRange, d.todayVisits, d.monthVisits]),
    [],
    ["Date", "Visits"], ...(report?.daily || []).map((d: any) => [d.date, d.visits]),
  ])

  return (
    <div className="space-y-6" data-testid="clinic-records">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Patient Visits</h1>
          <p className="text-muted mt-1">Clinic patients entered by each doctor and their nurses – records, visit history and doctor-wise reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(([label, value, Icon]) => (
          <Card key={label}><CardContent className="p-5 flex items-center gap-4">
            <span className="h-11 w-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><Icon className="h-5 w-5" /></span>
            <div><p className="text-2xl font-bold text-charcoal">{value ?? "–"}</p><p className="text-xs text-muted">{label}{doctorName ? ` · ${doctorName}` : ""}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-4 flex flex-wrap items-end gap-3">
        <label className="text-xs text-muted">From<input aria-label="From date" type="date" className={`${inputCls} block mt-1`} value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="text-xs text-muted">To<input aria-label="To date" type="date" className={`${inputCls} block mt-1`} value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} /></label>
        <label className="text-xs text-muted">Doctor
          <select aria-label="Doctor" className={`${inputCls} block mt-1 min-w-[200px]`} value={doctor} onChange={(e) => setDoctor(e.target.value)}>
            <option value="">All doctors</option>
            {doctorsList.map((d) => <option key={d.providerId} value={d.providerId}>{d.doctor}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted flex-1 min-w-[200px]">Search patient
          <span className="relative block mt-1"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input aria-label="Search patient" className={`${inputCls} w-full pl-9`} placeholder="Name, mobile, patient ID or diagnosis" value={search} onChange={(e) => setSearch(e.target.value)} /></span>
        </label>
      </CardContent></Card>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100" role="tablist">
          {([["report", "Doctor-wise report"], ["visits", `All visits (${visits?.length ?? "…"})`], ["patients", `Patients (${patients?.length ?? "…"})`], ["links", `Registration links (${links?.length ?? "…"})`]] as const).map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-9 px-3.5 rounded-lg text-sm font-semibold ${tab === k ? "bg-white shadow-sm text-charcoal" : "text-muted hover:text-charcoal"}`}>{l}</button>
          ))}
        </div>
        {tab === "report" && <Button variant="outline" onClick={exportReport}><Download className="h-4 w-4 mr-2" /> Export report</Button>}
        {tab === "visits" && <Button variant="outline" onClick={() => downloadCsv(`patient-visits-${from}-to-${to}.csv`, visitCsvRows(visits || [], true))}><Download className="h-4 w-4 mr-2" /> Export visits</Button>}
        {tab === "patients" && <Button variant="outline" onClick={() => downloadCsv("clinic-patients.csv", [["Patient ID", "Name", "Age", "Gender", "Mobile", "Doctor", "Visits", "First visit", "Last visit"], ...(patients || []).map((p: any) => [p.code, p.name, p.age, p.gender, p.phone, p.doctor, p.visitCount, fmt(p.firstVisitAt), fmt(p.lastVisitAt)])])}><Download className="h-4 w-4 mr-2" /> Export patients</Button>}
        {tab === "links" && <Button variant="outline" onClick={() => downloadCsv("registration-links.csv", [["Code", "Doctor", "Patient", "Mobile", "Status", "Nurse", "Created at", "Submitted at"], ...(links || []).map((l: any) => [l.code, l.doctor, l.patientName || l.patient?.name || "-", l.patientPhone || l.patient?.phone || "-", l.status, l.recordedBy || "-", fmt(l.createdAt), fmt(l.submittedAt)])])}><Download className="h-4 w-4 mr-2" /> Export links</Button>}
      </div>

      {tab === "report" && (
        <div className="space-y-6">
          <div className="bg-surface border border-slate-200 rounded-2xl overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Doctor</TableHead><TableHead className="text-right">Total patients</TableHead><TableHead className="text-right">Visits in period</TableHead><TableHead className="text-right">Patients in period</TableHead><TableHead className="text-right">Today</TableHead><TableHead className="text-right">This month</TableHead><TableHead />
              </TableRow></TableHeader>
              <TableBody>
                {!report && <TableRow><TableCell colSpan={7} className="text-center text-muted py-8">Loading…</TableCell></TableRow>}
                {report?.doctors?.map((d: any) => (
                  <TableRow key={d.providerId}>
                    <TableCell><span className="font-medium">{d.doctor}</span><span className="block text-xs text-muted">{d.spec}</span></TableCell>
                    <TableCell className="text-right font-semibold">{d.totalPatients}</TableCell>
                    <TableCell className="text-right">{d.visitsInRange}</TableCell>
                    <TableCell className="text-right">{d.patientsInRange}</TableCell>
                    <TableCell className="text-right">{d.todayVisits}</TableCell>
                    <TableCell className="text-right">{d.monthVisits}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" className="h-8 text-brand-600" onClick={() => { setDoctor(d.providerId); setTab("patients") }}>View patients</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {report && (
            <Card><CardContent className="p-5">
              <p className="font-semibold text-charcoal mb-3">Daily visits {doctorName ? `– ${doctorName}` : "– all doctors"}</p>
              <div className="overflow-x-auto"><div className="flex items-end gap-1 h-44" style={{ minWidth: Math.max(report.daily.length * 22, 300) }}>
                {report.daily.map((d: any) => (
                  <div key={d.date} className="flex-1 min-w-[16px] h-full flex flex-col items-center justify-end gap-1" title={`${d.date}: ${d.visits} visits`}>
                    {d.visits > 0 && <span className="text-[10px] text-muted">{d.visits}</span>}
                    <span className="w-full rounded-t bg-brand-500" style={{ height: `${(d.visits / max) * 100}%`, minHeight: d.visits ? 4 : 1 }} />
                    <span className="text-[9px] text-muted">{d.date.slice(5)}</span>
                  </div>
                ))}
              </div></div>
              {report.monthly.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{report.monthly.map((m: any) => <span key={m.month} className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm"><strong>{m.visits}</strong> visits in {new Date(`${m.month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>)}</div>}
            </CardContent></Card>
          )}
        </div>
      )}

      {tab === "visits" && (
        <div className="bg-surface border border-slate-200 rounded-2xl overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Visit date</TableHead><TableHead>Doctor</TableHead><TableHead>Patient</TableHead><TableHead>Mobile</TableHead><TableHead>Symptoms</TableHead><TableHead>Diagnosis</TableHead><TableHead>Treatment</TableHead><TableHead>Prescription</TableHead><TableHead>Nurse's notes</TableHead><TableHead>Entered by</TableHead></TableRow></TableHeader>
            <TableBody>
              {visits === null && <TableRow><TableCell colSpan={10} className="text-center text-muted py-8">Loading…</TableCell></TableRow>}
              {visits?.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted py-8">No visits in this period.</TableCell></TableRow>}
              {pagedVisits.rows.map((v: any) => (
                <TableRow key={v.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setOpen(v.patientId)}>
                  <TableCell className="text-sm whitespace-nowrap">{fmt(v.visitDate)}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{v.doctor}</TableCell>
                  <TableCell className="whitespace-nowrap"><span className="font-medium">{v.patient?.name || v.patientName}</span><span className="block text-xs text-muted">{v.patient?.code}{v.patient?.age != null ? ` · ${v.patient.age}y` : ""}{v.patient?.gender ? ` · ${v.patient.gender}` : ""}</span></TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{v.patient?.phone}</TableCell>
                  {["symptoms", "diagnosis", "treatment", "prescription", "nurseNotes"].map((k) => (
                    <TableCell key={k} className="text-sm align-top min-w-[160px] max-w-[260px] whitespace-pre-line">{v[k] || <span className="text-muted">-</span>}</TableCell>
                  ))}
                  <TableCell className="text-sm whitespace-nowrap">{v.enteredBy || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager page={pagedVisits.current} pages={pagedVisits.pages} from={pagedVisits.from} to={pagedVisits.to} total={(visits || []).length} label="visits" onPage={setPage} />
        </div>
      )}

      {tab === "patients" && (
        <div className="bg-surface border border-slate-200 rounded-2xl overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Age</TableHead><TableHead>Gender</TableHead><TableHead>Doctor</TableHead><TableHead>Mobile</TableHead><TableHead className="text-right">Visits</TableHead><TableHead>First visit</TableHead><TableHead>Last visit</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {patients === null && <TableRow><TableCell colSpan={9} className="text-center text-muted py-8">Loading…</TableCell></TableRow>}
              {patients?.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted py-8">No patients found{doctorName ? ` for ${doctorName}` : ""}. Visits entered on the doctor's dashboard (Patient Visits) appear here straight away.</TableCell></TableRow>}
              {pagedPatients.rows.map((p: any) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setOpen(p.id)}>
                  <TableCell><span className="font-medium">{p.name}</span><span className="block text-xs text-muted">{p.code}</span></TableCell>
                  <TableCell className="text-sm">{p.age ?? "-"}</TableCell>
                  <TableCell className="text-sm">{p.gender || "-"}</TableCell>
                  <TableCell className="text-sm">{p.doctor}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{p.phone}</TableCell>
                  <TableCell className="text-right font-semibold">{p.visitCount}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{fmt(p.firstVisitAt)}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{fmt(p.lastVisitAt)}</TableCell>
                  <TableCell className="text-right"><span className="text-sm font-medium text-brand-600">View history</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager page={pagedPatients.current} pages={pagedPatients.pages} from={pagedPatients.from} to={pagedPatients.to} total={(patients || []).length} label="patients" onPage={setPage} />
        </div>
      )}

      {tab === "links" && (
        <div className="bg-surface border border-slate-200 rounded-2xl overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Target Patient</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Generated by</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Submitted at</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {links === null && <TableRow><TableCell colSpan={9} className="text-center text-muted py-8">Loading…</TableCell></TableRow>}
              {links?.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted py-8">No registration links found{doctorName ? ` for ${doctorName}` : ""}.</TableCell></TableRow>}
              {pagedLinks.rows.map((l: any) => (
                <TableRow key={l.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs font-semibold">{l.code}</TableCell>
                  <TableCell className="text-sm font-medium">{l.doctor}</TableCell>
                  <TableCell>
                    <span className="font-medium text-charcoal">{l.patientName || l.patient?.name || "Walk-in Patient"}</span>
                    {l.patient?.code && <span className="block text-xs text-muted">{l.patient.code}</span>}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{l.patientPhone || l.patient?.phone || "-"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      l.status === 'Submitted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      l.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {l.status === 'Submitted' ? '✓ Submitted' : l.status === 'Pending' ? '⏳ Pending' : l.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{l.recordedBy || "-"}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{fmt(l.createdAt)}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{fmt(l.submittedAt)}</TableCell>
                  <TableCell className="text-right">
                    {l.patientId ? (
                      <Button variant="ghost" size="sm" className="h-8 text-brand-600" onClick={() => setOpen(l.patientId)}>View patient</Button>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager page={pagedLinks.current} pages={pagedLinks.pages} from={pagedLinks.from} to={pagedLinks.to} total={(links || []).length} label="links" onPage={setPage} />
        </div>
      )}

      <Modal isOpen={!!open} onClose={() => setOpen(null)} title="Patient record" size="lg">
        {open && <PatientRecord patientId={open} canEdit={false} />}
      </Modal>
    </div>
  )
}
