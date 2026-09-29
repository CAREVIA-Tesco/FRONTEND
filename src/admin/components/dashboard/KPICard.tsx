import { Card, CardContent } from "../ui/Card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ElementType
}

export function KPICard({ title, value, change, isPositive, icon: Icon }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-muted">{title}</p>
            <h3 className="text-2xl font-bold text-charcoal mt-2">{value}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          {isPositive ? (
            <TrendingUp className="mr-1 h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="mr-1 h-4 w-4 text-error" />
          )}
          <span className={isPositive ? "text-success font-medium" : "text-error font-medium"}>
            {change}
          </span>
          <span className="text-muted ml-2">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
