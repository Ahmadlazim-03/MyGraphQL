import { z } from 'zod'
import type { Context } from '../context'

const CreateMahasiswaInput = z.object({
  nim: z.string().min(1),
  nama: z.string().min(1),
  jurusan: z.string().min(1),
  angkatan: z.number().int().positive(),
  email: z.string().email()
})

const mahasiswaResolver = {
  Query: {
    mahasiswas: async (_: any, __: any, ctx: Context) => {
      return (ctx.prisma as any).mahasiswa.findMany({ orderBy: { id: 'asc' } })
    },
    mahasiswa: async (_: any, args: { id: number }, ctx: Context) => {
      return (ctx.prisma as any).mahasiswa.findUnique({ where: { id: args.id } })
    }
  },
  Mutation: {
    createMahasiswa: async (_: any, args: { input: any }, ctx: Context) => {
      const parsed = CreateMahasiswaInput.safeParse(args.input)
      if (!parsed.success) throw new Error('Invalid input: ' + JSON.stringify(parsed.error.flatten()))
      const data = parsed.data
      try {
  const m = await (ctx.prisma as any).mahasiswa.create({ data: { nim: data.nim, nama: data.nama, jurusan: data.jurusan, angkatan: data.angkatan, email: data.email } })
        return m
      } catch (err: any) {
        ctx.logger.error({ err }, 'Failed to create mahasiswa')
        throw new Error('Gagal membuat mahasiswa')
      }
    }
  }
}

export default mahasiswaResolver
