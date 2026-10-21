import { useState } from "react"
import api from "../../services/api"
import { useApi } from "../lib/useApi"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Modal } from "../components/ui/Modal"
import { Plus, Stethoscope, Heart, Activity, Baby, Bone, Brain, Droplet, Eye } from "lucide-react"

const ICONS: Record<string, any> = { Stethoscope, Heart, Activity, Baby, Bone, Brain, Droplet, Eye, Lungs: Activity }

export function Specializations() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const { data, error: loadError, reload } = useApi(() => api.getSpecializations())
  const [editingId, setEditingId] = useState<string | null>(null)
  const emptyForm = { name: "", description: "", icon: "Stethoscope", status: "Active" }
  const [form, setForm] = useState(emptyForm)
  const [actionError, setActionError] = useState("")
  const error = loadError || actionError
  const specializations = ((data as any)?.specializations || []).map((sp: any) => ({ ...sp, icon: ICONS[sp.icon] || Stethoscope, iconName: sp.icon }))
  const totalProviders = specializations.reduce((t: number, sp: any) => t + (sp.providers || 0), 0)

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setActionError(""); setAddModalOpen(true) }
  const openEdit = (sp: any) => { setEditingId(sp.id); setForm({ name: sp.name, description: sp.description || "", icon: sp.iconName || "Stethoscope", status: sp.status }); setActionError(""); setAddModalOpen(true) }
  const save = async () => {
    if (!form.name.trim()) { setActionError("Specialization name is required"); return }
    try {
      if (editingId) await api.updateSpecialization(editingId, form)
      else await api.createSpecialization(form)
      setAddModalOpen(false)
      reload()
    } catch (err: any) {
      setActionError(err.message)
    }
  }
  const toggleStatus = async (sp: any) => {
    try {
      await api.updateSpecialization(sp.id, { status: sp.status === "Active" ? "Inactive" : "Active" })
      reload()
    } catch (err: any) {
      setActionError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Specializations</h1>
          <p className="text-muted mt-1">Manage healthcare specializations available on Carevaa.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Specialization
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Specializations", value: String(specializations.length) },
          { label: "Active", value: String(specializations.filter((sp: any) => sp.status === "Active").length) },
          { label: "Inactive", value: String(specializations.filter((sp: any) => sp.status !== "Active").length) },
          { label: "Total Providers", value: String(totalProviders) }
        ].map(stat => (
          <div key={stat.label} className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {error && !isAddModalOpen && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {specializations.map((spec: any) => (
          <div key={spec.name} className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                <spec.icon className="h-5 w-5" />
              </div>
              <Badge variant={spec.status === "Active" ? "success" : "default"}>{spec.status}</Badge>
            </div>
            
            <h3 className="text-lg font-bold text-charcoal mb-1">{spec.name}</h3>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Providers</span>
                <span className="font-medium text-charcoal">{spec.providers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Appointments</span>
                <span className="font-medium text-charcoal">{spec.appointments.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => openEdit(spec)} className="flex-1 border-slate-200 text-charcoal font-medium hover:bg-slate-50">Edit</Button>
              <Button variant="outline" onClick={() => toggleStatus(spec)} className="flex-1 text-error border-slate-200 hover:bg-red-50 hover:text-error hover:border-error/30 font-medium">{spec.status === "Active" ? "Disable" : "Enable"}</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title={editingId ? "Edit Specialization" : "Add Specialization"}>
         <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-sm font-medium text-charcoal block">Specialization Name</label>
               <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. Pulmonology" />
            </div>
            <div className="space-y-2">
               <label className="text-sm font-medium text-charcoal block">Description</label>
               <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 min-h-24 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Brief description of the specialization..."></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal block">Icon</label>
                  <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500">
                     <option>Lungs</option>
                     <option>Stethoscope</option>
                     <option>Heart</option>
                     <option>Brain</option>
                     <option>Bone</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal block">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500">
                     <option>Active</option>
                     <option>Inactive</option>
                  </select>
               </div>
            </div>
            {actionError && <p className="text-sm font-medium text-red-600">{actionError}</p>}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
               <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
               <Button className="bg-brand-600 hover:bg-brand-700 text-white" onClick={save}>Save Specialization</Button>
            </div>
         </div>
      </Modal>
    </div>
  )
}
