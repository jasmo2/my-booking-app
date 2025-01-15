import { Role } from '@/utils/types'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/db/prisma'

const getUserRoles = async (id: string): Promise<Role[]> => {
  const [adminExist, managerExist] = await Promise.all([
    prisma.admin.findUnique({ where: { id } }),
    prisma.manager.findUnique({ where: { id } }),
  ])

  const roles: Role[] = []
  if (adminExist) {
    roles.push('admin')
  }
  if (managerExist) {
    roles.push('manager')
  }
  return roles
}

export const authorizeUser = async (
  userId: string,
  roles: Role[],
): Promise<void> => {
  if (!roles || roles.length === 0) {
    return
  }
  const userRoles = await getUserRoles(userId)

  if (!roles.some((role) => userRoles.includes(role))) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User does not have the required role(s)',
    })
  }
}
