import React, { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import {
  ShieldAlert, Lock, Eye, EyeOff, ShieldCheck, AlertCircle,
  LayoutDashboard, LogOut, ArrowRight, Activity, ArrowLeft, KeyRound
} from "lucide-react"
import api, { saveSession, getSessionUser, logout } from "../../services/api"

interface AdminLoginProps {
  onLoginSuccess?: (user: any) => void
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentUser, setCurrentUser] = useState(() => getSessionUser())

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!identifier.trim() || !password) {
      setError("Please enter your administrator email/phone and password.")
      return
    }

    setLoading(true)
    try {
      const data = await api.login(identifier.trim(), password, "admin")
      saveSession(data)
      setCurrentUser(data.user)

      if (onLoginSuccess) {
        onLoginSuccess(data.user)
      }

      const redirectPath = searchParams.get("redirect")
      if (redirectPath && redirectPath.startsWith("/admin")) {
        navigate(redirectPath)
      } else {
        navigate("/admin")
      }
    } catch (err: any) {
      if (err.data?.message?.includes("registered as a doctor") || err.message?.includes("registered as a doctor")) {
        setError("Access Denied: Doctors are not authorized to access the Admin Console. Please use the Doctor Portal at /doctor.")
      } else if (err.data?.message?.includes("registered as a patient") || err.message?.includes("registered as a patient")) {
        setError("Access Denied: Patient accounts cannot access the Admin Console. Please use the Patient Login at /login.")
      } else {
        setError(err.message || "Invalid administrator credentials.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchAccount = () => {
    logout()
    setCurrentUser(null)
    setError("")
  }

  return (
    <div className="theme-admin min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/70 backdrop-blur px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2" title="Carevaa Home">
            <span className="font-serif font-bold text-xl tracking-tight text-white flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-base">C</span>
              Carevaa <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-medium border border-slate-700">ADMIN</span>
            </span>
          </Link>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Non-Admin User Warning Banner */}
          {currentUser && currentUser.role !== "admin" && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-950/60 border border-amber-600/40 text-amber-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5">
                  <p className="font-semibold text-amber-100 text-sm">
                    Access Denied: {currentUser.role === "doctor" ? "Doctor" : "Patient"} Account Detected
                  </p>
                  <p className="text-amber-200/80 leading-relaxed">
                    You are currently signed in as <strong>{currentUser.name || currentUser.email}</strong> ({currentUser.role}). The Admin Console is restricted strictly to authorized administrators.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <Link
                      to={currentUser.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold border border-amber-500/40 transition"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" /> Go to {currentUser.role === "doctor" ? "Doctor" : "Patient"} Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleSwitchAccount}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-black/80 backdrop-blur-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Admin Console
              </h1>
              <p className="text-xs text-slate-400 mt-1.5">
                Authorized administrator login & operations management
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <label htmlFor="admin-id" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Identifier
                </label>
                <input
                  id="admin-id"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@carevia.com or phone"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white placeholder:text-slate-500 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="admin-pwd" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-pwd"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 px-3.5 pr-11 rounded-xl border border-slate-700 bg-slate-950/80 text-white placeholder:text-slate-500 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In to Admin Console</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">
                Need role-specific access?
              </p>
              <div className="flex items-center justify-center gap-4 text-xs font-medium">
                <Link to="/doctor" className="text-emerald-400 hover:underline">
                  Doctor Login
                </Link>
                <span className="text-slate-700">·</span>
                <Link to="/login" className="text-slate-400 hover:text-slate-200 hover:underline">
                  Patient Login
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Role-Based Access Control · TLS 1.3 · IP Monitored</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Unauthorized access attempts are logged and will be reported.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-slate-900 px-4 text-center flex items-center justify-center text-[11px] text-slate-600">
        Carevaa Healthcare Operations Console © {new Date().getFullYear()} · All rights reserved.
      </footer>
    </div>
  )
}
