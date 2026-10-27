import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Search, Filter, Download, Plus, Users, UserCheck, AlertTriangle, ShieldCheck, Ban, Check, X, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import api from "../../services/api"
import { downloadCsv } from "../lib/useApi"
import { paginate, useNotice } from "../lib/forms"
import { Pager } from "../components/ui/Pager"
import { Notice } from "../components/ui/Notice"
import { Modal } from "../components/ui/Modal"

export function Providers() {
  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useNotice();
  const navigate = useNavigate();
  
  useEffect(() => {
    loadDoctors();
  }, []);
  
  const loadDoctors = () => {
    api.getProviders({ status: "ALL" })
      .then((data: any) => setAllProviders(data.providers || []))
      .catch((err: Error) => setError(err.message));
  };
  
  const updateStatus = async (id: string, status: string) => {
    setError("");
    try {
      await api.setProviderStatus(id, status);
      loadDoctors();
    } catch (err: any) {
      setError(err.message);
    }
  };
  // remove from / put back on the website, or delete for good
  const [confirm, setConfirm] = useState<{ kind: "hide" | "delete"; p: any } | null>(null);
  const [working, setWorking] = useState(false);
  const runConfirm = async () => {
    if (!confirm) return;
    setWorking(true); setError("");
    try {
      if (confirm.kind === "hide") await api.setProviderStatus(confirm.p.id, "SUSPENDED");
      else await api.deleteProvider(confirm.p.id);
      setConfirm(null);
      loadDoctors();
    } catch (err: any) { setError(err.message); setConfirm(null); } finally { setWorking(false); }
  };
  const handleApprove = (id: string) => updateStatus(id, 'ACTIVE');
  const handleReject = (id: string) => updateStatus(id, 'REJECTED');

  const providersList = allProviders.filter((p: any) => {
    if (search && !`${p.name} ${p.id} ${p.code || ""} ${p.phone || ""} ${p.spec}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (specFilter && p.spec !== specFilter) return false;
    if (typeFilter && (typeFilter === "Doctor") !== !!p.isDoctor) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });
  const paged = paginate(providersList, page);
  useEffect(() => { setPage(1); }, [search, specFilter, typeFilter, statusFilter]);
  const exportCsv = () => downloadCsv("carevaa-providers.csv", [["Provider ID", "Name", "Profession", "Specialization", "Experience", "Location", "Rating", "Status"], ...providersList.map((p: any) => [p.id, p.name, p.profession, p.spec, p.exp, p.loc, p.rating, p.status])]);
  
  const totalProviders = allProviders.length;
  const activeProviders = allProviders.filter(p => p.status === 'ACTIVE' || !p.status).length;
  const pendingProviders = allProviders.filter(p => p.status === 'PENDING').length;
  const rejectedProviders = allProviders.filter(p => p.status === 'REJECTED' || p.status === 'SUSPENDED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-muted mb-2">
        <span>Management</span>
        <span className="mx-2">/</span>
        <span className="text-charcoal font-medium">Doctors & Providers</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Doctors & Providers</h1>
          <p className="text-muted mt-1">Manage healthcare professionals and providers registered with Carevaa.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => navigate("/admin/providers/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Provider
          </Button>
        </div>
      </div>

      <Notice text={notice} onClose={() => setNotice("")} />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Providers", value: totalProviders.toString(), desc: "Registered professionals", icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Active Providers", value: activeProviders.toString(), desc: "Approved & bookable", icon: UserCheck, color: "text-success", bg: "bg-green-50" },
          { label: "Pending Verification", value: pendingProviders.toString(), desc: "Requires admin review", icon: AlertTriangle, color: "text-warning", bg: "bg-amber-50" },
          { label: "Verified Providers", value: activeProviders.toString(), desc: `${totalProviders ? Math.round((activeProviders / totalProviders) * 1000) / 10 : 0}% of providers`, icon: ShieldCheck, color: "text-success", bg: "bg-green-50" },
          { label: "Rejected", value: rejectedProviders.toString(), desc: "Currently inactive", icon: Ban, color: "text-error", bg: "bg-red-50" }
        ].map(stat => (
          <div key={stat.label} className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
               <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                 <stat.icon className="h-5 w-5" />
               </div>
            </div>
            <p className="text-sm font-medium text-muted mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-charcoal">{stat.value}</p>
            <p className="text-xs text-muted mt-2">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full lg:w-[420px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
            type="text" 
            placeholder="Search doctor, provider name, ID or phone..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 whitespace-nowrap">
            <option value="">Specialization</option>
            {[...new Set(allProviders.map((p: any) => p.spec))].map((sp: any) => <option key={sp} value={sp}>{sp}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 whitespace-nowrap">
            <option value="">Provider Type</option>
            <option value="Doctor">Doctor</option>
            <option value="Care Professional">Care Professional</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 whitespace-nowrap">
            <option value="">Verification Status</option>
            <option value="ACTIVE">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <Button variant="outline" className="whitespace-nowrap" onClick={() => { setSearch(""); setSpecFilter(""); setTypeFilter(""); setStatusFilter(""); }}>
            <Filter className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
      <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm">
         <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-2xl">
            <div>
               <h3 className="font-bold text-charcoal text-lg">All Providers</h3>
               <p className="text-sm text-muted">{providersList.length} providers</p>
            </div>
         </div>
         <Table className="border-0 rounded-none shadow-none">
            <TableHeader className="bg-slate-50">
            <TableRow>
               <TableHead>Provider</TableHead>
               <TableHead>Provider ID</TableHead>
               <TableHead>Profession</TableHead>
               <TableHead>Specialization</TableHead>
               <TableHead>Experience</TableHead>
               <TableHead>Location</TableHead>
               <TableHead>Rating</TableHead>
               <TableHead>Verification</TableHead>
               <TableHead>Status</TableHead>
               <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {paged.rows.length === 0 && (
               <TableRow><TableCell colSpan={10} className="text-center text-muted py-8">No providers match these filters.</TableCell></TableRow>
            )}
            {paged.rows.map(provider => (
               <TableRow key={provider.id}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <img src={provider.img} alt="" className="h-10 w-10 rounded-full object-cover" />
                        <span className="font-medium text-charcoal">{provider.name}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-muted text-sm whitespace-nowrap">{provider.code || `DOC-${provider.id.toString().slice(-4)}`}</TableCell>
                  <TableCell className="text-sm">{provider.isDoctor ? 'Doctor' : 'Care Professional'}</TableCell>
                  <TableCell className="text-sm">{provider.spec}</TableCell>
                  <TableCell className="text-sm">{provider.exp}</TableCell>
                  <TableCell className="text-sm">{provider.loc}</TableCell>
                  <TableCell className="text-sm font-medium">★ {provider.rating}</TableCell>
                  <TableCell>
                     {provider.status === "PENDING" ? (
                     <Badge variant="warning" className="bg-amber-100 text-amber-700">Pending</Badge>
                     ) : provider.status === "SUSPENDED" ? (
                     <Badge variant="default" className="bg-slate-200 text-slate-700">Removed</Badge>
                     ) : provider.status === "REJECTED" ? (
                     <Badge variant="default" className="bg-red-100 text-red-700">Rejected</Badge>
                     ) : (
                     <Badge variant="success" className="bg-green-100 text-green-700">Verified</Badge>
                     )}
                  </TableCell>
                  <TableCell>
                     {provider.status === "ACTIVE" || !provider.status ? (
                     <Badge variant="success">On website</Badge>
                     ) : (
                     <Badge variant="default">Hidden</Badge>
                     )}
                  </TableCell>
                  <TableCell className="text-right">
                     {provider.status === 'PENDING' ? (
                       <div className="flex items-center justify-end gap-2">
                         <button onClick={() => handleApprove(provider.id)} className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition" title="Approve">
                           <Check className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleReject(provider.id)} className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition" title="Reject">
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     ) : (
                     <div className="flex items-center justify-end gap-1">
                       <Link to={`/admin/providers/${provider.id}`} className="h-8 px-2.5 inline-flex items-center rounded-md text-sm font-medium text-brand-600 hover:bg-slate-100">View</Link>
                       <Link to={`/admin/providers/${provider.id}/edit?back=/admin/providers`} className="h-8 px-2.5 inline-flex items-center rounded-md text-sm font-medium text-charcoal hover:bg-slate-100">Edit</Link>
                       {provider.status === "ACTIVE" ? (
                         <button type="button" onClick={() => setConfirm({ kind: "hide", p: provider })} className="h-8 px-2.5 inline-flex items-center rounded-md text-sm font-medium text-amber-700 hover:bg-amber-50" title="Hide this profile from the website">Remove from website</button>
                       ) : (
                         <button type="button" onClick={() => updateStatus(provider.id, "ACTIVE")} className="h-8 px-2.5 inline-flex items-center rounded-md text-sm font-medium text-green-700 hover:bg-green-50" title="Show this profile on the website again">Show on website</button>
                       )}
                       <button type="button" onClick={() => setConfirm({ kind: "delete", p: provider })} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-red-600 hover:bg-red-50" title="Delete permanently" aria-label={`Delete ${provider.name}`}><Trash2 className="h-4 w-4" /></button>
                     </div>
                     )}
                  </TableCell>
               </TableRow>
            ))}
            </TableBody>
         </Table>
         <Pager page={paged.current} pages={paged.pages} from={paged.from} to={paged.to} total={providersList.length} label="providers" onPage={setPage} />
      </div>

      <Modal isOpen={!!confirm} onClose={() => !working && setConfirm(null)} title={confirm?.kind === "delete" ? "Delete professional?" : "Remove from website?"}>
        {confirm && (
          <div className="space-y-4">
            <p className="text-sm text-charcoal">
              {confirm.kind === "delete"
                ? <><strong>{confirm.p.name}</strong> will be deleted permanently and their login will no longer have a professional profile. Past appointments keep their name. This cannot be undone.</>
                : <><strong>{confirm.p.name}</strong> will be hidden from Find Doctors, search, the home page and booking. Their account and history stay, and you can show the profile again any time.</>}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirm(null)} disabled={working}>Cancel</Button>
              <Button onClick={runConfirm} disabled={working} className={confirm.kind === "delete" ? "bg-red-600 hover:bg-red-700 text-white" : ""}>{working ? "Please wait…" : confirm.kind === "delete" ? "Delete" : "Remove from website"}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
