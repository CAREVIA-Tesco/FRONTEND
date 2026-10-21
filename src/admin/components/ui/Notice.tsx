import { CheckCircle2, X } from "lucide-react"

export function Notice({ text, onClose }: { text: string; onClose: () => void }) {
  if (!text) return null
  return (
    <p role="status" className="flex items-center gap-2 text-sm font-medium text-green-800 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
      <CheckCircle2 className="h-4 w-4 shrink-0" /> <span className="flex-1">{text}</span>
      <button type="button" aria-label="Dismiss" onClick={onClose} className="p-0.5 rounded hover:bg-green-100"><X className="h-4 w-4" /></button>
    </p>
  )
}
