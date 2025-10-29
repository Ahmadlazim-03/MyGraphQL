# MyGraphQL - GraphQL API (Next.js + GraphQL Yoga + Prisma)

Deskripsi singkat (Bahasa Indonesia):

- Backend GraphQL modular menggunakan Next.js API Routes (serverless) + GraphQL Yoga.
- ORM: Prisma; Database: PostgreSQL (Railway).
- Input validation: Zod.
- Logging: Pino.

Fitur minimal: Demo CRUD User (query users, user, mutation createUser).

Persyaratan
- Node.js 18+ (disarankan)
- PostgreSQL (Railway) — gunakan DATABASE_URL di `.env`.

Quickstart (lokal)

1) Salin `.env.example` menjadi `.env` dan sesuaikan jika perlu.

2) Install dependency:

```powershell
npm install
```

3) Generate Prisma client & migrate:

```powershell
npm run prisma:generate
npm run migrate
```

4) Jalankan dev server:

```powershell
npm run dev
```

GraphQL playground tersedia di http://localhost:3000/api/graphql (hanya di mode development).

Contoh query

Query semua user:

```graphql
query {
  users {
    id
    name
    email
    createdAt
  }
}
```

Mutation buat user:

```graphql
mutation {
  createUser(name: "Budi", email: "budi@example.com") {
    id
    name
    email
  }
}
```

Catatan penting arsitektur

- Prisma singleton pattern (lihat `src/lib/prisma.ts`) mencegah kebocoran koneksi pada environment serverless.
- Context GraphQL (`src/graphql/context.ts`) menginjeksi `prisma` dan `logger` ke resolver.
- Schema dipecah per fitur (`src/graphql/schema/*.graphql`) dan resolvers per fitur (`src/graphql/resolvers/*`).
- Validasi input dilakukan menggunakan Zod di resolver.

Deploy ke Vercel

1) Push repo ke GitHub.
2) Buat project di Vercel, pilih repository.
3) Tambahkan Environment Variable `DATABASE_URL` di Settings Project di Vercel.
4) Deploy — Vercel akan menjalankan `npm run build`.

Tips performa & kehandalan

- Pastikan `DATABASE_URL` dari Railway mendukung koneksi serverless (perhatikan pool & proxy). Kami menggunakan Prisma singleton untuk meminimalkan koneksi berlebih.
- Untuk traffic tinggi, pertimbangkan connection pooling atau secondary database layer.

Next steps / Pengembangan lebih jauh

- Tambah DataLoader untuk N+1 problem.
- Pisah schema menjadi modul lebih banyak saat fitur bertambah.
- Tambah test unit/integration untuk resolver.

--
Arsitek Backend
