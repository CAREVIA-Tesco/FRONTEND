import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent } from "../components/ui/Card"
import { Shield, Smartphone, Key, Monitor, Edit } from "lucide-react"

export function SuperAdminProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">My Profile</h1>
        <p className="text-muted mt-1">Manage your Super Admin account and security settings.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="h-24 w-24 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-3xl mb-4">
                  SA
                </div>
                <h2 className="text-xl font-bold text-charcoal">Super Admin</h2>
                <p className="text-muted font-medium mt-1">admin@carevia.com</p>
                <div className="mt-3">
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
              
              <div className="py-6 space-y-4 border-b border-slate-100">
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Role</span>
                  <span className="font-medium text-sm text-brand-600 bg-brand-50 px-2 py-0.5 rounded">Super Administrator</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Account Created</span>
                  <span className="font-medium text-sm">01 Jan 2026</span>
                </div>
              </div>

              <div className="pt-6">
                <Button className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-2/3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-600" />
                Security Settings
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div>
                    <h4 className="font-medium text-charcoal flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted" /> Password
                    </h4>
                    <p className="text-sm text-muted mt-1">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline" size="sm">Change Password</Button>
                </div>

                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div>
                    <h4 className="font-medium text-charcoal flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted" /> Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-muted mt-1">Secure your account with 2FA</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-charcoal flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted" /> Active Sessions
                    </h4>
                    <p className="text-sm text-muted mt-1">Manage your active logins across devices</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-charcoal">3 Devices</span>
                    <Button variant="outline" size="sm">Manage Sessions</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
