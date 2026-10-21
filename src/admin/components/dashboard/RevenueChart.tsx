import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { useBrandColors } from "../../../services/useBrandColors"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function RevenueChart({ data = [], totalRevenue = 0 }: { data?: { name: string; total: number }[]; totalRevenue?: number }) {
  const brand = useBrandColors()
  return (
    <Card className="md:col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <p className="text-sm text-muted">Total Revenue: ₹{Number(totalRevenue || 0).toLocaleString("en-IN")}</p>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={brand.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={brand.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#8C8C99" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#8C8C99"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => (value >= 1000 ? `₹${(value / 1000).toLocaleString("en-IN")}k` : `₹${value}`)}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #E8DFEC", boxShadow: "0 8px 24px -12px color-mix(in_srgb,var(--color-primary)_25%,transparent)" }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="total" stroke={brand.accent} strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
