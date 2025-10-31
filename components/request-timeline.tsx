"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TimelineProps {
  timeline: any[]
}

export default function RequestTimeline({ timeline }: TimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Timeline</CardTitle>
        <CardDescription>Requests and response times over the last minute</CardDescription>
      </CardHeader>
      <CardContent>
        {timeline && timeline.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                name="Request Count"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgDuration"
                stroke="#ef4444"
                name="Avg Duration (ms)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500">No data available yet</div>
        )}
      </CardContent>
    </Card>
  )
}
