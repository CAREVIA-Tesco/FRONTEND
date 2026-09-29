import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Plus, Stethoscope, HeartHandshake, FlaskConical, Users, Pill, Leaf } from "lucide-react"

const services = [
  { name: "Doctor Consultation", desc: "Online doctor consultation with certified healthcare professionals.", price: "₹499", bookings: "1,284", status: "Active", icon: Stethoscope },
  { name: "Home Nursing", desc: "Professional nursing care delivered right to your home.", price: "₹1,200", bookings: "450", status: "Active", icon: Users },
  { name: "Physiotherapy", desc: "Expert physiotherapy sessions for recovery and mobility.", price: "₹800", bookings: "320", status: "Active", icon: HeartHandshake },
  { name: "Lab Tests", desc: "Home sample collection and quick accurate reports.", price: "Variable", bookings: "2,150", status: "Active", icon: FlaskConical },
  { name: "Homeopathy", desc: "Consultations with expert homeopathic practitioners.", price: "₹399", bookings: "180", status: "Active", icon: Pill },
  { name: "Ayurveda", desc: "Traditional ayurvedic consultations and wellness plans.", price: "₹499", bookings: "210", status: "Active", icon: Leaf }
]

export function Services() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Services</h1>
          <p className="text-muted mt-1">Manage healthcare services offered through Carevia.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Services", value: "12" },
          { label: "Active", value: "10" },
          { label: "Inactive", value: "2" },
          { label: "Total Bookings", value: "8,452" }
        ].map(stat => (
          <div key={stat.label} className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.name} className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                <service.icon className="h-6 w-6" />
              </div>
              <Badge variant={service.status === "Active" ? "success" : "default"}>{service.status}</Badge>
            </div>
            
            <h3 className="text-xl font-bold text-charcoal mb-2">{service.name}</h3>
            <p className="text-muted text-sm flex-1">{service.desc}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
               <div>
                  <div className="text-xs text-muted">Price</div>
                  <div className="font-semibold text-charcoal">{service.price}</div>
               </div>
               <div className="text-right">
                  <div className="text-xs text-muted">Bookings</div>
                  <div className="font-semibold text-charcoal">{service.bookings}</div>
               </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1 text-brand-600 border-brand-200 hover:bg-brand-50">View</Button>
              <Button variant="outline" className="flex-1">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
