import { Card, CardContent } from "../ui/Card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ElementType
  tone?: "plum" | "rose" | "violet" | "teal" | "amber"
}

const TONES = {
  plum: "bg-mint text-strong",
  rose: "bg-secondary/10 text-secondary",
  violet: "bg-accent/10 text-accent",
  teal: "bg-[#E4F4EE] text-[#1E7F62]",
  amber: "bg-[#FBF1DE] text-[#A86A12]",
}

export function KPICard({ title, value, change, isPositive, icon: Icon, tone = "plum" }: KPICardProps) {
  return (
    <Card data-kpi={title} className="group transition-shadow hover:shadow-[0_14px_34px_-18px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-muted">{title}</p>
            <h3 className="text-[28px] leading-none font-semibold text-charcoal mt-3 tracking-tight">{value}</h3>
          </div>
          <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${TONES[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {change}
          </span>
          <span className="text-muted ml-2">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
