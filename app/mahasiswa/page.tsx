"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import MahasiswaList from "@/components/mahasiswa/mahasiswa-list"
import MahasiswaForm from "@/components/mahasiswa/mahasiswa-form"

export default function MahasiswaPage() {
  const [mahasiswa, setMahasiswa] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchMahasiswa = async () => {
    try {
      setLoading(true)
      if (!searchQuery.trim()) {
        const query = `
          query {
            searchMahasiswa(query: "", limit: 100) {
              id
              nim
              nama
              jurusan
              angkatan
              email
            }
          }
        `

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        })

        const data = await response.json()
        setMahasiswa(data.data?.searchMahasiswa || [])
      } else {
        const query = `
          query Search($q: String!) {
            searchMahasiswa(query: $q, limit: 100) {
              id
              nim
              nama
              jurusan
              angkatan
              email
            }
          }
        `

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            variables: { q: searchQuery },
          }),
        })

        const data = await response.json()
        setMahasiswa(data.data?.searchMahasiswa || [])
      }
    } catch (error) {
      console.error("Failed to fetch mahasiswa:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMahasiswa()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchMahasiswa()
  }, [])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Data Mahasiswa</h1>
            <p className="text-slate-600 mt-2">Total: {mahasiswa.length} mahasiswa</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {showForm ? "Cancel" : "+ Tambah Mahasiswa"}
          </button>
        </div>

        {showForm && (
          <MahasiswaForm
            onSuccess={() => {
              setShowForm(false)
              fetchMahasiswa()
            }}
          />
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <input
            type="text"
            placeholder="Cari nama, NIM, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <MahasiswaList mahasiswa={mahasiswa} loading={loading} onRefresh={fetchMahasiswa} />
      </div>
    </Layout>
  )
}
