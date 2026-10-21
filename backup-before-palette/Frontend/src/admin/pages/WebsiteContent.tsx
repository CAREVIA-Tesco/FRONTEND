import { useEffect, useState } from "react"
import { Plus, Trash2, ArrowUp, ArrowDown, Save, ExternalLink } from "lucide-react"
import { Button } from "../components/ui/Button"
import api from "../../services/api"

type Field = { name: string; label: string; type?: "text" | "textarea" | "number" | "paragraphs"; placeholder?: string }
type Section = { key: string; title: string; desc: string; single?: boolean; preview?: string; itemLabel?: (i: any) => string; fields: Field[]; blank?: any }

// Everything the public website reads from GET /api/content/:key, editable without touching code
const SECTIONS: Section[] = [
  { key: "contact", title: "Contact details", desc: "Phone, email and address shown in the header, footer, Contact Us page and call buttons.", single: true, preview: "/contact", fields: [
    { name: "phone", label: "Phone number" }, { name: "email", label: "Email" }, { name: "whatsapp", label: "WhatsApp number (optional)", placeholder: "e.g. 919876543210" },
    { name: "hours", label: "Working hours" }, { name: "address", label: "Office address" }, { name: "careersEmail", label: "Careers email" }, { name: "careersPhone", label: "Careers phone" },
  ] },
  { key: "faqs", title: "FAQs", desc: "Questions shown on the homepage.", preview: "/#faq", itemLabel: (i) => i.q, blank: { q: "", a: "" }, fields: [
    { name: "q", label: "Question" }, { name: "a", label: "Answer", type: "textarea" },
  ] },
  { key: "testimonials", title: "Testimonials", desc: "Customer stories in the homepage slider.", preview: "/#testimonials", itemLabel: (i) => i.name, blank: { name: "", role: "Patient", quote: "", img: "" }, fields: [
    { name: "name", label: "Name" }, { name: "role", label: "Role / city" }, { name: "quote", label: "Quote", type: "textarea" }, { name: "img", label: "Photo URL (optional)" },
  ] },
  { key: "blog", title: "Blog articles", desc: "Articles on the Blog page – each gets its own page.", preview: "/blog", itemLabel: (i) => i.title, blank: { title: "", date: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"), category: "Health", img: "", desc: "", body: [] }, fields: [
    { name: "title", label: "Title" }, { name: "slug", label: "URL slug (optional)", placeholder: "auto from title" }, { name: "date", label: "Date" }, { name: "category", label: "Category" },
    { name: "img", label: "Image URL" }, { name: "desc", label: "Summary", type: "textarea" }, { name: "body", label: "Article text (blank line between paragraphs)", type: "paragraphs" },
  ] },
  { key: "cities", title: "Cities served", desc: "Cities listed on the homepage, footer and Contact page.", preview: "/#cities", itemLabel: (i) => i.name, blank: { name: "", desc: "", icon: "MapPin", accent: "blue" }, fields: [
    { name: "name", label: "City" }, { name: "desc", label: "State" },
  ] },
  { key: "jobs", title: "Job openings", desc: "Openings shown on the Careers page.", preview: "/jobs", itemLabel: (i) => i.title, blank: { title: "", category: "", loc: "", time: "Full-Time", desc: "", icon: "Stethoscope", accent: "indigo" }, fields: [
    { name: "title", label: "Job title" }, { name: "category", label: "Category" }, { name: "loc", label: "Location" }, { name: "time", label: "Type", placeholder: "Full-Time / Part-Time" }, { name: "desc", label: "Description", type: "textarea" },
  ] },
  { key: "pricing", title: "Package pricing rules", desc: "Used to calculate pack and monthly plan prices from each professional's fee.", single: true, preview: "/physiotherapy", fields: [
    { name: "packSessions", label: "Sessions in a pack", type: "number" }, { name: "packDiscountPct", label: "Pack discount %", type: "number" },
    { name: "monthlyMultiplier", label: "Monthly plan = single fee ×", type: "number" }, { name: "emiMinimum", label: "EMI available above ₹", type: "number" }, { name: "monthly24hrDays", label: "24-hour care days / month", type: "number" },
  ] },
]

const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"

