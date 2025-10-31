"use client"

import { useGraphQLMonitoring } from "@/hooks/use-graphql-monitoring"

export default function LiveIndicator() {
  const { isConnected } = useGraphQLMonitoring()

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
      <span className="text-sm font-medium text-slate-600">{isConnected ? "Live" : "Connecting..."}</span>
    </div>
  )
}
