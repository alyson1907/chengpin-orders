import { createProductAvailabilitySchema } from '@/app/api/availability/validation-schemas'
import { middlewares, middlewaresWithoutAuth } from '@/app/api/common/apply-middlewares'
import { buildPrismaFilter, parseReq } from '@/app/api/common/helpers/request-parser'
import { NextRequest } from 'next/server'
import prisma from '../../../../prisma/prisma'
import { NotFoundError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { PaginationDto } from '@/app/api/common/types/common-response'
import { Prisma } from '@prisma/client'

const createAvailability = async (req: NextRequest) => {
  const { body } = await parseReq(req)
  const { productId, ...availability } = createProductAvailabilitySchema.parse(body)
  const product = await prisma.product.findFirst({ where: { id: productId } })
  if (!product)
    throw new NotFoundError(ErrorKey.MISSING_ENTITIES, productId, 'No product found to relate the availability')

  const created = await prisma.productAvailability.create({
    data: { ...availability, product: { connect: { id: productId } } },
    include: { product: true },
  })
  return created
}
const getAvailability = async (req: NextRequest) => {
  type TQueryResult = Prisma.ProductAvailabilityGetPayload<{ include: { product: true } }>
  const { qs } = await parseReq(req)
  const filter = buildPrismaFilter(qs)
  const total = await prisma.productAvailability.count()
  const result = await prisma.productAvailability.findMany({ ...filter, include: { product: true } })
  const paginationDto: PaginationDto<TQueryResult> = {
    entries: result,
    total,
    totalFiltered: result.length,
  }
  return paginationDto
}

const updateAvailability = async (req: NextRequest) => {}

export const POST = middlewares(createAvailability)
export const GET = middlewaresWithoutAuth(getAvailability)
export const PATCH = middlewares(updateAvailability)
