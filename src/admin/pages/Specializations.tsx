import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Modal } from "../components/ui/Modal"
import { Plus, Stethoscope, Heart, Activity, Baby, Bone, Brain, Droplet, Eye } from "lucide-react"

const specializations = [
  { name: "General Medicine", providers: 124, appointments: 2450, status: "Active", icon: Stethoscope },
  { name: "Cardiology", providers: 48, appointments: 890, status: "Active", icon: Heart },
  { name: "Dermatology", providers: 56, appointments: 1120, status: "Active", icon: Droplet },
  { name: "Pediatrics", providers: 82, appointments: 1560, status: "Active", icon: Baby },
  { name: "Orthopedics", providers: 45, appointments: 780, status: "Active", icon: Bone },
  { name: "Neurology", providers: 24, appointments: 420, status: "Active", icon: Brain },
  { name: "Ophthalmology", providers: 32, appointments: 650, status: "Active", icon: Eye },
  { name: "Psychiatry", providers: 41, appointments: 590, status: "Active", icon: Activity }
]

export function Specializations() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Specializations</h1>
          <p className="text-muted mt-1">Manage healthcare specializations available on Carevia.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Specialization
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Specializations", value: "24" },
          { label: "Active", value: "22" },
          { label: "Inactive", value: "2" },
          { label: "Total Providers", value: "1,284" }
        ].map(stat => (
          <div key={stat.label} className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {specializations.map((spec) => (
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
              <Button variant="outline" className="flex-1 border-slate-200 text-charcoal font-medium hover:bg-slate-50">Edit</Button>
              <Button variant="outline" className="flex-1 text-error border-slate-200 hover:bg-red-50 hover:text-error hover:border-error/30 font-medium">Disable</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add Specialization">
         <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-sm font-medium text-charcoal block">Specialization Name</label>
               <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. Pulmonology" />
            </div>
            <div className="space-y-2">
               <label className="text-sm font-medium text-charcoal block">Description</label>
               <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 min-h-24 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Brief description of the specialization..."></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal block">Icon</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500">
                     <option>Lungs</option>
                     <option>Stethoscope</option>
                     <option>Heart</option>
                     <option>Brain</option>
                     <option>Bone</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal block">Status</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500">
                     <option>Active</option>
                     <option>Inactive</option>
                  </select>
               </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
               <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
               <Button className="bg-brand-600 hover:bg-brand-700 text-white" onClick={() => setAddModalOpen(false)}>Save Specialization</Button>
            </div>
         </div>
      </Modal>
    </div>
  )
}
