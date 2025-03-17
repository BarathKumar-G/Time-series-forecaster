"use client"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js"
import { Line } from "react-chartjs-2"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface TimeSeriesChartProps {
  historicalData: any[]
  forecastData: any[]
}

export default function TimeSeriesChart({ historicalData, forecastData }: TimeSeriesChartProps) {
  // Combine historical and forecast data for display
  const labels = [...historicalData.map((item) => item.ds), ...forecastData.map((item) => item.ds)]

  // Remove duplicates from labels (in case forecast includes historical dates)
  const uniqueLabels = Array.from(new Set(labels))
  uniqueLabels.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  // Create datasets
  const historicalValues = uniqueLabels.map((date) => {
    const dataPoint = historicalData.find((item) => item.ds === date)
    return dataPoint ? dataPoint.y : null
  })

  const forecastValues = uniqueLabels.map((date) => {
    const dataPoint = forecastData.find((item) => item.ds === date)
    return dataPoint ? dataPoint.yhat : null
  })

  const lowerBound = uniqueLabels.map((date) => {
    const dataPoint = forecastData.find((item) => item.ds === date)
    return dataPoint ? dataPoint.yhat_lower : null
  })

  const upperBound = uniqueLabels.map((date) => {
    const dataPoint = forecastData.find((item) => item.ds === date)
    return dataPoint ? dataPoint.yhat_upper : null
  })

  const chartData = {
    labels: uniqueLabels,
    datasets: [
      {
        label: "Historical Data",
        data: historicalValues,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        pointRadius: 3,
        tension: 0.1,
      },
      {
        label: "Forecast",
        data: forecastValues,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        pointRadius: 3,
        tension: 0.1,
      },
      {
        label: "Upper Bound",
        data: upperBound,
        borderColor: "rgba(255, 99, 132, 0.2)",
        backgroundColor: "transparent",
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: "Lower Bound",
        data: lowerBound,
        borderColor: "rgba(255, 99, 132, 0.2)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.1,
        fill: {
          target: "+1",
          above: "rgba(255, 99, 132, 0.1)",
        },
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  }

  return (
    <div className="w-full h-[400px]">
      <Line data={chartData} options={options} />
    </div>
  )
}

