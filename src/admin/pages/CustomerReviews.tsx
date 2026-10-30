import { useRef, useState } from "react"
import { Plus, Video, MessageSquareQuote, Pencil, Trash2, Eye, EyeOff, ExternalLink, Upload, Loader2, Film } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Modal } from "../components/ui/Modal"
import { Notice } from "../components/ui/Notice"
import api, { uploadReviewVideo, reviewVideoUrl } from "../../services/api"
import { useApi } from "../lib/useApi"
import { inputCls, areaCls, labelCls, useNotice } from "../lib/forms"

type Review = { id: string; type: "text" | "video"; name: string; place: string; text: string; videoId: string | null; videoFileName?: string; videoSize?: number; show: boolean; createdAt: string }
type Draft = { id?: string; type: "text" | "video"; name: string; place: string; text: string; videoId: string; videoFileName: string; show: boolean }

const MAX_MB = 60
const blank = (type: "text" | "video"): Draft => ({ type, name: "", place: "", text: "", videoId: "", videoFileName: "", show: true })
const mb = (n?: number) => (!n ? "" : n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`)

// Admin → Customer Reviews: the reviews shown in the homepage "Happy Customers" section.
// Only reviews added here appear on the website.
export function CustomerReviews() {
  const { data, error, reload } = useApi(() => api.adminCustomerReviews())
  const reviews: Review[] = (data as any)?.reviews || []
  const [notice, setNotice] = useNotice()
  const [filter, setFilter] = useState<"all" | "text" | "video">("all")
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [progress, setProgress] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Review | null>(null)
  const [actionError, setActionError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const list = reviews.filter((r) => filter === "all" || r.type === filter)
  const open = (d: Draft) => { setDraft(d); setFormError(""); setProgress(null) }
  const edit = (r: Review) => open({ id: r.id, type: r.type, name: r.name, place: r.place || "", text: r.text || "", videoId: r.videoId || "", videoFileName: r.videoFileName || "", show: r.show })
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d))

  const pickVideo = async (file?: File) => {
    if (!file) return
    setFormError("")
    if (!/^video\//.test(file.type)) { setFormError("Please choose a video file (MP4, MOV or WebM)."); return }
    if (file.size > MAX_MB * 1024 * 1024) { setFormError(`This video is ${mb(file.size)}. Please upload a video under ${MAX_MB} MB.`); return }
    setProgress(0)
    try {
      const res: any = await uploadReviewVideo(file, setProgress)
      set({ videoId: res.videoId, videoFileName: file.name })
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setProgress(null)
    }
  }

  const save = async () => {
    if (!draft) return
    if (!draft.name.trim()) { setFormError("Please enter the customer's name."); return }
    if (draft.type === "text" && draft.text.trim().length < 5) { setFormError("Please enter the customer's feedback."); return }
    if (draft.type === "video" && !draft.videoId) { setFormError("Please upload the review video."); return }
    setSaving(true); setFormError("")
    const body = { type: draft.type, name: draft.name.trim(), place: draft.place.trim(), text: draft.text.trim(), videoId: draft.videoId || undefined, show: draft.show }
    try {
      if (draft.id) await api.updateCustomerReview(draft.id, body)
      else await api.createCustomerReview(body)
      setNotice(draft.id ? `Review by ${body.name} updated` : `Review by ${body.name} added${body.show ? " – it is now shown in Happy Customers" : " (hidden)"}`)
      setDraft(null)
      reload()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (r: Review) => {
    setActionError("")
    try { await api.updateCustomerReview(r.id, { show: !r.show }); setNotice(`${r.name}'s review is ${r.show ? "hidden from" : "now shown on"} the website`); reload() } catch (err: any) { setActionError(err.message) }
  }
  const remove = async () => {
    if (!confirmDelete) return
    setActionError("")
    try { await api.deleteCustomerReview(confirmDelete.id); setNotice(`Review by ${confirmDelete.name} deleted`); setConfirmDelete(null); reload() } catch (err: any) { setActionError(err.message); setConfirmDelete(null) }
  }

  const counts = { all: reviews.length, text: reviews.filter((r) => r.type === "text").length, video: reviews.filter((r) => r.type === "video").length }

  return (
    <div className="space-y-6" data-testid="customer-reviews-admin">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">Customer Reviews</h1>
          <p className="text-muted mt-1">Text and video reviews for the homepage "Happy Customers" section. Only reviews added here are shown on the website.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/#testimonials" target="_blank" rel="noreferrer"><Button variant="outline"><ExternalLink className="mr-2 h-4 w-4" /> View on website</Button></a>
          <Button variant="outline" onClick={() => open(blank("text"))}><MessageSquareQuote className="mr-2 h-4 w-4" /> Add text review</Button>
          <Button onClick={() => open(blank("video"))}><Video className="mr-2 h-4 w-4" /> Add video review</Button>
        </div>
      </div>

      <Notice text={notice} onClose={() => setNotice("")} />
      {(error || actionError) && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{actionError || String(error)}</p>}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Review type">
        {([["all", "All reviews"], ["text", "Text reviews"], ["video", "Video reviews"]] as const).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${filter === k ? "bg-brand-600 text-white border-brand-600" : "bg-surface text-muted border-slate-200 hover:border-brand-300"}`}>
            {label} <span className="ml-1 opacity-75">{counts[k]}</span>
          </button>
        ))}
      </div>

      {!data && !error ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{[0, 1, 2].map((i) => <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />)}</div>
      ) : list.length === 0 ? (
        <div className="bg-surface border border-dashed border-slate-300 rounded-2xl p-10 text-center">
          <p className="font-semibold text-charcoal">No {filter === "all" ? "" : `${filter} `}reviews yet</p>
          <p className="text-sm text-muted mt-1">Add a text or video review – it appears in the Happy Customers section straight away. While there are none, the section is hidden on the website.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="outline" onClick={() => open(blank("text"))}><Plus className="mr-2 h-4 w-4" /> Text review</Button>
            <Button onClick={() => open(blank("video"))}><Plus className="mr-2 h-4 w-4" /> Video review</Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((r) => (
            <div key={r.id} data-testid="review-card" className={`bg-surface border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col ${r.show ? "" : "opacity-70"}`}>
              {r.type === "video" && r.videoId && (
                <video src={reviewVideoUrl(r.videoId, true)} controls preload="metadata" playsInline className="w-full aspect-video bg-black object-contain" />
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  {r.type === "video" ? <Badge variant="default" className="bg-slate-100"><Film className="h-3 w-3 mr-1" /> Video</Badge> : <Badge variant="default" className="bg-slate-100"><MessageSquareQuote className="h-3 w-3 mr-1" /> Text</Badge>}
                  {r.show ? <Badge variant="success">Shown</Badge> : <Badge variant="warning">Hidden</Badge>}
                </div>
                <p className="font-semibold text-charcoal">{r.name}{r.place ? <span className="font-normal text-muted"> · {r.place}</span> : null}</p>
                {r.text && <p className="text-sm text-muted mt-1.5 line-clamp-4">{r.text}</p>}
                {r.type === "video" && <p className="text-xs text-muted mt-1.5">{[r.videoFileName, mb(r.videoSize)].filter(Boolean).join(" · ")}</p>}
                <div className="mt-auto pt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => edit(r)}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => toggle(r)}>{r.show ? <><EyeOff className="mr-1.5 h-3.5 w-3.5" /> Hide</> : <><Eye className="mr-1.5 h-3.5 w-3.5" /> Show</>}</Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(r)} aria-label={`Delete review by ${r.name}`}><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!draft} onClose={() => !saving && progress === null && setDraft(null)} title={draft ? `${draft.id ? "Edit" : "Add"} ${draft.type === "video" ? "video" : "text"} review` : ""}>
        {draft && (
          <div className="space-y-4" data-testid="review-form">
            <div>
              <label htmlFor="rv-name" className={labelCls}>Customer name *</label>
              <input id="rv-name" className={inputCls} value={draft.name} maxLength={80} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Lakshmi Raman" />
            </div>
            <div>
              <label htmlFor="rv-place" className={labelCls}>City or relation <span className="font-normal text-muted">(optional)</span></label>
              <input id="rv-place" className={inputCls} value={draft.place} maxLength={80} onChange={(e) => set({ place: e.target.value })} placeholder="e.g. Chennai, or Daughter of a patient" />
            </div>
            {draft.type === "text" ? (
              <div>
                <label htmlFor="rv-text" className={labelCls}>Feedback *</label>
                <textarea id="rv-text" className={areaCls} rows={5} maxLength={1200} value={draft.text} onChange={(e) => set({ text: e.target.value })} placeholder="What the customer said about Carevaa" />
                <p className="text-xs text-muted mt-1 text-right">{draft.text.length}/1200</p>
              </div>
            ) : (
              <>
                <div>
                  <p className={labelCls}>Review video *</p>
                  {draft.videoId && <video key={draft.videoId} src={reviewVideoUrl(draft.videoId, true)} controls preload="metadata" playsInline className="w-full max-h-64 rounded-lg bg-black mb-2" data-testid="review-video-preview" />}
                  <input ref={fileRef} id="rv-video" type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/3gpp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; pickVideo(f) }} />
                  <button type="button" disabled={progress !== null} onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 px-4 py-4 text-sm font-medium text-charcoal disabled:opacity-70">
                    {progress !== null ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading… {progress}%</> : <><Upload className="h-4 w-4" /> {draft.videoId ? "Replace video" : "Upload video"}</>}
                  </button>
                  {progress !== null && <div className="h-1.5 rounded-full bg-slate-200 mt-2 overflow-hidden"><div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} /></div>}
                  <p className="text-xs text-muted mt-1.5">{draft.videoFileName ? `${draft.videoFileName} · ` : ""}MP4, MOV or WebM, up to {MAX_MB} MB. Short clips (under 1 minute) load fastest on phones.</p>
                </div>
                <div>
                  <label htmlFor="rv-caption" className={labelCls}>Short caption <span className="font-normal text-muted">(optional)</span></label>
                  <input id="rv-caption" className={inputCls} maxLength={300} value={draft.text} onChange={(e) => set({ text: e.target.value })} placeholder="e.g. Home nursing for my father after surgery" />
                </div>
              </>
            )}
            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input type="checkbox" checked={draft.show} onChange={(e) => set({ show: e.target.checked })} /> Show on the website
            </label>
            {formError && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDraft(null)} disabled={saving || progress !== null}>Cancel</Button>
              <Button onClick={save} disabled={saving || progress !== null}>{saving ? "Saving…" : draft.id ? "Save changes" : "Add review"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete review?">
        {confirmDelete && (
          <div className="space-y-4">
            <p className="text-sm text-muted">The {confirmDelete.type} review by <span className="font-semibold text-charcoal">{confirmDelete.name}</span> will be removed from the website{confirmDelete.type === "video" ? ", and its video deleted" : ""}. This cannot be undone. To keep it for later, use Hide instead.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={remove}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
