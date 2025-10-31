"use client"

import { useState, useEffect } from "react"

interface SearchProps {
  onResults?: (results: any[]) => void
}

export default function RequestSearch({ onResults }: SearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const search = async () => {
      setSearching(true)
      try {
        const response = await fetch(`/api/monitoring/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results)
        onResults?.(data.results)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setSearching(false)
      }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query, onResults])

  return (
    <div>
      <input
        type="text"
        placeholder="Search requests by query, operation name, or error..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
      {searching && <p className="text-xs text-slate-500 mt-2">Searching...</p>}
      {results.length > 0 && <p className="text-xs text-slate-500 mt-2">Found {results.length} requests</p>}
    </div>
  )
}
