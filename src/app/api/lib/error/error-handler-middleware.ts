import { ErrorKey } from '@/app/api/lib/error/errors.enum'
import { HttpStatus } from '@/app/api/lib/enum/http-status.enum'
import { BadRequestError, NotFoundError } from '@/app/api/lib/error/common-errors'
import { ResponseBuilder } from '@/app/api/lib/helpers/response-builder'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PrismaClientValidationError } from '@prisma/client/runtime/library'

export const errorsMiddleware = (handler: (req: NextRequest, context: any) => Promise<any> | undefined) => {
  return async (req: NextRequest, context: any) => {
    try {
      const result = await handler(req, context)
      if (result instanceof NextResponse) return result
      return new ResponseBuilder().data(result).build()
    } catch (error) {
      console.error(error)
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