export function WebsiteContent() {
  const [active, setActive] = useState(SECTIONS[0].key)
  const section = SECTIONS.find((s) => s.key === active)!
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  useEffect(() => {
    setLoading(true); setMsg(null); setDirty(false); setOpenIdx(0)
    api.getContent(active)
      .then((d: any) => setItems(section.single ? [d.items?.[0] || {}] : d.items || []))
      .catch((e: any) => setMsg({ ok: false, text: e.message }))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const update = (idx: number, name: string, value: any) => { setItems((list) => list.map((it, i) => (i === idx ? { ...it, [name]: value } : it))); setDirty(true) }
  const move = (idx: number, dir: number) => {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const copy = [...items];[copy[idx], copy[j]] = [copy[j], copy[idx]]
    setItems(copy); setDirty(true); setOpenIdx(j)
  }

  const save = async () => {
    setMsg(null)
    const first = section.fields[0].name
    if (!section.single && items.some((it) => !String(it[first] ?? "").trim())) { setMsg({ ok: false, text: `Every item needs a ${section.fields[0].label.toLowerCase()}.` }); return }
    const clean = items.map((it) => {
      const out: any = { ...it }
      section.fields.forEach((f) => { if (f.type === "number" && out[f.name] !== undefined && out[f.name] !== "") out[f.name] = Number(out[f.name]) })
      return out
    })
    setSaving(true)
    try {
      await api.saveContent(active, clean)
      setDirty(false)
      setMsg({ ok: true, text: "Saved. The website now shows these changes." })
    } catch (e: any) {
      setMsg({ ok: false, text: e.message })
    } finally {
      setSaving(false)
    }
  }

  const renderField = (f: Field, it: any, idx: number) => {
    const id = `${active}-${idx}-${f.name}`
    const value = f.type === "paragraphs" ? (Array.isArray(it[f.name]) ? it[f.name].join("\n\n") : it[f.name] || "") : it[f.name] ?? ""
    const onChange = (v: string) => update(idx, f.name, f.type === "paragraphs" ? v.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : v)
    return (
      <label key={f.name} htmlFor={id} className={`block ${f.type === "textarea" || f.type === "paragraphs" ? "md:col-span-2" : ""}`}>
        <span className="block text-xs font-medium text-muted mb-1">{f.label}</span>
        {f.type === "textarea" || f.type === "paragraphs"
          ? <textarea id={id} rows={f.type === "paragraphs" ? 8 : 3} className={inputCls} value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
          : <input id={id} type={f.type === "number" ? "number" : "text"} className={inputCls} value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />}
      </label>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Website Content</h1>
        <p className="text-muted mt-1">Edit what visitors see on the public website. Changes go live as soon as you save.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button key={s.key} type="button" onClick={() => { if (!dirty || window.confirm("Discard unsaved changes?")) setActive(s.key) }} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${active === s.key ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{s.title}</button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-charcoal">{section.title}</h2>
            <p className="text-sm text-muted">{section.desc}</p>
          </div>
          <div className="flex gap-2">
            {section.preview && <a href={section.preview} target="_blank" rel="noreferrer"><Button variant="outline" size="sm"><ExternalLink className="mr-1.5 h-4 w-4" /> View on site</Button></a>}
            {!section.single && <Button variant="outline" size="sm" onClick={() => { setItems([...items, { ...section.blank }]); setOpenIdx(items.length); setDirty(true) }}><Plus className="mr-1.5 h-4 w-4" /> Add</Button>}
            <Button size="sm" onClick={save} disabled={saving || loading}><Save className="mr-1.5 h-4 w-4" /> {saving ? "Saving..." : "Save changes"}</Button>
          </div>
        </div>

        {msg && <p className={`mx-5 mt-4 text-sm rounded-lg px-4 py-2.5 ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}

        <div className="p-5 space-y-3">
          {loading ? <p className="text-muted text-sm">Loading…</p> : section.single ? (
            <div className="grid md:grid-cols-2 gap-4">{section.fields.map((f) => renderField(f, items[0] || {}, 0))}</div>
          ) : items.length === 0 ? <p className="text-muted text-sm">Nothing here yet – click Add.</p> : items.map((it, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 px-4 py-3">
                <button type="button" onClick={() => setOpenIdx(openIdx === idx ? null : idx)} className="flex-1 text-left font-medium text-charcoal truncate">{idx + 1}. {section.itemLabel?.(it) || <span className="text-muted">(untitled)</span>}</button>
                <button type="button" aria-label="Move up" onClick={() => move(idx, -1)} className="p-1.5 rounded hover:bg-slate-100 text-muted"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" aria-label="Move down" onClick={() => move(idx, 1)} className="p-1.5 rounded hover:bg-slate-100 text-muted"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" aria-label="Delete" onClick={() => { setItems(items.filter((_, i) => i !== idx)); setDirty(true); setOpenIdx(null) }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
              {openIdx === idx && <div className="grid md:grid-cols-2 gap-4 px-4 pb-4">{section.fields.map((f) => renderField(f, it, idx))}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
