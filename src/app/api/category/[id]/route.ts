import { NextRequest } from 'next/server'
import { HttpStatus } from '@/app/api/lib/enum/http-status.enum'
import prisma from '../../../../../prisma/prisma'
import { deleteCategoryParamSchema } from '@/app/api/category/validation-schemas'
import { ErrorKey } from '@/app/api/lib/error/errors.enum'
import { ResponseBuilder } from '@/app/api/lib/helpers/response-builder'
import { parseReq } from '@/app/api/lib/helpers/request-parser'
import { errorsMiddleware } from '@/app/api/lib/error/error-handler-middleware'
import { RequestContext } from '@/app/api/lib/types/request-context'

const deleteCategory = async (req: NextRequest, context: RequestContext) => {
  console.log(context)
  console.log(context.constructor.name)

  const { params: pathParams } = await parseReq(req, context)
  const validated = deleteCategoryParamSchema.safeParse(pathParams)
  if (!validated.success)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(ErrorKey.VALIDATION_ERROR_PATH_PARAMS)
      .data(validated.error)
      .build()

  const { data: params } = validated
  const deleted = await prisma.category.deleteMany({ where: { id: params.id } })
  if (!deleted.count)
    return new ResponseBuilder().status(HttpStatus.NOT_FOUND).message(`Not Found category with id ${params.id}`).build()
  return new ResponseBuilder().data(deleted).build()
}

export const DELETE = errorsMiddleware(deleteCategory)
