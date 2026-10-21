import { Button } from "./Button"

// Previous / page numbers / Next under an admin table
export function Pager({ page, pages, from, to, total, label = "results", onPage }: { page: number; pages: number; from: number; to: number; total: number; label?: string; onPage: (p: number) => void }) {
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => pages <= 7 || n === 1 || n === pages || Math.abs(n - page) <= 1)
  return (
    <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white rounded-b-2xl" data-testid="pager">
      <span className="text-sm text-muted">{total ? `Showing ${from}–${to} of ${total} ${label}` : `No ${label}`}</span>
      {pages > 1 && (
        <div className="flex gap-1 items-center">
          <Button variant="outline" size="sm" className="px-2" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
          {nums.map((n, i) => (
            <span key={n} className="flex items-center gap-1">
              {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
              <Button variant="outline" size="sm" aria-current={n === page ? "page" : undefined} className={n === page ? "px-3 bg-brand-50 text-brand-600 border-brand-200" : "px-3 text-muted"} onClick={() => onPage(n)}>{n}</Button>
            </span>
          ))}
          <Button variant="outline" size="sm" className="px-2" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
