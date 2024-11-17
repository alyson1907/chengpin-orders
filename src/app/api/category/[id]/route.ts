import { NextRequest } from 'next/server'
import { HttpStatus } from '@/app/api/common/enum/http-status.enum'
import prisma from '../../../../../prisma/prisma'
import { deleteCategoryParamSchema } from '@/app/api/category/validation-schemas'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { ResponseBuilder } from '@/app/api/common/helpers/response-builder'
import { parseReq } from '@/app/api/common/helpers/request-parser'
import { RequestContext } from '@/app/api/common/types/request-context'
import { middlewares } from '@/app/api/common/apply-middlewares'

const deleteCategory = async (req: NextRequest, context: RequestContext) => {
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

export const DELETE = middlewares(deleteCategory)
