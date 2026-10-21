import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { useBrandColors } from "../../../services/useBrandColors"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const FIXED: Record<string, string> = { Completed: "#2F9E7A", Rescheduled: "#E0A33B" }

export function AppointmentDonut({ data: raw = [] }: { data?: { name: string; value: number; color: string }[] }) {
  const brand = useBrandColors()
  const PALETTE: Record<string, string> = { ...FIXED, Upcoming: brand.accent, Cancelled: brand.secondary }
  const data = raw.map((d) => ({ ...d, color: PALETTE[d.name] || d.color }))
  const hasData = data.some((d) => d.value > 0)
  const chartData = hasData ? data : [{ name: "No data", value: 1, color: "#E5E5EA" }]
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Appointment Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="h-[240px] w-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, "Share"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #E8DFEC" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center text-sm">
              <span 
                className="h-3 w-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-muted flex-1">{item.name}</span>
              <span className="font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
