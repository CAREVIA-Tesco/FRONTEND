import { useMemo, useState } from "react"
import { Modal } from "./ui/Modal"
import { Button } from "./ui/Button"
import api from "../../services/api"
import { useApi } from "../lib/useApi"
import { inputCls, labelCls } from "../lib/forms"

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const toYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

// Admin books a visit for a patient who called in (registered patient or a new caller)
export function CreateAppointmentModal({ open, onClose, onCreated, appointments }: { open: boolean; onClose: () => void; onCreated: (a: any) => void; appointments: any[] }) {
  const pros = useApi(() => (open ? api.getProviders({ status: "ACTIVE" }) : Promise.resolve(null)), [open])
  const pats = useApi(() => (open ? api.getPatients() : Promise.resolve(null)), [open])
  const [who, setWho] = useState<"registered" | "new">("registered")
  const [patientQuery, setPatientQuery] = useState("")
  const [patientId, setPatientId] = useState("")
  const [guest, setGuest] = useState({ name: "", phone: "" })
  const [providerId, setProviderId] = useState("")
  const [type, setType] = useState("home")
  const [date, setDate] = useState(toYmd(new Date(Date.now() + 86400000)))
  const [time, setTime] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const providers = ((pros.data as any)?.providers || []).filter((p: any) => p.status === "ACTIVE")
  const patients = ((pats.data as any)?.patients || []) as any[]
  const matches = patients.filter((p) => !patientQuery || `${p.name} ${p.phone || ""} ${p.email || ""} ${p.code}`.toLowerCase().includes(patientQuery.toLowerCase())).slice(0, 50)
  const provider = providers.find((p: any) => p.id === providerId)
  const types = provider ? [["home", "Home visit", provider.fee], ["clinic", "Clinic visit", provider.clinicFee], ["online", "Online consultation", provider.onlineFee]].filter(([k, , fee]) => k === "home" || fee) : [["home", "Home visit"], ["clinic", "Clinic visit"], ["online", "Online consultation"]]

  const slots = useMemo(() => {
    if (!provider || !date) return []
    const d = new Date(`${date}T12:00:00`)
    const taken = appointments.filter((a) => a.providerId === provider.id && ["Waiting", "Confirmed"].includes(a.status) && toYmd(new Date(a.scheduledAt)) === date).map((a) => a.timeSlot)
    const isToday = date === toYmd(new Date())
    return (provider.schedule?.[DAY_KEYS[d.getDay()]] || []).map((t: string) => {
      const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(t)
      let past = false
      if (isToday && m) { const h = (Number(m[1]) % 12) + (/PM/i.test(m[3]) ? 12 : 0); past = h * 60 + Number(m[2]) <= new Date().getHours() * 60 + new Date().getMinutes() }
      return { t, busy: taken.includes(t) || past }
    })
  }, [provider, date, appointments])

  const reset = () => { setWho("registered"); setPatientQuery(""); setPatientId(""); setGuest({ name: "", phone: "" }); setProviderId(""); setType("home"); setTime(""); setReason(""); setError("") }
  const close = () => { reset(); onClose() }

  const save = async () => {
    if (who === "registered" && !patientId) { setError("Choose the patient"); return }
    if (who === "new" && !guest.name.trim()) { setError("Enter the patient name"); return }
    if (who === "new" && !/^[6-9]\d{9}$/.test(guest.phone)) { setError("Enter a valid 10-digit mobile number"); return }
    if (!providerId) { setError("Choose the professional"); return }
    if (!date || !time) { setError("Choose a date and an open time slot"); return }
    setSaving(true); setError("")
    try {
      const res: any = await api.bookAppointment({
        providerId, date: new Date(`${date}T12:00:00`).toISOString(), time, consultationType: type,
        patientId: who === "registered" ? patientId : undefined,
        patientInfo: who === "new" ? { name: guest.name.trim(), phone: guest.phone, reason } : { reason },
        paymentMethod: "upi",
      })
      reset()
      onCreated(res.appointment)
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <Modal isOpen={open} onClose={close} title="Create Appointment" size="lg">
      <div className="space-y-5">
        {error && <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <div>
          <span className={labelCls}>Patient</span>
          <div className="inline-flex rounded-lg bg-slate-100 p-1 mb-3">
            {([["registered", "Registered patient"], ["new", "New caller"]] as const).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={who === k} onClick={() => setWho(k)} className={`px-3 py-1.5 text-sm font-medium rounded-md ${who === k ? "bg-white text-charcoal shadow-sm" : "text-muted"}`}>{l}</button>
            ))}
          </div>
          {who === "registered" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input aria-label="Search patient" className={inputCls} placeholder="Search name or phone" value={patientQuery} onChange={(e) => setPatientQuery(e.target.value)} />
              <select aria-label="Patient" className={inputCls} value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                <option value="">{patients.length ? `Select patient (${matches.length})` : "No registered patients"}</option>
                {matches.map((p) => <option key={p.id} value={p.id}>{p.name}{p.phone ? ` · ${p.phone}` : ""}</option>)}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input aria-label="Patient name" className={inputCls} placeholder="Patient name" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
              <input aria-label="Patient mobile" inputMode="numeric" maxLength={10} className={inputCls} placeholder="10-digit mobile" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="ca-provider" className={labelCls}>Professional</label>
            <select id="ca-provider" className={inputCls} value={providerId} onChange={(e) => { setProviderId(e.target.value); setTime(""); setType("home") }}>
              <option value="">{pros.loading ? "Loading…" : "Select professional"}</option>
              {providers.map((p: any) => <option key={p.id} value={p.id}>{p.name} · {p.spec}{p.loc ? ` · ${p.loc}` : ""}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ca-type" className={labelCls}>Visit type</label>
            <select id="ca-type" className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
              {types.map(([k, l, fee]: any) => <option key={k} value={k}>{l}{fee ? ` · ₹${fee}` : ""}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ca-date" className={labelCls}>Date</label>
            <input id="ca-date" type="date" min={toYmd(new Date())} className={inputCls} value={date} onChange={(e) => { setDate(e.target.value); setTime("") }} />
          </div>
          <div className="sm:col-span-2">
            <span className={labelCls}>Time</span>
            {!provider ? <p className="text-sm text-muted">Choose a professional to see open slots.</p>
              : slots.length === 0 ? <p className="text-sm text-muted">Not available on this day – pick another date.</p>
              : (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Time slots">
                  {slots.map(({ t, busy }: any) => (
                    <button key={t} type="button" disabled={busy} aria-pressed={time === t} onClick={() => setTime(t)} className={`h-9 px-3 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 disabled:line-through ${time === t ? "bg-brand-600 text-white border-brand-600" : "bg-white text-charcoal border-slate-200 hover:border-brand-300"}`}>{t}</button>
                  ))}
                </div>
              )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ca-reason" className={labelCls}>Reason / notes <span className="font-normal text-muted">(optional)</span></label>
            <input id="ca-reason" className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-muted">Online consultations are recorded as paid; home and clinic visits are paid in cash at the visit. The professional sees it in their dashboard to confirm.</p>
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Booking..." : "Create Appointment"}</Button>
        </div>
      </div>
    </Modal>
  )
}
