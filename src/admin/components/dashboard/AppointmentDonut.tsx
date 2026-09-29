import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Completed", value: 62, color: "#10b981" },
  { name: "Upcoming", value: 18, color: "#3b82f6" },
  { name: "Cancelled", value: 9, color: "#ef4444" },
  { name: "Rescheduled", value: 7, color: "#f59e0b" },
  { name: "No Show", value: 4, color: "#64748b" },
]

export function AppointmentDonut() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Appointment Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="h-[240px] w-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, "Share"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
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
