import { z } from 'zod'
import type { Context } from '../context'

const CreatePekerjaanInput = z.object({
  alumniId: z.number().int().positive(),
  namaPerusahaan: z.string().min(1),
  posisiJabatan: z.string().min(1),
  bidangIndustri: z.string().min(1),
  lokasiKerja: z.string().min(1),
  gajiRange: z.string().optional(),
  tanggalMulaiKerja: z.string().min(1),
  tanggalSelesaiKerja: z.string().optional(),
  statusPekerjaan: z.string().optional(),
  deskripsiPekerjaan: z.string().optional()
})

const pekerjaanResolver = {
  Query: {
    pekerjaanAlumnis: async (_: any, __: any, ctx: Context) => {
      return (ctx.prisma as any).pekerjaanAlumni.findMany({ orderBy: { id: 'asc' } })
    },
    pekerjaanAlumni: async (_: any, args: { id: number }, ctx: Context) => {
      return (ctx.prisma as any).pekerjaanAlumni.findUnique({ where: { id: args.id } })
    }
  },
  Mutation: {
    createPekerjaanAlumni: async (_: any, args: { input: any }, ctx: Context) => {
      const parsed = CreatePekerjaanInput.safeParse(args.input)
      if (!parsed.success) throw new Error('Invalid input: ' + JSON.stringify(parsed.error.flatten()))
      const data = parsed.data
      try {
  const p = await (ctx.prisma as any).pekerjaanAlumni.create({ data: { alumniId: data.alumniId, namaPerusahaan: data.namaPerusahaan, posisiJabatan: data.posisiJabatan, bidangIndustri: data.bidangIndustri, lokasiKerja: data.lokasiKerja, gajiRange: data.gajiRange, tanggalMulaiKerja: new Date(data.tanggalMulaiKerja), tanggalSelesaiKerja: data.tanggalSelesaiKerja ? new Date(data.tanggalSelesaiKerja) : undefined, statusPekerjaan: data.statusPekerjaan ?? 'aktif', deskripsiPekerjaan: data.deskripsiPekerjaan } })
        return p
      } catch (err: any) {
        ctx.logger.error({ err }, 'Failed to create pekerjaan alumni')
        throw new Error('Gagal membuat pekerjaan alumni')
      }
    }
  }
}

export default pekerjaanResolver
