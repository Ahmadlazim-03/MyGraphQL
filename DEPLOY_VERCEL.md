PANDUAN DEPLOY KE VERCEL (Next.js + GraphQL Yoga + Prisma)

Dokumentasi ini menjelaskan langkah-langkah untuk mendeploy aplikasi GraphQL (Next.js API Route + GraphQL Yoga + Prisma) ke Vercel dengan aman.

1) PRASYARAT

- Repo sudah berisi Next.js API route untuk GraphQL dan file prisma/schema.prisma.
- Commit terbaru sudah dipush ke GitHub.

2) ENVIRONMENT VARIABLES DI VERCEL (WAJIB)

- Tambahkan DATABASE_URL di Vercel Project Settings.
- Opsional: LOG_LEVEL=info

Contoh (PowerShell):
  npx vercel login
  npx vercel env add DATABASE_URL production

Catatan: jangan commit .env ke repo.

3) PASTIKAN PRISMA CLIENT DIGENERATE SAAT BUILD

Tambahkan ke package.json scripts:
  "postinstall": "prisma generate",
  "vercel-build": "prisma generate && next build"

4) BUILD COMMAND DI VERCEL

Opsi:
- Jika postinstall ada: gunakan default npm run build.
- Atau set Build Command ke: npm run vercel-build
- Alternatif: prisma generate && next build

5) MIGRATE DATABASE (production-safe)

Gunakan perintah:
  npx prisma migrate deploy

Jangan gunakan prisma migrate dev di production.

6) CONTOH GITHUB ACTIONS (jalankan migrasi sebelum deploy)

File: .github/workflows/prisma-migrate.yml
Isi singkat:
  name: Run Prisma Migrations
  on: push: branches: [ main ]
  jobs:
    migrate:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4 with: node-version: '18'
        - run: npm ci
        - name: Generate Prisma Client
          env: DATABASE_URL: ${{ secrets.DATABASE_URL }}
          run: npx prisma generate
        - name: Run migrations
          env: DATABASE_URL: ${{ secrets.DATABASE_URL }}
          run: npx prisma migrate deploy

Simpan DATABASE_URL sebagai GitHub secret.

7) DEPLOY MANUAL VIA VERCEL CLI

PowerShell:
  npx vercel login
  npx vercel --prod

8) TROUBLESHOOTING & TIPS PRODUKSI

- Jika @prisma/client missing: pastikan prisma generate dijalankan saat build.
- Jika koneksi DB gagal: periksa DATABASE_URL dan akses network dari Vercel ke Railway.
- Too many connections: pertimbangkan Prisma Data Proxy atau PgBouncer.
- Pastikan node_modules dan .next tidak pernah dikomit (gunakan .gitignore).

9) VERIFIKASI SETELAH DEPLOY

- Cek logs build di Vercel Dashboard.
- Buka https://your-app.vercel.app/api/graphql untuk menguji endpoint.

Jika anda ingin, saya dapat menambahkan postinstall/vercel-build ke package.json dan membuat workflow GitHub Actions. Beri tahu pilihan Anda.
