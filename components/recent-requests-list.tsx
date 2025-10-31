"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RequestsListProps {
  requests: any[]
}

export default function RecentRequestsList({ requests }: RequestsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent GraphQL Requests</CardTitle>
        <CardDescription>Last 20 requests to the GraphQL API</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Method</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Duration (ms)</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Operation</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Time</th>
              </tr>
            </thead>
            <tbody>
              {requests && requests.length > 0 ? (
                requests.map((req, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {req.method}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={req.duration > 100 ? "text-orange-600 font-medium" : "text-green-600"}>
                        {req.duration}ms
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          req.status === 200
                            ? "bg-green-100 text-green-700"
                            : req.status === 500
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs" title={req.operationName}>
                      {req.operationName || "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{new Date(req.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
