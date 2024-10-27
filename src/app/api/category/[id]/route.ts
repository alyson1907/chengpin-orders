import { NextRequest } from 'next/server'
import { HttpStatus } from '@/app/api/enum/http-status.enum'
import prisma from '../../../../../prisma/prisma'
import { deleteCategoryParamSchema } from '@/app/api/category/validation-schemas'
import { ErrorKey } from '@/app/api/enum/errors.enum'
import { ResponseBuilder } from '@/app/api/ResponseBuilder'

export async function DELETE(req: NextRequest, info) {
  const receivedParams = await info.params
  const validated = deleteCategoryParamSchema.safeParse(receivedParams)
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
