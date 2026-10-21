import { useCallback, useEffect, useState } from "react"

// Small helper used by the admin pages to load data from the backend
export function useApi<T = any>(loader: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    setLoading(true)
    return loader()
      .then((d) => {
        setData(d)
        setError("")
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    reload()
  }, [reload])

  return { data, error, loading, reload }
}

export const inr = (n: number | undefined) => `₹${Number(n || 0).toLocaleString("en-IN")}`
export const providerCode = (prefix: string, id: string) => `${prefix}-${String(id || "").slice(-4).toUpperCase()}`

export function downloadCsv(filename: string, rows: (string | number | undefined | null)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  a.download = filename
  a.click()
}
