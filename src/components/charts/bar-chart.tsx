"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

Chart.register(...registerables)

interface BarChartProps {
  data: { name: string; value: number }[];
}

export function BarChart({ data }: BarChartProps) {
  return (
    <div className="h-[300px]">
      <RechartsBarChart width={400} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </RechartsBarChart>
    </div>
  )
}
