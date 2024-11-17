import { NotFoundError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { middlewares } from '@/app/api/common/apply-middlewares'
import clsModule from '@/app/api/common/cls'
import prisma from '../../../../../prisma/prisma'

const getMe = async () => {
  const contextUser = clsModule.getUser()
  const user = await prisma.user.findFirst({
    where: { id: contextUser.id },
    include: { userRoles: { include: { role: true } } },
  })
  if (!user) throw new NotFoundError(ErrorKey.AUTH_INVALID_TOKEN, user, 'No user found')
  const rawUser: any = { ...user }
  delete rawUser.password
  return rawUser
}

export const GET = middlewares(getMe)
