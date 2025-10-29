import { z } from 'zod'
import type { Context } from '../context'

// Zod schema untuk memastikan input bersih
const CreateUserInput = z.object({
  name: z.string().min(1),
  email: z.string().email()
})

const userResolver = {
  Query: {
    users: async (_: any, __: any, ctx: Context) => {
      ctx.logger.debug('Fetching all users')
      return ctx.prisma.user.findMany({ orderBy: { id: 'asc' } })
    },
    user: async (_: any, args: { id: number }, ctx: Context) => {
      ctx.logger.debug({ id: args.id }, 'Fetching user by id')
      return ctx.prisma.user.findUnique({ where: { id: args.id } })
    }
  },
  Mutation: {
    createUser: async (_: any, args: { name: string; email: string }, ctx: Context) => {
      // Validasi input dengan zod
      const parsed = CreateUserInput.safeParse(args)
      if (!parsed.success) {
        // Bubuhkan pesan kesalahan yang jelas
        throw new Error('Invalid input: ' + JSON.stringify(parsed.error.flatten()))
      }

      const { name, email } = parsed.data
      try {
        ctx.logger.info({ email }, 'Creating new user')
        const user = await ctx.prisma.user.create({ data: { name, email } })
        return user
      } catch (err: any) {
        // Tangani unique constraint error dari Prisma
        if (err?.code === 'P2002') {
          throw new Error('Email sudah terdaftar')
        }
        ctx.logger.error({ err }, 'Failed to create user')
        throw new Error('Gagal membuat user')
      }
    }
  }
}

export default userResolver
