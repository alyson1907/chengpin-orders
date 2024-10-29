import { ErrorKey } from '@/app/api/lib/error/errors.enum'
import { HttpStatus } from '@/app/api/lib/enum/http-status.enum'
import { BadRequestError } from '@/app/api/lib/error/common-errors'
import { ResponseBuilder } from '@/app/api/lib/helpers/response-builder'
import { PrismaClientValidationError } from '@prisma/client/runtime/library'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const errorsMiddleware = (handler: (req: NextRequest, res: NextResponse) => Promise<any> | undefined) => {
  return async (req: NextRequest, res: NextResponse) => {
    try {
      const result = await handler(req, res)
      return result
    } catch (error) {
      console.error(error)
      return handleErrors(error)
    }
  }
}

const handleErrors = (error: any) => {
  console.error('\n\n[handleErrors] class name: ', new Date(), error?.constructor?.name)

  if (error instanceof BadRequestError)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(error?.errorKey)
      .message(error?.message)
      .data(error?.data)
      .build()
  if (error instanceof ZodError)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(ErrorKey.SCHEMA_VALIDATION_ERROR)
      .data(error.errors)
      .build()
  return new ResponseBuilder().status(500).errorKey(ErrorKey.UNEXPECTED_ERROR).data(error).build()
}
