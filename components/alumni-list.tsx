"use client"

export default function AlumniList({ alumni, loading, onRefresh }: any) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">NIM</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Nama</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Jurusan</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Tahun Lulus</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {alumni.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-600">
                  Tidak ada data alumni
                </td>
              </tr>
            ) : (
              alumni.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">{item.nim}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.jurusan}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.tahunLulus}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Detail</button>
                    <span className="mx-2 text-slate-300">|</span>
                    <button className="text-red-600 hover:text-red-800 font-medium">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
