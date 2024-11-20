import { NextRequest, NextResponse } from 'next/server'
import jwt, { TokenContent } from '@/app/api/common/auth/jwt'
import prisma from '../../../../../prisma/prisma'
import { BadRequestError, NotFoundError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { parseReq } from '@/app/api/common/helpers/request-parser'
import { middlewares, middlewaresWithoutAuth } from '@/app/api/common/apply-middlewares'
import clsModule from '@/app/api/common/cls'
import { serialize } from 'cookie'
import { HttpStatus } from '@/app/api/common/enum/http-status.enum'
import { AuthCookieKeys } from '@/app/api/common/enum/auth-cookie-keys.enum'

const login = async (req: NextRequest) => {
  const { body } = await parseReq(req)
  const user = await prisma.user.findFirst({
    where: { username: body.username },
    include: { userRoles: { include: { role: true } } },
  })
  if (!user) throw new NotFoundError(ErrorKey.NOT_FOUND_USER, { username: body.username }, 'User does not exist')
  if (!jwt.validatePassword(user, body.password))
    throw new BadRequestError(ErrorKey.AUTH_INVALID_CREDENTIALS, { username: body.username, password: body.password })

  const tokenContent: TokenContent = {
    ...user,
    roles: user.userRoles?.map((userRole) => userRole.role),
  }
  const token = jwt.createToken(tokenContent)
  const serialized = serialize(AuthCookieKeys.TOKEN, token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30 * 12,
    path: '/',
  })
  return new NextResponse(JSON.stringify('Authenticated!'), {
    status: HttpStatus.OK,
    headers: {
      'Set-Cookie': serialized,
    },
  })
}

const getMe = async () => {
  const user = clsModule.get('user')
  if (!user) throw new NotFoundError(ErrorKey.AUTH_INVALID_TOKEN, null, 'No user found')
  return user
}

export const POST = middlewaresWithoutAuth(login)
export const GET = middlewares(getMe)
