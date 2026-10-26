import { useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { Search, Inbox, PhoneCall, CalendarCheck, CheckCircle2, X, Phone, Mail, MessageCircle, Download } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import api from "../../services/api"
import { useApi, downloadCsv } from "../lib/useApi"
import { DispatchPanel } from "../components/DispatchPanel"

const STATUSES = ["New", "Contacted", "Scheduled", "Converted", "Closed"]
const TYPES: Record<string, string> = { booking: "Book Now", callback: "Callback", plan: "Care plan", requirement: "Requirement", contact: "Contact", partner: "Partner", referral: "Referral" }
const BADGE: Record<string, "warning" | "info" | "default" | "success"> = { New: "warning", Contacted: "info", Scheduled: "info", Converted: "success", Closed: "default" }
const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })

export function Enquiries() {
  const [status, setStatus] = useState("")
  const [type, setType] = useState("")
  const [urlParams] = useSearchParams()
  const [search, setSearch] = useState(urlParams.get("q") || "")
  useEffect(() => { const q = urlParams.get("q"); if (q !== null) setSearch(q) }, [urlParams])
  const { data, error: loadError, reload } = useApi(() => api.getEnquiries({ status, type }), [status, type])
  const providers = useApi(() => api.getProviders())
  const [openId, setOpenId] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ status: "", publicNote: "", note: "", appointmentCode: "", followUpAt: "" })

  const all: any[] = (data as any)?.enquiries || []
  const counts = (data as any)?.counts || {}
  const list = all.filter((e) => !search || `${e.code} ${e.name} ${e.phone} ${e.email || ""} ${e.city || ""} ${e.requestedProvider || ""} ${e.pincode || ""} ${e.locality || ""} ${e.district || ""} ${e.service || ""} ${e.organisation || ""}`.toLowerCase().includes(search.toLowerCase()))
  const selected = all.find((e) => e.id === openId)
  const doctorList = ((providers.data as any)?.providers || [])

  useEffect(() => {
    if (selected) setForm((f) => ({ ...f, status: selected.status, appointmentCode: selected.appointmentCode || "", followUpAt: selected.followUpAt ? String(selected.followUpAt).slice(0, 10) : "" }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, selected?.status, selected?.appointmentCode, selected?.followUpAt])
  useEffect(() => { setActionError(""); setForm((f) => ({ ...f, publicNote: "", note: "" })) }, [openId])

  const save = async (body: any) => {
    setSaving(true)
    setActionError("")
    try {
      await api.updateEnquiry(openId, body)
      await reload()
      setForm((f) => ({ ...f, publicNote: "", note: "" }))
    } catch (err: any) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const submit = () => {
    const body: any = {}
    if (form.status !== selected.status) body.status = form.status
    if (form.publicNote.trim()) body.publicNote = form.publicNote.trim()
    if (form.note.trim()) body.note = form.note.trim()
    if ((form.appointmentCode || "") !== (selected.appointmentCode || "")) body.appointmentCode = form.appointmentCode
    const currentFollow = selected.followUpAt ? String(selected.followUpAt).slice(0, 10) : ""
    if (form.followUpAt !== currentFollow) body.followUpAt = form.followUpAt || null
    if (Object.keys(body).length === 0) { setActionError("Nothing to update"); return }
    save(body)
  }

  const exportCsv = () => downloadCsv("carevaa-enquiries.csv", [
    ["Request ID", "Type", "Status", "Name", "Phone", "Email", "City", "PIN code", "Area", "District", "State", "Visit type", "Service", "Plan", "Preferred date", "Best time", "Message", "Professional", "Appointment", "Created", "Home visit address"],
    ...list.map((e) => [e.code, TYPES[e.type], e.status, e.name, e.phone, e.email, e.city, e.pincode, e.locality, e.district, e.state, e.visitTypeLabel, e.service || e.subject, e.plan, e.preferredDateLabel, e.preferredTime, e.message, e.provider, e.appointmentCode, e.createdLabel, e.address]),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Enquiries & Callbacks</h1>
          <p className="text-muted mt-1">Requests from the website – call back, schedule care and convert them into bookings.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "New – call back", value: counts.New || 0, icon: Inbox, color: "text-warning", bg: "bg-amber-50" },
          { label: "In progress", value: (counts.Contacted || 0) + (counts.Scheduled || 0), icon: PhoneCall, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Converted to bookings", value: counts.Converted || 0, icon: CalendarCheck, color: "text-success", bg: "bg-green-50" },
          { label: "Received today", value: counts.today || 0, icon: CheckCircle2, color: "text-info", bg: "bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">{s.label}</p>
              <p className="text-2xl font-bold text-charcoal mt-1">{s.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-full ${s.bg} flex items-center justify-center ${s.color}`}><s.icon className="h-6 w-6" /></div>
          </div>
        ))}
      </div>

      <div className="bg-surface p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {["", ...STATUSES].map((s) => (
            <button key={s || "all"} type="button" onClick={() => setStatus(s)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${status === s ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {s || "All"}{s ? ` (${counts[s] || 0})` : ` (${counts.total || 0})`}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, name, phone, city or service..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <select aria-label="Request type" value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">All types</option>
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {loadError && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{loadError}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Service / Subject</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Preferred</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted py-8">No enquiries found.</TableCell></TableRow>}
          {list.map((e) => (
            <TableRow key={e.id} className={e.id === openId ? "bg-brand-50/50" : ""}>
              <TableCell><span className="text-brand-600 font-medium">{e.code}</span><span className="block text-xs text-muted">{TYPES[e.type]}</span></TableCell>
              <TableCell className="font-medium">{e.name}<span className="block text-xs text-muted">{e.phone}</span></TableCell>
              <TableCell>{e.service || e.subject || (e.requestedProvider ? "Doctor appointment" : "-")}{e.requestedProvider && <span className="block text-xs font-medium text-brand-600">Requested: {e.requestedProvider}</span>}{e.plan && <span className="block text-xs text-muted">{e.plan}</span>}{e.organisation && <span className="block text-xs text-muted">{e.organisation}</span>}</TableCell>
              <TableCell>{e.city || "-"}{(e.locality || e.pincode) && <span className="block text-xs text-muted">{[e.locality, e.pincode].filter(Boolean).join(" · ")}</span>}</TableCell>
              <TableCell>{e.preferredDateLabel || "-"}<span className="block text-xs text-muted">{e.preferredTime}</span></TableCell>
              <TableCell>{fmt(e.createdAt)}</TableCell>
              <TableCell><Badge variant={BADGE[e.status]}>{e.status}</Badge></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <a href={`tel:${e.phone}`}><Button variant="ghost" size="sm" className="h-8">Call</Button></a>
                  <Button variant="ghost" size="sm" className="h-8 text-brand-600" onClick={() => setOpenId(e.id)}>Manage</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-label={`Enquiry ${selected.code}`}>
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpenId(null)} />
          <aside className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <p className="text-xs text-muted">{TYPES[selected.type]} · {fmt(selected.createdAt)}</p>
                <h2 className="text-xl font-bold text-charcoal">{selected.code}</h2>
              </div>
              <button type="button" aria-label="Close" onClick={() => setOpenId(null)} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${selected.phone}`}><Button size="sm"><Phone className="mr-1.5 h-4 w-4" /> Call {selected.phone}</Button></a>
                <a href={`https://wa.me/91${String(selected.phone).replace(/\D/g, "").slice(-10)}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp</Button></a>
                {selected.email && <a href={`mailto:${selected.email}`}><Button size="sm" variant="outline"><Mail className="mr-1.5 h-4 w-4" /> Email</Button></a>}
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm bg-slate-50 rounded-xl p-4">
                {[
                  ["Name", selected.name], ["Phone", selected.phone], ["Email", selected.email], ["Home visit address", selected.address], ["PIN code", selected.pincode], ["Area / post office", selected.locality], ["City", selected.city], ["District", selected.district], ["State", selected.state], ["Requested doctor", selected.requestedProvider ? `${selected.requestedProvider}${selected.requestedProviderSpec ? ` (${selected.requestedProviderSpec})` : ""}` : ""], ["Visit type", selected.visitTypeLabel],
                  ["Service", selected.service], ["Care plan", selected.plan], ["Subject", selected.subject], ["Organisation", selected.organisation],
                  ["Preferred date", selected.preferredDateLabel], ["Best time", selected.preferredTime], ["Referred by", selected.referrerName ? `${selected.referrerName} (${selected.referrerPhone})` : ""], ["From page", selected.source],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k as string}><dt className="text-muted text-xs">{k}</dt><dd className="font-medium text-charcoal break-words">{v}</dd></div>
                ))}
                {selected.message && <div className="col-span-2"><dt className="text-muted text-xs">Message</dt><dd className="text-charcoal whitespace-pre-line">{selected.message}</dd></div>}
              </dl>

              <div className="space-y-3">
                <h3 className="font-semibold text-charcoal">Update request</h3>
                <label className="block text-sm">
                  <span className="text-muted text-xs">Status</span>
                  <select aria-label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-muted text-xs">Message to customer (shown on their tracking page)</span>
                  <input value={form.publicNote} onChange={(e) => setForm({ ...form, publicNote: e.target.value })} placeholder="e.g. Physio visit fixed for Monday 10 AM" className="mt-1 w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </label>
                <label className="block text-sm">
                  <span className="text-muted text-xs">Internal note (team only)</span>
                  <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} placeholder="Call summary, patient condition, budget…" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm">
                    <span className="text-muted text-xs">Linked appointment ID</span>
                    <input value={form.appointmentCode} onChange={(e) => setForm({ ...form, appointmentCode: e.target.value.toUpperCase() })} placeholder="APT-…" className="mt-1 w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-muted text-xs">Follow-up date</span>
                    <input type="date" value={form.followUpAt} onChange={(e) => setForm({ ...form, followUpAt: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </label>
                </div>
                {actionError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{actionError}</p>}
                <Button className="w-full" onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save update"}</Button>
              </div>

              <DispatchPanel enquiry={selected} allProviders={doctorList} onDone={reload} />

              <div>
                <h3 className="font-semibold text-charcoal mb-3">Customer timeline</h3>
                <ul className="space-y-3 border-l-2 border-slate-100 pl-4">
                  {[...selected.timeline].reverse().map((t: any, i: number) => (
                    <li key={i} className="text-sm"><Badge variant={BADGE[t.status] || "default"}>{t.status}</Badge> <span className="text-charcoal">{t.note}</span><span className="block text-xs text-muted">{fmt(t.at)}</span></li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-charcoal mb-3">Internal notes</h3>
                {selected.notes.length === 0 ? <p className="text-sm text-muted">No notes yet.</p> : (
                  <ul className="space-y-2">
                    {[...selected.notes].reverse().map((n: any, i: number) => (
                      <li key={i} className="text-sm bg-amber-50/60 rounded-lg p-3"><p className="text-charcoal">{n.text}</p><p className="text-xs text-muted mt-1">{n.by} · {fmt(n.at)}</p></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
