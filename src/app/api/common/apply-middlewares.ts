import { authMiddleware } from '@/app/api/common/auth/auth-middleware'
import { errorsMiddleware } from '@/app/api/common/error/error-handler-middleware'
import { NextRequest } from 'next/server'

const isAuthDisabled = process.env.AUTH_DISABLED?.toLowerCase() === 'true'
export const middlewares = (handler: (req: NextRequest, context: any) => Promise<any> | undefined) => {
  if (isAuthDisabled) return middlewaresWithoutAuth(handler)
  return errorsMiddleware(authMiddleware(handler))
}

export const middlewaresWithoutAuth = (handler: (req: NextRequest, context: any) => Promise<any> | undefined) => {
  return errorsMiddleware(handler)
}
