"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface LineChartProps {
  data: { semester: string; gpa: number; cpa: number }[];
}

export function LineChart({ data }: LineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const filteredData = data.filter(item => item.gpa !== 0 && item.cpa !== 0)
    
    const labels = filteredData.map(item => item.semester)
    const gpaData = filteredData.map(item => item.gpa)
    const cpaData = filteredData.map(item => item.cpa)

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "GPA",
            data: gpaData,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
          },
          {
            label: "CPA",
            data: cpaData,
            borderColor: "rgb(236, 72, 153)",
            backgroundColor: "rgba(236, 72, 153, 0.1)",
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: "Kì học"
            }
          },
          y: {
            beginAtZero: true,
            max: 4.0,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            title: {
              display: true,
              text: "Điểm"
            }
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "bottom"
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: (context) => {
                const dataset = context.dataset
                const value = context.raw
                return `${dataset.label}: ${value}`
              }
            }
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
