import { z } from 'zod'
import type { Context } from '../context'

const CreateFileInput = z.object({
  fileName: z.string().min(1),
  originalName: z.string().optional(),
  filePath: z.string().min(1),
  fileSize: z.number().int().nonnegative(),
  fileType: z.string().optional()
})

const fileResolver = {
  Query: {
    files: async (_: any, __: any, ctx: Context) => {
      return (ctx.prisma as any).file.findMany({ orderBy: { id: 'asc' } })
    },
    file: async (_: any, args: { id: number }, ctx: Context) => {
      return (ctx.prisma as any).file.findUnique({ where: { id: args.id } })
    }
  },
  Mutation: {
    createFile: async (_: any, args: { input: any }, ctx: Context) => {
      const parsed = CreateFileInput.safeParse(args.input)
      if (!parsed.success) throw new Error('Invalid input: ' + JSON.stringify(parsed.error.flatten()))
      const data = parsed.data
      try {
  const f = await (ctx.prisma as any).file.create({ data: { fileName: data.fileName, originalName: data.originalName, filePath: data.filePath, fileSize: data.fileSize, fileType: data.fileType } })
        return f
      } catch (err: any) {
        ctx.logger.error({ err }, 'Failed to create file')
        throw new Error('Gagal membuat file')
      }
    }
  }
}

export default fileResolver
