"use client"

interface MetricsCardProps {
  metrics: any
}

export default function MetricsCards({ metrics }: MetricsCardProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-100 rounded-lg h-20 animate-pulse"></div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: "Avg Response Time",
      value: `${metrics.averageResponseTime}ms`,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-600",
    },
    {
      label: "Total Requests",
      value: metrics.totalRequests,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-600",
    },
    {
      label: "Error Rate",
      value: `${metrics.errorRate}%`,
      color: metrics.errorRate > 5 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200",
      textColor: metrics.errorRate > 5 ? "text-red-600" : "text-green-600",
    },
    {
      label: "Slowest Request",
      value: `${metrics.slowestRequest}ms`,
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className={`${card.color} border rounded-lg p-4`}>
          <p className="text-sm text-slate-600 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
