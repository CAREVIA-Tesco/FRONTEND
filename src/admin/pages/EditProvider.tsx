import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"

export function EditProvider() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center text-sm text-muted mb-4">
        <span className="hover:text-charcoal transition-colors cursor-pointer">Management</span>
        <span className="mx-2">/</span>
        <Link to="/providers" className="hover:text-brand-600 transition-colors">Doctors & Providers</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal font-medium">Edit Provider</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">Edit Provider</h1>
        <p className="text-muted mt-1">Update provider information and account details.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-charcoal mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">First Name</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" defaultValue="Priya" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Last Name</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" defaultValue="Sharma" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Email</label>
                <input type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" defaultValue="priya.sharma@carevia.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Phone</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" defaultValue="+91 98765 43210" />
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
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                  <option>Homeopathy Doctor</option>
                  <option>MBBS Doctor</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Specialization</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                  <option>Skin & Allergy</option>
                  <option>General Medicine</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Qualification</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" defaultValue="BHMS" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Registration Number</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" defaultValue="HOM-2020-10284" />
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
                <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" defaultValue="500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Clinic Fee (₹)</label>
                <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" defaultValue="600" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">Home Fee (₹)</label>
                <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50" defaultValue="800" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-3 pt-4">
           <Button variant="outline">Cancel</Button>
           <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
