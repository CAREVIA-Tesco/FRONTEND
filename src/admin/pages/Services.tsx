import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Modal } from "../components/ui/Modal"
import { Notice } from "../components/ui/Notice"
import { Plus, ExternalLink, ArrowUp, ArrowDown, ImagePlus, Trash2, Stethoscope } from "lucide-react"
import api from "../../services/api"
import { useApi } from "../lib/useApi"
import { inputCls, areaCls, labelCls, resizeImage } from "../lib/forms"
import { SERVICE_ICONS, loadServices } from "../../data/services"

// The provider types a service can list on its website page (plus any specialities already in use)
const BASE_MATCHES = ["General Physician", "Pediatrician", "Cardiologist", "Dermatologist", "Orthopedic", "Gynecologist", "Neurologist", "Psychiatrist", "ENT Specialist", "Homeopathy Doctor", "Ayurveda Doctor", "Physiotherapist", "Nurse", "Care Taker", "BHS", "Lab Centre"]
const BUILT_IN = ["physiotherapy", "nurse-care", "home-doctor", "doctor-visit", "care-taker", "baby-care", "ayurveda", "bhs"]
const PAGE_FOR: Record<string, string> = { physiotherapy: "/physiotherapy", "nurse-care": "/nurse-care", "home-doctor": "/home-doctor", "doctor-visit": "/doctor-visit", "care-taker": "/care-taker", "baby-care": "/baby-care", ayurveda: "/ayurveda", bhs: "/bhs" }
const pageFor = (key: string) => PAGE_FOR[key] || `/services/${key}`
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const empty = { name: "", key: "", short: "", desc: "", price: "", icon: "Stethoscope", image: "", matches: [] as string[], status: "Active" }

