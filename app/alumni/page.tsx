"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import AlumniList from "@/components/alumni/alumni-list"
import AlumniForm from "@/components/alumni/alumni-form"

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchAlumni = async () => {
    try {
      setLoading(true)
      setAlumni([])
    } catch (error) {
      console.error("Failed to fetch alumni:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlumni()
  }, [])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Data Alumni</h1>
            <p className="text-slate-600 mt-2">Total: {alumni.length} alumni</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {showForm ? "Cancel" : "+ Tambah Alumni"}
          </button>
        </div>

        {showForm && (
          <AlumniForm
            onSuccess={() => {
              setShowForm(false)
              fetchAlumni()
            }}
          />
        )}

        <AlumniList alumni={alumni} loading={loading} onRefresh={fetchAlumni} />
      </div>
    </Layout>
  )
}
