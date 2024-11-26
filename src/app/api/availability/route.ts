import {
  createProductAvailabilityBodySchema,
  deleteProductAvailabilityBodySchema,
  updateProductAvailabilityBodySchema,
} from '@/app/api/availability/validation-schemas'
import { middlewares, middlewaresWithoutAuth } from '@/app/api/common/apply-middlewares'
import { NotFoundError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { buildPrismaFilter, parseReq } from '@/app/api/common/helpers/request-parser'
import { PaginationDto } from '@/app/api/common/types/common-response'
import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'
import prisma from '../../../../prisma/prisma'

const availabilityInclude = { product: true }
const createAvailability = async (req: NextRequest) => {
  const { body } = await parseReq(req)
  const { productId, ...availability } = createProductAvailabilityBodySchema.parse(body)
  const product = await prisma.product.findFirst({ where: { id: productId } })
  if (!product)
    throw new NotFoundError(ErrorKey.MISSING_ENTITIES, productId, 'No product found to relate the availability')

  const created = await prisma.productAvailability.create({
    data: { ...availability, product: { connect: { id: productId } } },
    include: availabilityInclude,
  })
  return created
}
const getAvailability = async (req: NextRequest) => {
  type TQueryResult = Prisma.ProductAvailabilityGetPayload<{ include: { product: true } }>
  const { qs } = await parseReq(req)
  const filter = buildPrismaFilter(qs)
  const total = await prisma.productAvailability.count()
  const result = await prisma.productAvailability.findMany({ ...filter, include: availabilityInclude })
  const paginationDto: PaginationDto<TQueryResult> = {
    entries: result,
    total,
    totalFiltered: result.length,
  }
  return paginationDto
}

const updateAvailability = async (req: NextRequest) => {
  const { body } = await parseReq(req)
  const { availabilities } = updateProductAvailabilityBodySchema.parse(body)
  const found = await prisma.productAvailability.findMany({ where: { id: { in: availabilities.map(({ id }) => id) } } })
  const notFound = availabilities.filter((a) => !found.map(({ id }) => id).includes(a.id))
  if (notFound.length) throw new NotFoundError(ErrorKey.MISSING_ENTITIES, notFound)

  const updated = await prisma.$transaction(async (trx) => {
    const promises = availabilities.map((availability) =>
      trx.productAvailability.update({
        data: {
          name: availability.name,
          qty: availability.qty,
          price: availability.price,
        },
        where: { id: availability.id },
      })
    )
    const updated = await Promise.all(promises)
    return updated
  })
  return updated
}

const deleteAvailability = async (req: NextRequest) => {
  const { body } = await parseReq(req)
  const { availabilities } = deleteProductAvailabilityBodySchema.parse(body)
  const found = await prisma.productAvailability.findMany({ where: { id: { in: availabilities } } })
  const notFound = availabilities.filter((deleteId) => !found.map(({ id }) => id).includes(deleteId))
  if (notFound.length) throw new NotFoundError(ErrorKey.MISSING_ENTITIES, notFound)
  return prisma.productAvailability.deleteMany({ where: { id: { in: availabilities } } })
}

export const POST = middlewares(createAvailability)
export const GET = middlewaresWithoutAuth(getAvailability)
export const PUT = middlewares(updateAvailability)
export const DELETE = middlewares(deleteAvailability)
