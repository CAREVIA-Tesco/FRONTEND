import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Plus, Stethoscope, HeartHandshake, FlaskConical, Users, Pill, Leaf } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { useApi } from "../lib/useApi"

const ICONS: Record<string, any> = { Stethoscope, HeartHandshake, FlaskConical, Users, Pill, Leaf }

export function Services() {
  const navigate = useNavigate()
  const { data, error } = useApi(() => api.getServices())
  const services = ((data as any)?.services || []).map((sv: any) => ({ ...sv, icon: ICONS[sv.icon] || Stethoscope }))
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Services</h1>
          <p className="text-muted mt-1">Manage healthcare services offered through Carevaa.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Services", value: String(services.length) },
          { label: "Active", value: String(services.filter((sv: any) => sv.status === "Active").length) },
          { label: "Inactive", value: String(services.filter((sv: any) => sv.status !== "Active").length) },
          { label: "Total Bookings", value: services.reduce((t: number, sv: any) => t + (sv.bookings || 0), 0).toLocaleString("en-IN") }
        ].map(stat => (
          <div key={stat.label} className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error && <p className="col-span-full text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
        {services.map((service: any) => (
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
              <Button variant="outline" onClick={() => navigate("/admin/appointments")} className="flex-1 text-brand-600 border-brand-200 hover:bg-brand-50">View</Button>
              <Button variant="outline" className="flex-1">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
