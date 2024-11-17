import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { HttpStatus } from '@/app/api/common/enum/http-status.enum'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/app/api/common/error/common-errors'
import { ResponseBuilder } from '@/app/api/common/helpers/response-builder'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PrismaClientValidationError } from '@prisma/client/runtime/library'
import { JsonWebTokenError } from 'jsonwebtoken'

type ReqHandlerResponse = Promise<any> | NextResponse | undefined
type Middleware = (req: NextRequest, context: any) => Promise<any>

export const errorsMiddleware = (handler: (req: NextRequest, context: any) => ReqHandlerResponse | Middleware) => {
  return async (req: NextRequest, context: any) => {
    try {
      const result = await handler(req, context)
      if (result instanceof NextResponse) return result
      return new ResponseBuilder().data(result).build()
    } catch (error) {
      return handleErrors(error)
    }
  }
}

const handleErrors = (error: any) => {
  console.error('\n\n[handleErrors] class name: ', new Date(), error?.constructor?.name)
  console.log(error)
  if (error instanceof BadRequestError)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(error?.errorKey)
      .message(error?.message)
      .data(error?.data)
      .build()
  if (error instanceof NotFoundError)
    return new ResponseBuilder()
      .status(HttpStatus.NOT_FOUND)
      .errorKey(error?.errorKey)
      .message(error?.message)
      .data(error?.data)
      .build()

  if (error instanceof UnauthorizedError)
    return new ResponseBuilder().status(HttpStatus.UNAUTHORIZED).errorKey(error.errorKey).message(error.message).build()

  if (error instanceof JsonWebTokenError)
    return new ResponseBuilder()
      .status(HttpStatus.UNAUTHORIZED)
      .errorKey(ErrorKey.AUTH_INVALID_TOKEN)
      .message(error.message)
      .build()

  if (error instanceof PrismaClientValidationError)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(ErrorKey.SCHEMA_VALIDATION_ERROR)
      .data({
        ...error,
        stack: error?.stack,
        cause: error?.cause,
      })
      .build()
  if (error instanceof ZodError)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(ErrorKey.SCHEMA_VALIDATION_ERROR)
      .data(error.errors)
      .build()
  return new ResponseBuilder().status(500).errorKey(ErrorKey.UNEXPECTED_ERROR).data(error).build()
}
