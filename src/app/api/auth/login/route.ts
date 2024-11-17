import { NextRequest } from 'next/server'
import jwt, { TokenContent } from '@/app/api/common/auth/jwt'
import prisma from '../../../../../prisma/prisma'
import { NotFoundError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { parseReq } from '@/app/api/common/helpers/request-parser'
import { middlewares, middlewaresWithoutAuth } from '@/app/api/common/apply-middlewares'
import clsModule from '@/app/api/common/cls'

const login = async (req: NextRequest) => {
  const { body } = await parseReq(req)
  const user = await prisma.user.findFirst({
    where: { username: body.username, password: body.password },
    include: { userRoles: { include: { role: true } } },
  })
  if (!user)
    throw new NotFoundError(ErrorKey.AUTH_INVALID_CREDENTIALS, { username: body.username, password: body.password })
  const tokenContent: TokenContent = {
    ...user,
    roles: user.userRoles?.map((userRole) => userRole.role),
  }

  const token = jwt.createToken(tokenContent)
  return token
}

const getMe = async () => {
  const user = clsModule.get('user')
  if (!user) throw new NotFoundError(ErrorKey.AUTH_INVALID_TOKEN, null, 'No user found')
  return user
}

export const POST = middlewaresWithoutAuth(login)
export const GET = middlewares(getMe)
