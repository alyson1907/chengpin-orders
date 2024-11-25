import { AuthCookieKeys } from '@/app/api/common/auth/auth-cookie-keys.enum'
import jwtModule from '@/app/api/common/auth/jwt'
import clsModule from '@/app/api/common/cls'
import { UnauthorizedError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { NextRequest } from 'next/server'

export const authMiddleware = (handler: (req: NextRequest, context: any) => Promise<any> | undefined) => {
  return (req: NextRequest, context: any) => {
    const token = req.cookies.get(AuthCookieKeys.TOKEN)?.value || ''
    const decoded = jwtModule.validateToken(token)
    if (!decoded) throw new UnauthorizedError(ErrorKey.AUTH_INVALID_TOKEN)
    let result: any
    clsModule.getNamespace().run(() => {
      clsModule.setUser(decoded)
      result = handler(req, context)
    })
    return result
  }
}
