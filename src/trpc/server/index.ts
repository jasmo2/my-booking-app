import { prisma } from '@/db/prisma'
import { Role } from '@/utils/types'
import { auth } from '@clerk/nextjs/server'
import { initTRPC, TRPCError } from '@trpc/server'
import { authorizeUser } from './utils'

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth()

  return {
    db: prisma,
    session,
    ...opts,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create()

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = (...roles: Role[]) =>
  publicProcedure.use(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })
    }

    await authorizeUser(ctx.session.userId, roles)

    return next({ ctx })
  })
