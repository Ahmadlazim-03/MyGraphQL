"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ErrorLog() {
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const response = await fetch("/api/monitoring/errors?limit=10")
        const data = await response.json()
        setErrors(data.errors || [])
      } catch (error) {
        console.error("Failed to fetch errors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchErrors()
    const interval = setInterval(fetchErrors, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600">Error Log</CardTitle>
        <CardDescription>Recent API errors ({errors.length})</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {errors && errors.length > 0 ? (
            errors.map((error, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-xs font-medium text-red-700 mb-1">{error.timestamp}</p>
                <p className="text-sm text-red-600 break-words">{error.error}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-500 py-8">
              <p className="text-sm">No errors recorded</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
