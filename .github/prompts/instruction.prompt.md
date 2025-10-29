---
mode: agent
---
Kamu adalah seorang arsitek backend senior dengan pengalaman membangun sistem GraphQL berskala besar.  
Tugasmu adalah membuat **arsitektur backend GraphQL** yang:

✅ Scalable (mudah dikembangkan & di-scale)
✅ Maintainable (struktur modular & bersih)
✅ Optimal untuk kecepatan (minim overhead, cepat diakses)
✅ Dapat terhubung dengan PostgreSQL dari Railway
✅ Dapat dideploy di Vercel sebagai serverless API

---

### ⚙️ Kebutuhan Teknis

**Stack utama:**
- Framework: Next.js (hanya untuk API Routes serverless)
- GraphQL Engine: GraphQL Yoga (lebih ringan & cepat dibanding Apollo di Vercel)
- ORM: Prisma
- Database: PostgreSQL (dari Railway)
- Bahasa: TypeScript
- Deployment: Vercel
- Tools tambahan:
  - `zod` untuk validasi input
  - `graphql-codegen` untuk type generation (optional)
  - `dotenv` untuk manajemen environment
  - `pino` untuk logging ringan dan cepat

---

### 🧩 Fitur Minimal (Demo CRUD User)

Buat entitas `User` dengan field:
id Int (primary key, autoincrement)
name String
email String (unique)
createdAt DateTime (default now)


#### GraphQL API:
- Query:
  - `users`: ambil semua user
  - `user(id: Int!)`: ambil user by ID
- Mutation:
  - `createUser(name: String!, email: String!)`: buat user baru

---

### 🧱 Struktur Folder (wajib modular & maintainable)
Gunakan struktur modern dan mudah di-scale:
 
my-graphql-api/
├─ prisma/
│ └─ schema.prisma
├─ src/
│ ├─ graphql/
│ │ ├─ schema/
│ │ │ └─ user.graphql
│ │ ├─ resolvers/
│ │ │ └─ user.resolver.ts
│ │ ├─ context.ts
│ │ ├─ schema.ts
│ │ └─ index.ts
│ ├─ lib/
│ │ ├─ prisma.ts
│ │ └─ logger.ts
│ └─ pages/
│ └─ api/
│ └─ graphql.ts
├─ .env.example
├─ package.json
├─ tsconfig.json
└─ README.md


---

### 💡 Ketentuan Arsitektur

1. **Pisahkan schema dan resolver per fitur** → mudah dikembangkan.
2. **Gunakan Prisma singleton pattern** agar koneksi tidak bocor di serverless.
3. **Gunakan context GraphQL** untuk inject dependensi (misal Prisma, logger).
4. **Aktifkan caching** bila memungkinkan (contoh `dataloader` / Prisma cache layer).
5. **Gunakan lazy import resolver** agar startup lebih cepat di Vercel.
6. **Gunakan Zod untuk validasi** input mutation agar tidak ada data kotor.
7. **Logging cepat dan ringkas** via `pino`.
8. **Tambahkan script build & start** agar bisa dijalankan lokal & di Railway.
9. **Tambahkan contoh `.env.example`** untuk konfigurasi `DATABASE_URL`.
10. **README lengkap** berisi cara setup, migrasi, dan deploy ke Vercel.

---

### 📦 Output yang Diharapkan
Hasilkan semua file berikut dengan isi kode lengkap:
- `package.json`
- `prisma/schema.prisma`
- `src/lib/prisma.ts`
- `src/lib/logger.ts`
- `src/graphql/schema/user.graphql`
- `src/graphql/resolvers/user.resolver.ts`
- `src/graphql/schema.ts`
- `src/graphql/context.ts`
- `src/pages/api/graphql.ts`
- `.env.example`
- `README.md`

---

### 🚀 Tujuan Akhir
Kode harus:
- Siap deploy di **Vercel** langsung
- Dapat dijalankan lokal dengan `npm run dev`
- Memiliki kecepatan tinggi (optimasi koneksi DB & cold start)
- Mudah dikembangkan (modular dan clean)
- Aman dari masalah koneksi serverless ke PostgreSQL (gunakan singleton pattern)

---

### ✨ Output Format
- Tampilkan semua file secara terpisah (nama file + isi)
- Gunakan komentar penting di tiap bagian kode
- Gunakan bahasa Indonesia dalam penjelasan
- Pastikan kodenya **clean, production-ready, scalable, maintainable, dan cepat**
