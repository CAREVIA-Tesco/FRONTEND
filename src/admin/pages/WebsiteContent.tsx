import { applyPalette } from "../../components/ThemeLoader"
import { useEffect, useState } from "react"
import { Plus, Trash2, ArrowUp, ArrowDown, Save, ExternalLink } from "lucide-react"
import { Button } from "../components/ui/Button"
import api from "../../services/api"
import { setSiteContent } from "../../services/useSiteContent"

type Field = { name: string; label: string; type?: "text" | "textarea" | "number" | "paragraphs" | "select"; placeholder?: string; options?: [string, string][] }
type Section = { key: string; title: string; desc: string; single?: boolean; preview?: string; itemLabel?: (i: any) => string; fields: Field[]; blank?: any; defaults?: any[] }

const SHOW: [string, string][] = [["show", "Shown"], ["hide", "Hidden"]]

// Everything the public website reads from GET /api/content/:key, editable without touching code
const SECTIONS: Section[] = [
  { key: "theme", title: "Theme colours", desc: "Colour palette of the whole site: public website, login, patient and doctor dashboards, and this admin console.", single: true, preview: "/", fields: [
    { name: "palette", label: "Palette", type: "select", options: [["plum", "Plum & Rose"], ["navy", "Navy & Coral"], ["teal", "Teal & Orange"], ["blue", "Medical Blue & Green"]] },
  ] },
  { key: "contact", title: "Contact details", desc: "Phone, email, address and social media links shown in the header, footer, Contact Us page and call buttons. Leave a social link empty to hide its icon.", single: true, preview: "/contact", fields: [
    { name: "phone", label: "Phone number" }, { name: "email", label: "Email" }, { name: "whatsapp", label: "WhatsApp number (optional)", placeholder: "e.g. 919876543210" },
    { name: "hours", label: "Working hours" }, { name: "address", label: "Office address" }, { name: "careersEmail", label: "Careers email" }, { name: "careersPhone", label: "Careers phone" },
    { name: "facebook", label: "Facebook page link", placeholder: "https://facebook.com/carevaa" }, { name: "instagram", label: "Instagram link", placeholder: "https://instagram.com/carevaa" },
    { name: "twitter", label: "X (Twitter) link", placeholder: "https://x.com/carevaa" }, { name: "linkedin", label: "LinkedIn link", placeholder: "https://linkedin.com/company/carevaa" },
    { name: "youtube", label: "YouTube link", placeholder: "https://youtube.com/@carevaa" },
  ] },
  { key: "home-sections", title: "Homepage sections", desc: "Show or hide each section of the homepage. Hidden sections disappear from the website straight away; their content is kept so you can show them again later.", single: true, preview: "/", fields: [
    { name: "services", label: "Our services", type: "select", options: SHOW },
    { name: "how", label: "How Carevaa works", type: "select", options: SHOW },
    { name: "offers", label: "New offers", type: "select", options: SHOW },
    { name: "offersAuto", label: "Automatic offers (shown while your Offers list is empty)", type: "select", options: SHOW },
    { name: "stats", label: "Numbers band", type: "select", options: SHOW },
    { name: "testimonials", label: "Happy Customers (reviews – add them in Customer Reviews)", type: "select", options: SHOW },
    { name: "doctors", label: "Meet our expert doctors", type: "select", options: SHOW },
    { name: "why", label: "About / Why Carevaa", type: "select", options: SHOW },
    { name: "articles", label: "Stories & articles (blog)", type: "select", options: SHOW },
    { name: "cities", label: "Cities we serve", type: "select", options: SHOW },
    { name: "partner", label: "Partner / join us", type: "select", options: SHOW },
    { name: "faq", label: "FAQs", type: "select", options: SHOW },
    { name: "cta", label: "Closing call-to-action", type: "select", options: SHOW },
    { name: "chat", label: "Floating chat button", type: "select", options: SHOW },
  ] },
  { key: "offers", title: "Offers", desc: "Offer cards in the homepage \"New Offers\" section. While this list is empty the website shows automatic offers worked out from the Package pricing rules and your professionals' fees – to remove those, set Homepage sections → Automatic offers to Hidden. Once you add offers here, only yours are shown. Delete an offer with the bin icon, or set it to Hidden to keep it for later.", preview: "/#offers", itemLabel: (i) => `${i.title || "New offer"}${i.show === "hide" ? " (hidden)" : ""}`, blank: { title: "", badge: "", line: "", service: "", plan: "", img: "/physio-section.png", show: "show" }, fields: [
    { name: "show", label: "Show on website", type: "select", options: [["show", "Shown"], ["hide", "Hidden"]] },
    { name: "badge", label: "Badge", placeholder: "e.g. 10% Off, From ₹500, New" }, { name: "title", label: "Title", placeholder: "e.g. Physiotherapy" },
    { name: "line", label: "Offer text", type: "textarea", placeholder: "e.g. 10-session pack at ₹315 per session – save ₹350" },
    { name: "service", label: "Service it books", placeholder: "e.g. Physiotherapy, Nurse Care, Home Doctor" },
    { name: "plan", label: "Plan name (optional)", placeholder: "Fill for a plan – the button becomes \"Get this plan\" and opens a plan enquiry" },
    { name: "img", label: "Image URL", placeholder: "/physio-section.png, /nurse-hero.jpg, /caretaker-hero.png, /home-hero.jpg or https://…" },
    { name: "terms", label: "Small print (optional)", placeholder: "*T&C Apply" },
  ] },
  { key: "how-it-works", title: "How Carevaa works", desc: "The steps in the homepage \"How Carevaa Works\" section. Add, edit, reorder or delete steps.", preview: "/#how-it-works", itemLabel: (i) => i.title, blank: { title: "", desc: "" }, defaults: [
    { title: "Book or request a call", desc: "Pick an open slot online, or leave your number and a Carevaa care advisor calls you back." },
    { title: "Understand the need", desc: "We learn about the patient’s condition and match a qualified professional to it." },
    { title: "Care at your doorstep", desc: "A verified doctor, nurse, physio or caregiver visits your home – or consults online." },
    { title: "Records & follow-up", desc: "Vitals, notes and prescriptions are saved to your dashboard after every visit." },
  ], fields: [
    { name: "title", label: "Step title" }, { name: "desc", label: "Description", type: "textarea" },
  ] },
  { key: "why-carevaa", title: "Why Carevaa points", desc: "The benefit boxes in the homepage \"About Carevaa\" section.", preview: "/#about", itemLabel: (i) => i.title, blank: { title: "", desc: "" }, defaults: [
    { title: "Verified Professionals", desc: "Qualifications and registration checked at onboarding" },
    { title: "24/7 Booking", desc: "Book anytime and see real open slots instantly" },
    { title: "Transparent Pricing", desc: "See the exact fee before you pay – no hidden charges" },
    { title: "Easy Refunds", desc: "Cancelled paid appointments are refunded automatically" },
  ], fields: [
    { name: "title", label: "Title" }, { name: "desc", label: "Description", type: "textarea" },
  ] },
  { key: "home-numbers", title: "Homepage numbers", desc: "The numbers in the homepage band next to \"Trusted Care\" (up to 3), e.g. 500+ Verified professionals. The \"Patients served\" number is also used in the Happy Customers heading.", preview: "/#about", itemLabel: (i) => `${i.value || ""} ${i.label || "New number"}${i.show === "hide" ? " (hidden)" : ""}`, blank: { value: "", label: "", show: "show" }, defaults: [
    { value: "500+", label: "Verified professionals", show: "show" },
    { value: "10,000+", label: "Patients served", show: "show" },
    { value: "100+", label: "Hospital partners", show: "show" },
  ], fields: [
    { name: "value", label: "Number (e.g. 500+)" }, { name: "label", label: "Label" }, { name: "show", label: "Show on website", type: "select", options: SHOW },
  ] },
  { key: "faqs", title: "FAQs", desc: "Questions shown on the homepage.", preview: "/#faq", itemLabel: (i) => i.q, blank: { q: "", a: "" }, fields: [
    { name: "q", label: "Question" }, { name: "a", label: "Answer", type: "textarea" },
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
  ...([["legal-privacy", "Privacy Policy", "/privacy-policy"], ["legal-terms", "Terms & Conditions", "/terms"], ["legal-patient-rights", "Patient Rights", "/patient-rights"]] as const).map(([key, title, preview]) => ({
    key, title, preview, single: true, desc: `Text of the ${title} page. Start a line with "## " to make it a heading. Have it reviewed by your legal adviser.`, fields: [
      { name: "title", label: "Page title" }, { name: "updated", label: "Last updated" }, { name: "body", label: "Page text (blank line between paragraphs)", type: "paragraphs" as const },
    ],
  })),
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
      .then((d: any) => setItems(section.single ? [d.items?.[0] || {}] : d.items?.length ? d.items : (section.defaults || []).map((x) => ({ ...x }))))
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
      setSiteContent(active, clean) // the website (same browser) shows the change straight away
      if (active === "theme") applyPalette(clean[0]?.palette)
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
        {f.type === "select"
          ? <select id={id} className={inputCls} value={value || f.options?.[0]?.[0]} onChange={(e) => onChange(e.target.value)}>{f.options?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          : f.type === "textarea" || f.type === "paragraphs"
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
