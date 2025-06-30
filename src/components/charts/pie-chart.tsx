"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip } from "recharts"

Chart.register(...registerables)

interface PieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

export function PieChart({ data }: PieChartProps) {
  return (
    <div className="h-[300px]">
      <RechartsPieChart width={400} height={300}>
        <Pie
          data={data}
          cx={200}
          cy={150}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backgroundImage: "linear-gradient(to bottom right, rgba(0, 255, 255, 0.3), rgba(255, 255, 255, 0.8))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            padding: "8px"
          }}
          itemStyle={{
            color: "hsl(var(--foreground))"
          }}
          labelStyle={{
            color: "hsl(var(--foreground))",
            fontWeight: 500
          }}
        />
      </RechartsPieChart>
    </div>
  )
}