export function Services() {
  const { data, error, reload } = useApi(() => api.getServices())
  const pros = useApi(() => api.getProviders({ status: "ALL" }))
  const services = ((data as any)?.services || []) as any[]
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const [keyTouched, setKeyTouched] = useState(false)
  const [formError, setFormError] = useState("")
  const [actionError, setActionError] = useState("")
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<any>(null)

  const matchOptions = [...new Set([...BASE_MATCHES, ...(((pros.data as any)?.providers || []).map((p: any) => p.spec)), ...form.matches].filter(Boolean))] as string[]
  const providersFor = (sv: any) => ((pros.data as any)?.providers || []).filter((p: any) => p.status === "ACTIVE" && (sv.key === "doctor-visit" ? p.isDoctor : (sv.matches || []).includes(p.spec))).length

  const refresh = async (msg: string) => { setNotice(msg); await reload(); loadServices(true) }
  const openAdd = () => { setEditing(null); setForm(empty); setKeyTouched(false); setFormError(""); setOpen(true) }
  const openEdit = (sv: any) => {
    setEditing(sv)
    setForm({ name: sv.name || "", key: sv.key || "", short: sv.short || "", desc: sv.desc || "", price: sv.price || "", icon: sv.icon || "Stethoscope", image: sv.image || "", matches: sv.matches || [], status: sv.status || "Active" })
    setKeyTouched(true); setFormError(""); setOpen(true)
  }
  const setName = (name: string) => setForm((f) => ({ ...f, name, key: keyTouched ? f.key : slugify(name) }))
  const toggleMatch = (m: string) => setForm((f) => ({ ...f, matches: f.matches.includes(m) ? f.matches.filter((x) => x !== m) : [...f.matches, m] }))
  const pickImage = async (file?: File) => {
    if (!file) return
    try { setForm((f) => ({ ...f, image: "" })); const image = await resizeImage(file, 900, false); setForm((f) => ({ ...f, image })) } catch (err: any) { setFormError(err.message) }
  }

  const save = async () => {
    if (!form.name.trim()) { setFormError("Service name is required"); return }
    if (!form.desc.trim()) { setFormError("Add a short description – it is shown on the website"); return }
    if (!form.key.trim()) { setFormError("Web address is required"); return }
    setSaving(true); setFormError("")
    try {
      if (editing) await api.updateService(editing.id, form)
      else await api.createService(form)
      setOpen(false)
      await refresh(`${form.name} ${editing ? "updated" : "added"}${form.status === "Active" ? " – it is now on the website" : " (hidden from the website)"}`)
    } catch (err: any) { setFormError(err.message) } finally { setSaving(false) }
  }
  const toggleStatus = async (sv: any) => {
    setActionError("")
    try { await api.updateService(sv.id, { status: sv.status === "Active" ? "Inactive" : "Active" }); await refresh(`${sv.name} ${sv.status === "Active" ? "hidden from" : "shown on"} the website`) } catch (err: any) { setActionError(err.message) }
  }
  const move = async (idx: number, dir: -1 | 1) => {
    const other = services[idx + dir]
    if (!other) return
    setActionError("")
    try {
      const a = services[idx]
      await Promise.all(services.map((sv, i) => api.updateService(sv.id, { order: i === idx ? idx + dir + 1 : i === idx + dir ? idx + 1 : i + 1 })))
      await refresh(`${a.name} moved ${dir < 0 ? "up" : "down"}`)
    } catch (err: any) { setActionError(err.message) }
  }
  const remove = async () => {
    const sv = confirmDelete
    setConfirmDelete(null); setActionError("")
    try { await api.deleteService(sv.id); await refresh(`${sv.name} deleted`) } catch (err: any) { setActionError(err.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Services</h1>
          <p className="text-muted mt-1">The services shown on the website – Home page, Our Services, Book Now and the footer menu.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/services" target="_blank" rel="noreferrer"><Button variant="outline"><ExternalLink className="mr-2 h-4 w-4" /> View on website</Button></a>
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
        </div>
      </div>

      <Notice text={notice} onClose={() => setNotice("")} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Services", value: String(services.length) },
          { label: "On the website", value: String(services.filter((sv) => sv.status === "Active").length) },
          { label: "Hidden", value: String(services.filter((sv) => sv.status !== "Active").length) },
          { label: "Total Bookings", value: services.reduce((t, sv) => t + (sv.bookings || 0), 0).toLocaleString("en-IN") }
        ].map(stat => (
          <div key={stat.label} className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {(error || actionError) && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error || actionError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((sv, idx) => {
          const Icon = (SERVICE_ICONS as any)[sv.icon] || Stethoscope
          return (
            <div key={sv.id} data-testid="service-card" className={`bg-surface border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden ${sv.status !== "Active" ? "opacity-70" : ""}`}>
              <div className="relative h-32 bg-slate-100">
                {sv.image && <img src={sv.image} alt="" className="w-full h-full object-cover" />}
                <span className="absolute top-3 left-3 h-10 w-10 rounded-xl bg-white/95 flex items-center justify-center text-brand-600 shadow-sm"><Icon className="h-5 w-5" /></span>
                <span className="absolute top-3 right-3"><Badge variant={sv.status === "Active" ? "success" : "default"}>{sv.status === "Active" ? "On website" : "Hidden"}</Badge></span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-charcoal">{sv.name}</h3>
                  <div className="flex shrink-0">
                    <button type="button" aria-label={`Move ${sv.name} up`} disabled={idx === 0} onClick={() => move(idx, -1)} className="p-1.5 rounded-lg text-muted hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" aria-label={`Move ${sv.name} down`} disabled={idx === services.length - 1} onClick={() => move(idx, 1)} className="p-1.5 rounded-lg text-muted hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                  </div>
                </div>
                {sv.short && <p className="text-xs font-semibold text-brand-600 mt-0.5">{sv.short}</p>}
                <p className="text-muted text-sm mt-2 flex-1">{sv.desc}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-xs text-muted">Price</div><div className="font-semibold text-charcoal text-sm">{sv.price || "Live fees"}</div></div>
                  <div><div className="text-xs text-muted">Professionals</div><div className="font-semibold text-charcoal text-sm">{providersFor(sv)}</div></div>
                  <div><div className="text-xs text-muted">Bookings</div><div className="font-semibold text-charcoal text-sm">{sv.bookings || 0}</div></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(sv)}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => toggleStatus(sv)} className={sv.status === "Active" ? "text-error" : "text-success"}>{sv.status === "Active" ? "Hide" : "Show"}</Button>
                  <a href={pageFor(sv.key)} target="_blank" rel="noreferrer" className={sv.status !== "Active" ? "pointer-events-none" : ""}><Button variant="outline" size="sm" className="w-full text-brand-600" disabled={sv.status !== "Active"}>View</Button></a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? `Edit ${editing.name}` : "Add Service"} size="lg">
        <div className="space-y-4">
          {formError && <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sv-name" className={labelCls}>Service name *</label>
              <input id="sv-name" className={inputCls} placeholder="e.g. Elder Care Packages" value={form.name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="sv-key" className={labelCls}>Web address *</label>
              <div className="flex items-center">
                <span className="h-10 px-2 flex items-center text-xs text-muted bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg">/services/</span>
                <input id="sv-key" className={`${inputCls} rounded-l-none`} disabled={!!editing && BUILT_IN.includes(editing.key)} value={form.key} onChange={(e) => { setKeyTouched(true); setForm({ ...form, key: slugify(e.target.value) }) }} />
              </div>
            </div>
            <div>
              <label htmlFor="sv-short" className={labelCls}>Tagline</label>
              <input id="sv-short" className={inputCls} maxLength={40} placeholder="e.g. Daily support for seniors" value={form.short} onChange={(e) => setForm({ ...form, short: e.target.value })} />
            </div>
            <div>
              <label htmlFor="sv-price" className={labelCls}>Starting price</label>
              <input id="sv-price" className={inputCls} placeholder="e.g. ₹999 (leave empty to use live fees)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="sv-desc" className={labelCls}>Description *</label>
              <textarea id="sv-desc" maxLength={300} className={areaCls} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            </div>
            <div>
              <label htmlFor="sv-icon" className={labelCls}>Icon</label>
              <select id="sv-icon" className={inputCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                {Object.keys(SERVICE_ICONS).map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sv-status" className={labelCls}>Show on website</label>
              <select id="sv-status" className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Active">Yes – visible</option>
                <option value="Inactive">No – hidden</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <span className={labelCls}>Picture</span>
              <div className="flex items-center gap-4">
                <div className="h-20 w-32 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center text-muted shrink-0">
                  {form.image ? <img src={form.image} alt="Service" className="w-full h-full object-cover" data-testid="service-image-preview" /> : <ImagePlus className="h-6 w-6" />}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer inline-flex items-center h-9 px-3 rounded-md border border-slate-200 text-sm font-medium hover:bg-slate-100">
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" data-testid="service-image-input" onChange={(e) => pickImage(e.target.files?.[0])} /> Upload picture
                  </label>
                  {form.image && <Button variant="ghost" size="sm" className="text-error" onClick={() => setForm({ ...form, image: "" })}><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <span className={labelCls}>Professionals listed on this service page</span>
              <div className="flex flex-wrap gap-1.5">
                {matchOptions.map((m) => (
                  <button key={m} type="button" aria-pressed={form.matches.includes(m)} onClick={() => toggleMatch(m)} className={`h-8 px-3 rounded-full text-xs font-medium border transition-colors ${form.matches.includes(m) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-muted border-slate-200 hover:border-brand-300"}`}>{m}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-3 pt-3 border-t border-slate-100">
            {editing && !BUILT_IN.includes(editing.key) ? <Button variant="ghost" className="text-error" onClick={() => { setOpen(false); setConfirmDelete(editing) }}><Trash2 className="h-4 w-4 mr-1.5" /> Delete</Button> : <span />}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Service"}</Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete service?">
        <p className="text-sm text-muted">{confirmDelete?.name} will be removed from the website. Past bookings are kept. To keep it but stop showing it, use Hide instead.</p>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove}>Delete Service</Button>
        </div>
      </Modal>
    </div>
  )
}
