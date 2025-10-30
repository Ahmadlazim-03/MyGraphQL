const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Ensure there are users to link to. Adjust user IDs if your DB differs.
  // We'll create alumni for userId 1 and 2 if they exist.
  const users = await prisma.user.findMany({ where: { id: { in: [1, 2] } } })
  console.log('Found users:', users.map(u => ({ id: u.id, email: u.email, username: u.username })))

  const created = []

  if (users.length === 0) {
    console.warn('No users with id 1 or 2 found. Aborting.')
    return
  }

  for (const u of users) {
    // Create alumni record
    const alumniData = {
      userId: u.id,
      nim: `NIM-${u.id}-${Date.now() % 100000}`,
      nama: `${u.username || 'user'+u.id}`,
      jurusan: u.id === 1 ? 'Teknik Informatika' : 'Sistem Informasi',
      angkatan: 2020 + (u.id - 1),
      tahunLulus: 2024,
      noTelepon: u.id === 1 ? '081234567890' : '089876543210',
      alamat: u.id === 1 ? 'Jl. Mawar No.1' : 'Jl. Melati No.2'
    }

    const alumni = await prisma.alumni.create({ data: alumniData })
    console.log('Created alumni:', alumni)

    // Create two pekerjaan entries for each alumni
    const pekerjaan1 = await prisma.pekerjaanAlumni.create({ data: {
      alumniId: alumni.id,
      namaPerusahaan: u.id === 1 ? 'PT. Teknologi Nusantara' : 'CV. Solusi Digital',
      posisiJabatan: u.id === 1 ? 'Software Engineer' : 'Business Analyst',
      bidangIndustri: u.id === 1 ? 'Teknologi' : 'Konsultansi',
      lokasiKerja: 'Jakarta',
      gajiRange: u.id === 1 ? '5-8 juta' : '4-6 juta',
      tanggalMulaiKerja: new Date('2024-01-01'),
      statusPekerjaan: 'aktif',
      deskripsiPekerjaan: 'Bekerja pada pengembangan aplikasi web.'
    }})

    const pekerjaan2 = await prisma.pekerjaanAlumni.create({ data: {
      alumniId: alumni.id,
      namaPerusahaan: u.id === 1 ? 'PT. Cloud Solutions' : 'PT. Data Kreasindo',
      posisiJabatan: u.id === 1 ? 'DevOps Engineer' : 'Data Analyst',
      bidangIndustri: 'Teknologi',
      lokasiKerja: 'Bandung',
      gajiRange: '6-9 juta',
      tanggalMulaiKerja: new Date('2022-06-01'),
      tanggalSelesaiKerja: new Date('2023-12-31'),
      statusPekerjaan: 'selesai',
      deskripsiPekerjaan: 'Penempatan infrastruktur cloud dan automatisasi.'
    }})

    console.log('Created pekerjaan:', pekerjaan1.id, pekerjaan2.id)
    created.push({ alumni, pekerjaan: [pekerjaan1, pekerjaan2] })
  }

  console.log('Seeding alumni + pekerjaan complete. Summary:')
  console.log(JSON.stringify(created, null, 2))
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
