import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent } from "../components/ui/Card"
import { Shield, Key, Monitor, Edit, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Modal } from "../components/ui/Modal"
import api, { getSessionUser, saveSession, getToken, logout } from "../../services/api"
import { useApi } from "../lib/useApi"

export function SuperAdminProfile() {
  const navigate = useNavigate()
  const { data, reload } = useApi(() => api.me())
  const me = (data as any)?.user || getSessionUser() || {}
  const [mode, setMode] = useState<"" | "profile" | "password">("")
  const [form, setForm] = useState({ name: "", email: "", current: "", password: "", confirm: "" })
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const initials = (me.name || "SA").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
  const open = (m: "profile" | "password") => { setForm({ name: me.name || "", email: me.email || "", current: "", password: "", confirm: "" }); setErr(""); setMode(m) }
  const save = async () => {
    setErr("")
    try {
      if (mode === "password") {
        if (!form.current) { setErr("Enter your current password"); return }
        if (form.password.length < 6) { setErr("Password must be at least 6 characters"); return }
        if (form.password !== form.confirm) { setErr("Passwords do not match"); return }
        await api.updateMe({ currentPassword: form.current, password: form.password })
        setMsg("Password changed successfully.")
      } else {
        const res: any = await api.updateMe({ name: form.name, email: form.email })
        saveSession({ token: getToken() as string, user: { ...getSessionUser(), ...res.user } })
        setMsg("Profile updated.")
      }
      setMode("")
      reload()
    } catch (e: any) { setErr(e.message) }
  }
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
                  {initials}
                </div>
                <h2 className="text-xl font-bold text-charcoal">{me.name || "Super Admin"}</h2>
                <p className="text-muted font-medium mt-1">{me.email}</p>
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
                  <span className="font-medium text-sm">{me.createdAt ? new Date(me.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</span>
                </div>
              </div>

              <div className="pt-6">
                <Button className="w-full" variant="outline" onClick={() => open("profile")}>
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
                    <p className="text-sm text-muted mt-1">{msg || "Keep your account secure with a strong password"}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => open("password")}>Change Password</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-charcoal flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted" /> This device
                    </h4>
                    <p className="text-sm text-muted mt-1">{me.lastLoginAt ? `Last login ${new Date(me.lastLoginAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : "Signed in as administrator"}. Sign out when you use a shared computer.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/login") }}><LogOut className="h-4 w-4 mr-2" /> Sign out</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Modal isOpen={mode !== ""} onClose={() => setMode("")} title={mode === "password" ? "Change Password" : "Edit Profile"}>
         <div className="space-y-4">
            {mode === "profile" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal block">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal block">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="adm-current" className="text-sm font-medium text-charcoal block">Current Password</label>
                  <input id="adm-current" type="password" autoComplete="current-password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal block">New Password</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal block">Confirm Password</label>
                  <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </>
            )}
            {err && <p className="text-sm font-medium text-red-600">{err}</p>}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
               <Button variant="outline" onClick={() => setMode("")}>Cancel</Button>
               <Button onClick={save}>Save</Button>
            </div>
         </div>
      </Modal>
    </div>
  )
}
