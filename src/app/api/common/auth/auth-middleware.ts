import { NextRequest } from 'next/server'
import { UnauthorizedError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import jwtModule from '@/app/api/common/auth/jwt'
import clsModule from '@/app/api/common/cls'

export const authMiddleware = (handler: (req: NextRequest, context: any) => Promise<any> | undefined) => {
  return (req: NextRequest, context: any) => {
    const token = req.headers.get('Authorization')?.split('Bearer').pop()?.trim() || ''
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
