import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Camera, Globe, Loader2, Trash2 } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import api from "../../services/api"
import { inputCls, areaCls, labelCls, DAYS, SLOTS, resizeImage } from "../lib/forms"

const PROFESSIONS = ["MBBS Doctor", "Homeopathy Doctor", "Ayurveda Doctor", "Physiotherapist", "Nurse", "Caretaker", "Lab Centre", "BHS"]
const SPECIALIZATIONS: Record<string, string[]> = {
  "MBBS Doctor": ["General Physician", "General Medicine", "Dermatology", "Pediatrics", "Gynecology", "Cardiology", "Orthopedics", "ENT", "Ophthalmology", "Psychiatry", "Pulmonology", "Gastroenterology", "Neurology", "Urology", "Emergency Medicine", "Family Medicine"],
  "Homeopathy Doctor": ["General Homeopathy", "Pediatrics", "Dermatology", "Women’s Health", "Chronic Disease Care", "Allergy & Asthma", "Skin & Allergy"],
  "Ayurveda Doctor": ["General Ayurveda", "Panchakarma", "Skin & Hair Care", "Pain & Joint Care"],
  Physiotherapist: ["General Physiotherapy", "Orthopedic Physiotherapy", "Sports Physiotherapy", "Neurological Physiotherapy", "Post-Surgery Rehabilitation"],
  Nurse: ["General Nursing", "ICU Nurse", "Pediatric Nurse", "Geriatric Nurse", "Baby Care Nurse"],
  Caretaker: ["Elderly Care", "Patient Care", "Post-Surgery Care", "Baby Care", "Dementia Care"],
  "Lab Centre": ["General Diagnostic Tests", "Blood Tests", "Imaging & Diagnostics", "Full Body Checkups"],
  BHS: ["General Health Science", "Community Health", "Public Health"],
}
const STATES = ["Andhra Pradesh", "Delhi", "Goa", "Gujarat", "Haryana", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Puducherry", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"]
const PAGE_FOR: Record<string, [string, string]> = {
  Caretaker: ["Caretakers", "/admin/caretakers"],
  Nurse: ["Caretakers", "/admin/caretakers"],
  "Lab Centre": ["Lab Centres", "/admin/labs"],
}
const DEFAULT_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"]
const emptySchedule = () => Object.fromEntries(DAYS.map((d) => [d, d === "Sun" ? [] : [...DEFAULT_SLOTS]])) as Record<string, string[]>

const blank = {
  name: "", gender: "", email: "", phone: "", img: "",
  profession: "MBBS Doctor", specialization: "", qualification: "", experience: "", registrationNumber: "", registrationCouncil: "", languages: "English", bio: "",
  city: "", state: "", pincode: "", clinicName: "", address: "", homeVisitRadiusKm: "",
  onlineFee: "", clinicFee: "", homeFee: "", status: "ACTIVE",
}

