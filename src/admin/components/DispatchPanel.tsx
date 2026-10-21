import { useEffect, useState } from "react"
import { Send, Radio, CalendarCheck2 } from "lucide-react"
import { Button } from "./ui/Button"
import api from "../../services/api"

// 30-minute visit slots in the appointment format ("09:00 AM")
const SLOTS = Array.from({ length: 30 }, (_, i) => {
  const mins = 7 * 60 + i * 30
  const h = Math.floor(mins / 60), m = mins % 60
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`
})
const toSlot = (t?: string) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(t || "").trim())
  return m ? `${String(parseInt(m[1], 10)).padStart(2, "0")}:${m[2]} ${m[3].toUpperCase()}` : ""
}
const isoDay = (d?: string) => (d ? new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) : "")

// Admin: route a website request to a professional (or share it with all matching professionals)
export function DispatchPanel({ enquiry, allProviders, onDone }: { enquiry: any; allProviders: any[]; onDone: () => void }) {
  const [matches, setMatches] = useState<any[] | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [form, setForm] = useState({ providerId: "", date: "", time: "", consultationType: "home" })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    setMsg(null); setShowAll(false)
    setForm({ providerId: "", date: isoDay(enquiry.preferredDate), time: toSlot(enquiry.preferredTime) || "10:00 AM", consultationType: "home" })
    api.requestMatches(enquiry.id).then((d: any) => setMatches(d.providers || [])).catch(() => setMatches([]))
  }, [enquiry.id, enquiry.preferredDate, enquiry.preferredTime])

  const run = async (fn: () => Promise<any>) => {
    setBusy(true); setMsg(null)
    try { const r = await fn(); setMsg({ ok: true, text: r.message || (r.matches !== undefined ? `Shared with ${r.matches} matching professional${r.matches === 1 ? "" : "s"}` : "Done") }); onDone() } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy(false) }
  }

  const closed = ["Converted", "Closed"].includes(enquiry.status)
  if (enquiry.appointmentCode) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm">
        <p className="font-semibold text-green-800 flex items-center gap-2"><CalendarCheck2 className="h-4 w-4" /> Appointment {enquiry.appointmentCode}</p>
        <p className="text-green-700 mt-1">With {enquiry.provider}. Confirmation, cancellation and completion by the professional update this request automatically. To change it, cancel the appointment in Appointments and the request comes back here.</p>
      </div>
    )
  }
  if (closed) return null

  const options = showAll ? allProviders.map((p: any) => ({ id: p.id, name: p.name, spec: p.spec, city: p.loc })) : (matches || [])
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-charcoal">Send to a professional</h3>
        <label className="text-xs text-muted flex items-center gap-1.5"><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> show all</label>
      </div>
      <p className="text-xs text-muted">{matches === null ? "Finding matching professionals…" : `${matches.length} professional${matches.length === 1 ? "" : "s"} match ${enquiry.service || "this request"}${enquiry.city ? ` in ${enquiry.city}` : ""}.`}</p>
      <select aria-label="Professional" value={form.providerId} onChange={(e) => setForm({ ...form, providerId: e.target.value })} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
        <option value="">Choose a professional</option>
        {options.map((p: any) => <option key={p.id} value={p.id}>{p.name} · {p.spec} · {p.city}{p.declined ? " (declined before)" : ""}</option>)}
      </select>
      <div className="grid grid-cols-3 gap-2">
        <input aria-label="Visit date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-10 rounded-lg border border-slate-200 px-2 text-sm" />
        <select aria-label="Visit time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="h-10 rounded-lg border border-slate-200 px-2 text-sm">
          {!SLOTS.includes(form.time) && form.time && <option value={form.time}>{form.time}</option>}
          {SLOTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select aria-label="Visit type" value={form.consultationType} onChange={(e) => setForm({ ...form, consultationType: e.target.value })} className="h-10 rounded-lg border border-slate-200 px-2 text-sm">
          <option value="home">Home visit</option><option value="clinic">Clinic</option><option value="online">Online</option>
        </select>
      </div>
      <Button className="w-full" disabled={busy || !form.providerId || !form.date} onClick={() => run(() => api.assignRequest(enquiry.id, form))}>
        <Send className="mr-2 h-4 w-4" /> Send to professional
      </Button>
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <p className="text-xs text-muted flex items-center gap-1.5"><Radio className={`h-3.5 w-3.5 ${enquiry.broadcast ? "text-success" : ""}`} /> {enquiry.broadcast ? "Visible to all matching professionals – first to accept gets it" : "Not shared with professionals"}{enquiry.declinedCount ? ` · ${enquiry.declinedCount} passed` : ""}</p>
        <Button variant="outline" size="sm" disabled={busy} onClick={() => run(() => api.broadcastRequest(enquiry.id, !enquiry.broadcast))}>{enquiry.broadcast ? "Withdraw" : "Share with all"}</Button>
      </div>
      {msg && <p className={`text-sm rounded-lg px-3 py-2 ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
    </div>
  )
}
