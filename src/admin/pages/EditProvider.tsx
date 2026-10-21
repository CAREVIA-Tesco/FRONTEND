import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import api from "../../services/api"

const PROFESSIONS = ["MBBS Doctor", "Homeopathy Doctor", "Ayurveda Doctor", "Physiotherapist", "Nurse", "Caretaker", "Lab Centre", "BHS"]
const SPECIALIZATIONS: Record<string, string[]> = {
  "MBBS Doctor": ["General Physician", "General Medicine", "Dermatology", "Pediatrics", "Gynecology", "Cardiology", "Orthopedics", "ENT", "Ophthalmology", "Psychiatry", "Pulmonology", "Gastroenterology", "Neurology", "Urology", "Emergency Medicine", "Family Medicine"],
  "Homeopathy Doctor": ["General Homeopathy", "Pediatrics", "Dermatology", "Women’s Health", "Chronic Disease Care", "Allergy & Asthma", "Skin & Allergy"],
  "Ayurveda Doctor": ["General Ayurveda", "Panchakarma", "Skin & Hair Care", "Pain & Joint Care"],
  Physiotherapist: ["General Physiotherapy", "Orthopedic Physiotherapy", "Sports Physiotherapy", "Neurological Physiotherapy", "Post-Surgery Rehabilitation"],
  Nurse: ["General Nursing", "ICU Nurse", "Pediatric Nurse", "Geriatric Nurse", "Baby Care Nurse"],
  Caretaker: ["Elderly Care", "Patient Care", "Post-Surgery Care", "Baby Care", "Dementia Care"],
  "Lab Centre": ["General Diagnostic Tests", "Blood Tests", "Imaging & Diagnostics"],
  BHS: ["General Health Science", "Community Health", "Public Health"],
}

export function EditProvider() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    profession: "MBBS Doctor", specialization: "", qualification: "", registrationNumber: "",
    onlineFee: "", clinicFee: "", homeFee: "",
  })
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    api.getProvider(id as string)
      .then(({ provider }: any) => {
        const parts = (provider.name || "").split(" ")
        const hasTitle = /^Dr\.?$/i.test(parts[0])
        const first = hasTitle ? `${parts[0]} ${parts[1] || ""}`.trim() : parts[0] || ""
        const last = parts.slice(hasTitle ? 2 : 1).join(" ")
        setForm({
          firstName: first,
          lastName: last,
          email: provider.email || "",
          phone: provider.phone || "",
          profession: provider.profession || "MBBS Doctor",
          specialization: provider.specialization || "",
          qualification: provider.qualification || "",
          registrationNumber: provider.registrationNumber || "",
          onlineFee: provider.onlineFee ?? "",
          clinicFee: provider.clinicFee ?? "",
          homeFee: provider.fee ?? "",
        })
      })
      .catch((err: Error) => setError(err.message))
  }, [id])

  const specOptions = [...new Set([...(SPECIALIZATIONS[form.profession] || []), form.specialization].filter(Boolean))]

  const handleSave = async () => {
    const name = `${form.firstName} ${form.lastName}`.trim()
    if (!name) { setError("Name is required"); return }
    setSaving(true)
    setError("")
    try {
      await api.updateProvider(id as string, {
        name,
        email: form.email,
        phone: form.phone,
        profession: form.profession,
        specialization: form.specialization,
        qualification: form.qualification,
        registrationNumber: form.registrationNumber,
        onlineFee: form.onlineFee,
        clinicFee: form.clinicFee,
        homeFee: form.homeFee,
      })
      navigate(`/admin/providers/${id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center text-sm text-muted mb-4">
        <span className="hover:text-charcoal transition-colors cursor-pointer">Management</span>
        <span className="mx-2">/</span>
        <Link to="/admin/providers" className="hover:text-brand-600 transition-colors">Doctors & Providers</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal font-medium">Edit Provider</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Edit Provider</h1>
        <p className="text-muted mt-1">Update provider information and account details.</p>
      </div>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-charcoal mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">First Name</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" value={form.firstName} onChange={set("firstName")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Last Name</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" value={form.lastName} onChange={set("lastName")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Email</label>
                <input type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" value={form.email} onChange={set("email")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Phone</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" value={form.phone} onChange={set("phone")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-charcoal mb-4 border-b border-slate-100 pb-2">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Provider Type</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" value={form.profession} onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value, specialization: "" }))}>
                  {PROFESSIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Specialization</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" value={form.specialization} onChange={set("specialization")}>
                  <option value="">Select Specialization</option>
                  {specOptions.map((sp) => <option key={sp}>{sp}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Qualification</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" placeholder="e.g. BHMS" value={form.qualification} onChange={set("qualification")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Registration Number</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" placeholder="e.g. HOM-2020-10284" value={form.registrationNumber} onChange={set("registrationNumber")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-charcoal mb-4 border-b border-slate-100 pb-2">Consultation Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Online Fee (₹)</label>
                <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" value={form.onlineFee} onChange={set("onlineFee")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Clinic Fee (₹)</label>
                <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" value={form.clinicFee} onChange={set("clinicFee")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Home Fee (₹)</label>
                <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" value={form.homeFee} onChange={set("homeFee")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
           <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
           <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </div>
    </div>
  )
}
