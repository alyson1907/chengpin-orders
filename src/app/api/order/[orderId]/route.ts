import { middlewares } from '@/app/api/common/apply-middlewares'
import { BadRequestError, NotFoundError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { parseReq } from '@/app/api/common/helpers/request-parser'
import { NextRequest } from 'next/server'
import prisma from '../../../../../prisma/prisma'
import { updateOrderByIdBodySchema } from '@/app/api/order/validation-schemas'
import { RequestContext } from '@/app/api/common/types/request-context'
import { OrderStatus } from '@/app/api/order/order-status.enum'
import {
  filterItemsNotInAvailables,
  filterInsufficientStock,
  buildOrderItemsInsert,
  decrementStock,
  restock,
} from '@/app/api/order/order-helper'

const updateOrder = async (req: NextRequest, context: RequestContext) => {
  const { body, params } = await parseReq(req, context)
  const { orderId } = params
  const { orderItems: newOrderItems, ...customer } = updateOrderByIdBodySchema.parse(body)

  if (!orderId)
    throw new BadRequestError(ErrorKey.VALIDATION_ERROR_PATH_PARAMS, 'orderId', 'orderId is a required path params')
  const oldOrder = await prisma.order.findFirst({ where: { id: orderId }, include: { orderItems: true } })
  if (!oldOrder) throw new NotFoundError(ErrorKey.MISSING_ENTITIES, orderId, `No order with id ${orderId} was found`)
  if (oldOrder.status !== OrderStatus.DRAFT)
    throw new BadRequestError(
      ErrorKey.INVALID_OPERATION_DRAFT_ORDER,
      oldOrder,
      'Only orders with DRAFT status can be updated'
    )

  const notFound = await filterItemsNotInAvailables(newOrderItems)
  if (notFound.length)
    throw new NotFoundError(
      ErrorKey.MISSING_ENTITIES,
      notFound,
      'Not found compatible available items. Are these products for sale?'
    )

  const insufficientStockItems = await filterInsufficientStock(newOrderItems, oldOrder)
  if (insufficientStockItems.length)
    throw new BadRequestError(
      ErrorKey.AMOUNT_LIMIT,
      insufficientStockItems,
      'The buying amount is heigher than available in stock'
    )

  const updated = prisma.$transaction(async (trx) => {
    // Restocking
    const restockPromises = oldOrder.orderItems.map((item) => restock(trx, item.availabilityId, item.qty))
    await Promise.all(restockPromises)
    // Cleaning up old order items
    await trx.orderItems.deleteMany({ where: { orderId: oldOrder.id } })
    // Replacing new items in order
    const updatedOrder = await trx.order.update({
      where: { id: oldOrder.id },
      data: {
        ...customer,
        orderItems: {
          createMany: { data: await buildOrderItemsInsert(newOrderItems) },
        },
      },
      include: {
        orderItems: true,
      },
    })
    const updateStockPromises = newOrderItems.map((item) => decrementStock(trx, item.id, item.qty))
    await Promise.all(updateStockPromises)
    return updatedOrder
  })

  return updated
}

export const PATCH = middlewares(updateOrder)
