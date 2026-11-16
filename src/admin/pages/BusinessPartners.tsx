import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, Download, CheckCircle2, XCircle, Trash2, ExternalLink } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Modal } from "../components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import api from "../../services/api"
import { useApi, downloadCsv } from "../lib/useApi"

const STATUSES = ["Pending", "Approved", "Rejected"]
const BADGE: Record<string, "warning" | "success" | "error"> = { Pending: "warning", Approved: "success", Rejected: "error" }
const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
const categoryOf = (p: any) => (p.category === "Other" && p.categoryOther ? p.categoryOther : p.category)
const servicesOf = (p: any) => [...(p.services || []), p.servicesOther].filter(Boolean).join(", ")

// Healthcare businesses that applied from "Register as a Business Partner" (separate from doctor registration)
export function BusinessPartners() {
  const { data, error: loadError, reload } = useApi(() => api.adminBusinessPartners())
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get("q") || "")
  const [status, setStatus] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<any>(null)
  const all: any[] = (data as any)?.partners || []
  const list = all
    .filter((p) => !status || p.status === status)
    .filter((p) => !search || `${p.code} ${p.businessName} ${p.contactPerson} ${p.phone} ${p.email} ${p.city} ${categoryOf(p)} ${servicesOf(p)}`.toLowerCase().includes(search.toLowerCase()))
  const open = all.find((p) => p.id === openId)

  useEffect(() => { setNote(""); setActionError("") }, [openId])

  const update = async (id: string, body: any) => {
    setBusy(true); setActionError("")
    try { await api.updateBusinessPartner(id, body); setNote(""); reload() } catch (err: any) { setActionError(err.message) } finally { setBusy(false) }
  }
  const remove = async () => {
    setBusy(true); setActionError("")
    try { await api.deleteBusinessPartner(confirmDelete.id); setConfirmDelete(null); setOpenId(null); reload() } catch (err: any) { setActionError(err.message) } finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Business Partners</h1>
          <p className="text-muted mt-1">Clinics, labs and healthcare businesses that applied to partner with Carevaa. Review and approve or reject each application.</p>
        </div>
        <Button variant="outline" onClick={() => downloadCsv("carevaa-business-partners.csv", [["ID", "Business", "Category", "Contact person", "Designation", "Phone", "Email", "Website", "Address", "Area", "City", "District", "State", "PIN code", "Services", "Years", "Registration no.", "GST", "Message", "Status", "Applied"], ...list.map((p) => [p.code, p.businessName, categoryOf(p), p.contactPerson, p.designation, p.phone, p.email, p.website, p.address, p.locality, p.city, p.district, p.state, p.pincode, servicesOf(p), p.yearsInBusiness, p.registrationNumber, p.gstNumber, p.message, p.status, fmt(p.createdAt)])])}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {STATUSES.map((s) => (
          <button key={s} type="button" onClick={() => setStatus(status === s ? "" : s)} className={`text-left rounded-2xl border p-4 bg-surface shadow-sm transition ${status === s ? "border-brand-500 ring-2 ring-brand-500/20" : "border-slate-200 hover:border-slate-300"}`}>
            <p className="text-sm text-muted">{s}</p>
            <p className="text-2xl font-bold text-charcoal">{all.filter((p) => p.status === s).length}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-surface p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, business, contact, phone, city or service..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select aria-label="Status filter" value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-surface px-3 text-sm">
          <option value="">All statuses ({all.length})</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s} ({all.filter((p) => p.status === s).length})</option>)}
        </select>
      </div>

      {(loadError || (!open && actionError)) && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{loadError || actionError}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted py-8">{all.length ? "No applications match." : "No business partner applications yet."}</TableCell></TableRow>}
          {list.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium"><span className="block text-xs text-brand-600 font-semibold">{p.code}</span>{p.businessName}</TableCell>
              <TableCell>{categoryOf(p)}</TableCell>
              <TableCell>{p.contactPerson}<span className="block text-xs text-muted">{p.phone}</span></TableCell>
              <TableCell>{p.city || "-"}</TableCell>
              <TableCell>{fmt(p.createdAt)}</TableCell>
              <TableCell><Badge variant={BADGE[p.status]}>{p.status}</Badge></TableCell>
              <TableCell className="text-right"><Button variant="outline" size="sm" className="h-8" onClick={() => setOpenId(p.id)}>Review</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={!!open} onClose={() => !busy && setOpenId(null)} title={open ? `${open.code} · ${open.businessName}` : ""} size="lg">
        {open && (
          <div className="space-y-5" data-testid="partner-review">
            <div className="flex items-center justify-between gap-3">
              <Badge variant={BADGE[open.status]}>{open.status}</Badge>
              {open.reviewedAt && <span className="text-xs text-muted">Reviewed by {open.reviewedBy} on {fmt(open.reviewedAt)}</span>}
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Business category", categoryOf(open)], ["Years in business", open.yearsInBusiness],
                ["Contact person", [open.contactPerson, open.designation].filter(Boolean).join(" · ")], ["Mobile", open.phone],
                ["Email", open.email], ["Website", open.website],
                ["Address", [open.address, open.locality, open.city, open.district, open.state, open.pincode].filter(Boolean).join(", ")],
                ["Registration / licence", open.registrationNumber], ["GST number", open.gstNumber],
                ["Applied", fmt(open.createdAt)],
              ].filter(([, v]) => v !== undefined && v !== null && v !== "").map(([k, v]) => (
                <div key={k as string} className={k === "Address" ? "sm:col-span-2" : ""}><dt className="text-muted text-xs">{k}</dt><dd className="font-medium text-charcoal break-words">{k === "Website" ? <a href={/^https?:\/\//.test(String(v)) ? String(v) : `https://${v}`} target="_blank" rel="noreferrer" className="text-brand-600 inline-flex items-center gap-1">{v} <ExternalLink className="h-3.5 w-3.5" /></a> : v}</dd></div>
              ))}
              <div className="sm:col-span-2"><dt className="text-muted text-xs">Services offered</dt><dd className="mt-1 flex flex-wrap gap-1.5">{[...(open.services || []), open.servicesOther].filter(Boolean).map((s: string) => <span key={s} className="text-xs font-medium bg-slate-100 text-charcoal rounded-full px-2.5 py-1">{s}</span>)}</dd></div>
              {open.message && <div className="sm:col-span-2"><dt className="text-muted text-xs">Message</dt><dd className="text-charcoal whitespace-pre-line">{open.message}</dd></div>}
            </dl>

            {(open.notes || []).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">History</p>
                <ul className="space-y-1.5 text-sm">{[...open.notes].reverse().map((n: any, i: number) => <li key={i} className="text-charcoal"><span className="text-muted text-xs">{fmt(n.at)} · {n.by}:</span> {n.text}</li>)}</ul>
              </div>
            )}
            <div>
              <label htmlFor="bp-note" className="text-xs font-semibold text-muted">Internal note</label>
              <div className="flex gap-2 mt-1">
                <input id="bp-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Called, visit scheduled" className="flex-1 h-9 rounded-lg border border-slate-200 px-3 text-sm" />
                <Button variant="outline" size="sm" disabled={busy || !note.trim()} onClick={() => update(open.id, { note })}>Add note</Button>
              </div>
            </div>
            {actionError && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{actionError}</p>}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
              <a href={`tel:${open.phone}`}><Button variant="ghost" size="sm">Call</Button></a>
              <Button variant="ghost" size="sm" className="text-error" disabled={busy} onClick={() => setConfirmDelete(open)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
              <span className="flex-1" />
              {open.status !== "Rejected" && <Button variant="outline" size="sm" disabled={busy} onClick={() => update(open.id, { status: "Rejected", note: note || undefined })}><XCircle className="h-4 w-4 mr-1.5" /> Reject</Button>}
              {open.status !== "Approved" && <Button size="sm" disabled={busy} onClick={() => update(open.id, { status: "Approved", note: note || undefined })}><CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve</Button>}
              {open.status !== "Pending" && <Button variant="ghost" size="sm" disabled={busy} onClick={() => update(open.id, { status: "Pending" })}>Move back to pending</Button>}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => !busy && setConfirmDelete(null)} title="Delete application?">
        <p className="text-sm text-muted">{confirmDelete?.businessName} ({confirmDelete?.code}) will be removed permanently.</p>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" disabled={busy} onClick={remove}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
