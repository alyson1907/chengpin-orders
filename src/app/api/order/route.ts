import { middlewares, middlewaresWithoutAuth } from '@/app/api/common/apply-middlewares'
import dayjs from '@/app/api/common/dayjs'
import { BadRequestError, NotFoundError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { buildPrismaFilter, parseReq } from '@/app/api/common/helpers/request-parser'
import { PaginationDto } from '@/app/api/common/types/common-response'
import {
  buildOrderItemsInsert,
  filterInsufficientStock,
  filterItemsNotInAvailables,
  findAvailables,
} from '@/app/api/order/order-helper'
import { OrderStatus } from '@/app/api/order/order-status.enum'
import { createOrderBodySchema } from '@/app/api/order/validation-schemas'
import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'
import prisma from '../../../../prisma/prisma'

const createOrder = async (req: NextRequest) => {
  const { body } = await parseReq(req)
  const { orderItems, deliveryDate, commercialDate, ...customer } = createOrderBodySchema.parse(body)

  const notFound = await filterItemsNotInAvailables(orderItems)
  if (notFound.length)
    throw new NotFoundError(
      ErrorKey.MISSING_ENTITIES,
      notFound,
      'Not found compatible available items. Are these products for sale?'
    )

  const insufficientStockItems = await filterInsufficientStock(orderItems)
  if (insufficientStockItems.length)
    throw new BadRequestError(
      ErrorKey.AMOUNT_LIMIT,
      insufficientStockItems,
      'The buying amount is heigher than available in stock'
    )

  const currentAvailables = await findAvailables(orderItems)
  const orderInsert = {
    status: OrderStatus.DRAFT,
    deliveryDate: dayjs.utc(deliveryDate).toDate(),
    commercialDate: dayjs.utc(commercialDate).toDate(),
    customerKey: customer.customerKey,
    customerName: customer.customerName,
    customerPhone: customer.customerPhone,
  }

  const orderItemsInsert = await buildOrderItemsInsert(orderItems)
  const created = prisma.$transaction(async (trx) => {
    // Create Order
    const createdOrders = await trx.order.create({
      data: {
        ...orderInsert,
        orderItems: {
          createMany: {
            data: orderItemsInsert,
          },
        },
      },
      include: { orderItems: true },
    })

    // Decrement Stock
    const updatePromises = currentAvailables.map((item) => {
      const boughtQty = orderItemsInsert.find((b) => b.availabilityId === item.id)?.qty || 0
      return trx.productAvailability.update({ where: { id: item.id }, data: { qty: item.qty - boughtQty } })
    })
    await Promise.all(updatePromises)
    return createdOrders
  })
  return created
}

const getOrders = async (req: NextRequest) => {
  const { qs } = await parseReq(req)
  const { skip, take, ...filter } = buildPrismaFilter(qs)
  const total = await prisma.order.count()
  const totalFiltered = await prisma.order.count(filter)
  type TQueryResult = Prisma.OrderGetPayload<{ include: { orderItems: true } }>
  const result: TQueryResult[] = await prisma.order.findMany({ ...filter, skip, take, include: { orderItems: true } })
  const response: PaginationDto<TQueryResult> = {
    entries: result,
    total,
    totalFiltered,
  }
  return response
}

export const POST = middlewaresWithoutAuth(createOrder)
export const GET = middlewares(getOrders)