// Add or edit a professional (doctor, nurse, caretaker, lab centre ...). Saved professionals with status
// "Active" appear on the website straight away: service pages, Find Doctors, city pages and booking.
export function EditProvider() {
  const { id } = useParams()
  const isNew = !id
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ ...blank, profession: params.get("profession") || "MBBS Doctor" })
  const [schedule, setSchedule] = useState<Record<string, string[]>>(emptySchedule)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [clinicExtra, setClinicExtra] = useState<{ phone?: string; website?: string }>({})
  const set = (k: keyof typeof blank) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const isLab = form.profession === "Lab Centre"
  const isCare = form.profession === "Caretaker" || form.profession === "Nurse"
  const isDoctor = ["MBBS Doctor", "Homeopathy Doctor", "Ayurveda Doctor"].includes(form.profession)
  const [crumbLabel, crumbTo] = PAGE_FOR[form.profession] || ["Doctors & Providers", "/admin/providers"]
  const back = params.get("back") || (isNew ? crumbTo : `/admin/providers/${id}`)

  useEffect(() => {
    if (isNew) return
    let cancelled = false // ignore a late response so it never overwrites what the admin typed
    api.getProvider(id as string)
      .then(({ provider: p }: any) => {
        if (cancelled) return
        setForm({
          name: p.name || "", gender: p.gender || "", email: p.email || "", phone: p.phone || "", img: p.img || "",
          profession: p.profession || "MBBS Doctor", specialization: p.specialization || "", qualification: p.qualification || "",
          experience: p.experience ?? "", registrationNumber: p.registrationNumber || "", registrationCouncil: p.registrationCouncil || "",
          languages: (p.languages || []).join(", "), bio: p.bio || "",
          city: p.city || "", state: p.state || "", pincode: p.pincode || "", clinicName: p.clinic?.name || "", address: p.clinic?.address || "", homeVisitRadiusKm: p.homeVisitRadiusKm ?? "",
          onlineFee: p.onlineFee ?? "", clinicFee: p.clinicFee ?? "", homeFee: p.fee ?? "", status: p.status || "ACTIVE",
        })
        setSchedule(Object.fromEntries(DAYS.map((d) => [d, p.schedule?.[d] || []])))
        setClinicExtra({ phone: p.clinic?.phone, website: p.clinic?.website })
      })
      .catch((err: Error) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, isNew])

  const [catalog, setCatalog] = useState<string[]>([])
  useEffect(() => { api.getSpecializations().then((d: any) => setCatalog((d.specializations || []).filter((x: any) => x.status === "Active").map((x: any) => x.name))).catch(() => {}) }, [])
  const specOptions = useMemo(() => [...new Set([...(SPECIALIZATIONS[form.profession] || []), ...(form.profession === "MBBS Doctor" ? catalog : []), form.specialization].filter(Boolean))], [form.profession, form.specialization, catalog])
  const toggleSlot = (day: string, slot: string) => setSchedule((s) => ({ ...s, [day]: s[day].includes(slot) ? s[day].filter((x) => x !== slot) : SLOTS.filter((x) => [...s[day], slot].includes(x)) }))
  const setDay = (day: string, on: boolean) => setSchedule((s) => ({ ...s, [day]: on ? [...DEFAULT_SLOTS] : [] }))

  const pickPhoto = async (file?: File) => {
    if (!file) return
    try { const img = await resizeImage(file, 320, true); setForm((f) => ({ ...f, img })); setError("") } catch (err: any) { setError(err.message) }
  }

  const validate = () => {
    if (!form.name.trim()) return isLab ? "Lab centre name is required" : "Full name is required"
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) return "Please enter a valid 10-digit mobile number"
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email address"
    if (!form.city.trim()) return "City is required – patients find professionals by city"
    if (form.pincode && !/^[1-9]\d{5}$/.test(form.pincode)) return "Please enter a valid 6-digit PIN code"
    if (!Object.values(schedule).some((d) => d.length)) return "Choose at least one day and time when patients can book"
    return ""
  }

  const handleSave = async () => {
    const problem = validate()
    if (problem) { setError(problem); window.scrollTo({ top: 0, behavior: "smooth" }); return }
    setSaving(true)
    setError("")
    const body: any = {
      name: form.name.trim(), gender: form.gender, email: form.email.trim(), phone: form.phone.replace(/\D/g, "").slice(-10),
      profession: form.profession, specialization: form.specialization, qualification: form.qualification,
      experience: form.experience, registrationNumber: form.registrationNumber, registrationCouncil: form.registrationCouncil,
      languages: form.languages, bio: form.bio,
      city: form.city.trim(), state: form.state, pincode: form.pincode, homeVisitRadiusKm: form.homeVisitRadiusKm,
      clinic: { ...clinicExtra, name: form.clinicName.trim() || (isLab ? form.name.trim() : undefined), address: form.address },
      onlineFee: isLab || isCare ? "" : form.onlineFee, clinicFee: isCare ? "" : form.clinicFee, homeFee: form.homeFee,
      schedule, status: form.status,
    }
    if (form.img) body.img = form.img
    try {
      const res: any = isNew ? await api.createProvider(body) : await api.updateProvider(id as string, body)
      navigate(params.get("back") || (isNew ? crumbTo : `/admin/providers/${res.provider?.id || id}`), { state: { notice: `${body.name} ${isNew ? "added" : "updated"}${body.status === "ACTIVE" ? " – now shown on the website" : ""}` } })
    } catch (err: any) {
      setError(err.message)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setSaving(false)
    }
  }

  const title = isNew ? (isLab ? "Add Lab Centre" : isCare ? `Add ${form.profession === "Nurse" ? "Nurse" : "Caretaker"}` : "Add Provider") : `Edit ${isLab ? "Lab Centre" : "Provider"}`
  if (loading) return <p className="flex items-center gap-2 text-muted py-10"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>

  return (
    <div className="space-y-6 max-w-4xl mx-auto" data-testid="provider-form">
      <div className="flex items-center text-sm text-muted">
        <span>Management</span>
        <span className="mx-2">/</span>
        <Link to={crumbTo} className="hover:text-brand-600 transition-colors">{crumbLabel}</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal font-medium">{title}</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">{title}</h1>
        <p className="text-muted mt-1 flex items-center gap-1.5"><Globe className="h-4 w-4" /> Active profiles appear on the website (service pages, Find Doctors and booking) as soon as you save.</p>
      </div>

      {error && <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}

      <Card>
        <CardContent className="p-6 space-y-5">
          <h2 className="text-lg font-bold text-charcoal">{isLab ? "Lab centre details" : "Profile"}</h2>
          <div className="flex items-center gap-5">
            <label className="relative cursor-pointer shrink-0">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" data-testid="photo-input" onChange={(e) => pickPhoto(e.target.files?.[0])} />
              {form.img
                ? <img src={form.img} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-50" data-testid="photo-preview" />
                : <span className="h-20 w-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-muted"><Camera className="h-6 w-6" /><span className="text-[10px] font-semibold mt-0.5">Upload</span></span>}
            </label>
            <div className="text-sm text-muted">
              <p className="font-medium text-charcoal">{isLab ? "Logo or centre photo" : "Profile photo"}</p>
              <p>JPG, PNG or WebP. Shown on the website card.</p>
              {form.img && <button type="button" onClick={() => setForm((f) => ({ ...f, img: "" }))} className="mt-1 inline-flex items-center gap-1 text-error text-xs font-medium"><Trash2 className="h-3 w-3" /> Remove</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="pf-name" className={labelCls}>{isLab ? "Lab centre name" : "Full name"} *</label>
              <input id="pf-name" className={inputCls} placeholder={isLab ? "e.g. Carevaa Diagnostics, Anna Nagar" : isDoctor ? "e.g. Dr. Priya Raman" : "e.g. Lakshmi Devi"} value={form.name} onChange={set("name")} />
            </div>
            <div>
              <label htmlFor="pf-profession" className={labelCls}>Type</label>
              <select id="pf-profession" className={inputCls} value={form.profession} onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value, specialization: "" }))}>
                {PROFESSIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pf-spec" className={labelCls}>{isLab ? "Tests offered" : "Specialization"}</label>
              <select id="pf-spec" className={inputCls} value={form.specialization} onChange={set("specialization")}>
                <option value="">Select…</option>
                {specOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            {!isLab && (
              <div>
                <label htmlFor="pf-gender" className={labelCls}>Gender</label>
                <select id="pf-gender" className={inputCls} value={form.gender} onChange={set("gender")}>
                  <option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option>
                </select>
              </div>
            )}
            <div>
              <label htmlFor="pf-exp" className={labelCls}>{isLab ? "Years in operation" : "Experience (years)"}</label>
              <input id="pf-exp" type="number" min="0" max="60" className={inputCls} value={form.experience} onChange={set("experience")} />
            </div>
            <div>
              <label htmlFor="pf-phone" className={labelCls}>Mobile</label>
              <input id="pf-phone" inputMode="numeric" maxLength={10} className={inputCls} placeholder="10-digit mobile" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
            </div>
            <div>
              <label htmlFor="pf-email" className={labelCls}>Email</label>
              <input id="pf-email" type="email" className={inputCls} value={form.email} onChange={set("email")} />
            </div>
            <div>
              <label htmlFor="pf-qual" className={labelCls}>{isLab ? "Accreditation" : "Qualification"}</label>
              <input id="pf-qual" className={inputCls} placeholder={isLab ? "e.g. NABL accredited" : isCare ? "e.g. GNM, Certified caregiver" : "e.g. MBBS, MD"} value={form.qualification} onChange={set("qualification")} />
            </div>
            <div>
              <label htmlFor="pf-reg" className={labelCls}>{isLab ? "Licence number" : "Registration number"}</label>
              <input id="pf-reg" className={inputCls} value={form.registrationNumber} onChange={set("registrationNumber")} />
            </div>
            {isDoctor && (
              <div>
                <label htmlFor="pf-council" className={labelCls}>Registration council</label>
                <input id="pf-council" className={inputCls} placeholder="e.g. Tamil Nadu Medical Council" value={form.registrationCouncil} onChange={set("registrationCouncil")} />
              </div>
            )}
            {!isLab && (
              <div>
                <label htmlFor="pf-lang" className={labelCls}>Languages</label>
                <input id="pf-lang" className={inputCls} placeholder="English, Tamil" value={form.languages} onChange={set("languages")} />
              </div>
            )}
            <div className="md:col-span-2">
              <label htmlFor="pf-bio" className={labelCls}>{isLab ? "About the centre" : "About"} <span className="font-normal text-muted">(shown on the website profile)</span></label>
              <textarea id="pf-bio" maxLength={600} className={areaCls} value={form.bio} onChange={set("bio")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-charcoal">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pf-city" className={labelCls}>City *</label>
              <input id="pf-city" className={inputCls} placeholder="e.g. Chennai" value={form.city} onChange={set("city")} />
            </div>
            <div>
              <label htmlFor="pf-state" className={labelCls}>State</label>
              <select id="pf-state" className={inputCls} value={form.state} onChange={set("state")}>
                <option value="">Select…</option>
                {[...new Set([...STATES, form.state].filter(Boolean))].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pf-pin" className={labelCls}>PIN code</label>
              <input id="pf-pin" inputMode="numeric" maxLength={6} className={inputCls} value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} />
            </div>
            {!isCare && (
              <div>
                <label htmlFor="pf-clinic" className={labelCls}>{isLab ? "Branch name" : "Clinic name"} <span className="font-normal text-muted">(optional)</span></label>
                <input id="pf-clinic" className={inputCls} value={form.clinicName} onChange={set("clinicName")} />
              </div>
            )}
            <div className={isCare ? "md:col-span-2" : ""}>
              <label htmlFor="pf-address" className={labelCls}>{isLab ? "Centre address" : "Clinic address"} <span className="font-normal text-muted">(optional)</span></label>
              <input id="pf-address" className={inputCls} value={form.address} onChange={set("address")} />
            </div>
            <div>
              <label htmlFor="pf-radius" className={labelCls}>{isLab ? "Sample collection radius (km)" : "Home visit radius (km)"}</label>
              <input id="pf-radius" type="number" min="0" className={inputCls} value={form.homeVisitRadiusKm} onChange={set("homeVisitRadiusKm")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-charcoal">Fees (₹)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!isLab && !isCare && (
              <div>
                <label htmlFor="pf-fee-online" className={labelCls}>Online consultation</label>
                <input id="pf-fee-online" type="number" min="0" className={inputCls} value={form.onlineFee} onChange={set("onlineFee")} />
              </div>
            )}
            {!isCare && (
              <div>
                <label htmlFor="pf-fee-clinic" className={labelCls}>{isLab ? "Walk-in test visit" : "Clinic visit"}</label>
                <input id="pf-fee-clinic" type="number" min="0" className={inputCls} value={form.clinicFee} onChange={set("clinicFee")} />
              </div>
            )}
            <div>
              <label htmlFor="pf-fee-home" className={labelCls}>{isLab ? "Home sample collection" : isCare ? "Per visit / shift at home" : "Home visit"}</label>
              <input id="pf-fee-home" type="number" min="0" className={inputCls} value={form.homeFee} onChange={set("homeFee")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-charcoal">Weekly availability</h2>
            <p className="text-sm text-muted">Patients can book these slots on the website.</p>
          </div>
          <div className="space-y-3" data-testid="schedule">
            {DAYS.map((d) => (
              <div key={d} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-2 border-b border-slate-100 last:border-0">
                <label className="flex items-center gap-2 w-24 shrink-0 text-sm font-medium text-charcoal pt-1.5">
                  <input type="checkbox" aria-label={`Available on ${d}`} checked={schedule[d].length > 0} onChange={(e) => setDay(d, e.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" /> {d}
                </label>
                {schedule[d].length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {SLOTS.map((t) => (
                      <button key={t} type="button" aria-pressed={schedule[d].includes(t)} onClick={() => toggleSlot(d, t)} className={`h-8 px-2.5 rounded-lg text-xs font-medium border transition-colors ${schedule[d].includes(t) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-muted border-slate-200 hover:border-brand-300"}`}>{t}</button>
                    ))}
                  </div>
                ) : <span className="text-sm text-muted pt-1.5">Not available</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-bold text-charcoal">Status</h2>
          <select aria-label="Status" className={`${inputCls} max-w-xs`} value={form.status} onChange={set("status")}>
            <option value="ACTIVE">Active – shown on the website</option>
            <option value="PENDING">Pending verification – hidden</option>
            <option value="SUSPENDED">Suspended – hidden</option>
          </select>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => navigate(back)}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : isNew ? title.replace("Add", "Save") : "Save Changes"}</Button>
      </div>
    </div>
  )
}
