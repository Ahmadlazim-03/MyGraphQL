import { z } from 'zod'
import type { Context } from '../context'

const CreateAlumniInput = z.object({
  userId: z.number().int().positive(),
  nim: z.string().min(1),
  nama: z.string().min(1),
  jurusan: z.string().min(1),
  angkatan: z.number().int().positive(),
  tahunLulus: z.number().int().positive(),
  noTelepon: z.string().optional(),
  alamat: z.string().optional()
})

const alumniResolver = {
  Query: {
    alumnis: async (_: any, __: any, ctx: Context) => {
      return (ctx.prisma as any).alumni.findMany({ orderBy: { id: 'asc' } })
    },
    alumni: async (_: any, args: { id: number }, ctx: Context) => {
      return (ctx.prisma as any).alumni.findUnique({ where: { id: args.id }, include: { pekerjaans: true } })
    }
  },
  Mutation: {
    createAlumni: async (_: any, args: { input: any }, ctx: Context) => {
      const parsed = CreateAlumniInput.safeParse(args.input)
      if (!parsed.success) throw new Error('Invalid input: ' + JSON.stringify(parsed.error.flatten()))
      const data = parsed.data
      try {
  const a = await (ctx.prisma as any).alumni.create({ data: { userId: data.userId, nim: data.nim, nama: data.nama, jurusan: data.jurusan, angkatan: data.angkatan, tahunLulus: data.tahunLulus, noTelepon: data.noTelepon, alamat: data.alamat } })
        return a
      } catch (err: any) {
        ctx.logger.error({ err }, 'Failed to create alumni')
        throw new Error('Gagal membuat alumni')
      }
    }
  }
}

export default alumniResolver
