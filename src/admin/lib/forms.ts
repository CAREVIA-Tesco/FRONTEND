import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
// Shared bits for the admin forms

export const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 bg-slate-50 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
export const areaCls = "w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm text-charcoal min-h-24 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
export const labelCls = "text-sm font-medium text-charcoal block mb-1.5"

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const SLOTS = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"]

// Reads a picture the admin picked and returns a small JPEG data URL (square crop for profile photos)
export function resizeImage(file: File, size = 320, square = true): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { reject(new Error("Please choose a JPG, PNG or WebP image.")); return }
    if (file.size > 8 * 1024 * 1024) { reject(new Error("Please choose an image under 8 MB.")); return }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      if (square) {
        const side = Math.min(img.width, img.height)
        canvas.width = size; canvas.height = size
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      } else {
        const scale = Math.min(1, size / Math.max(img.width, img.height))
        canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/jpeg", 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That image could not be read.")) }
    img.src = url
  })
}

// Client-side paging for the admin tables
export function paginate<T>(rows: T[], page: number, size = 10) {
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(Math.max(1, page), pages)
  return { pages, current, rows: rows.slice((current - 1) * size, current * size), from: rows.length ? (current - 1) * size + 1 : 0, to: Math.min(current * size, rows.length) }
}

// One-time message passed from a form page to the list it returns to ("Lab centre added")
export function useNotice() {
  const location = useLocation() as any
  const navigate = useNavigate()
  const [notice, setNotice] = useState<string>(location.state?.notice || "")
  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice)
      navigate(location.pathname + location.search, { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.notice])
  return [notice, setNotice] as const
}
