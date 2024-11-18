import { middlewares } from '@/app/api/common/apply-middlewares'
import { BadRequestError, NotFoundError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { parseReq } from '@/app/api/common/helpers/request-parser'
import { NextRequest } from 'next/server'
import prisma from '../../../../../prisma/prisma'
import { updateOrderByIdBodySchema } from '@/app/api/order/validation-schemas'
import { RequestContext } from '@/app/api/common/types/request-context'
import { OrderStatus } from '@/app/api/order/order-status.enum'
import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

type TPrismaTrx = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>
const findAvailables = async (orderItems: { id: string; qty: number }[]) => {
  return prisma.productAvailability.findMany({
    where: { id: { in: orderItems.map(({ id }) => id) } },
    include: { product: true },
  })
}
const filterItemsNotInAvailables = async (orderItems: { id: string; qty: number }[]) => {
  const currentAvailables = await findAvailables(orderItems)
  return orderItems.filter((b) => !currentAvailables.some((ca) => ca.id === b.id))
}

const filterInsufficientStock = async (orderItems: { id: string; qty: number }[], order: any) => {
  const currentAvailables = await findAvailables(orderItems)
  return orderItems.filter((b) => {
    const newQty = b.qty
    const currentlyInOrderQty = order.orderItems.find((orderItem) => orderItem.availabilityId === b.id)?.qty || 0
    const availableQty = currentAvailables.find((ca) => ca.id === b.id)?.qty || 0
    return newQty > availableQty + currentlyInOrderQty
  })
}

const buildOrderItemsInsert = async (newOrderItems: { id: string; qty: number }[]) => {
  const currentAvailables = await findAvailables(newOrderItems)
  return currentAvailables.map((item) => {
    const buyingQty = newOrderItems.find((a) => a.id === item.id)?.qty
    if (!buyingQty) throw new BadRequestError(ErrorKey.UNEXPECTED_ERROR, undefined, 'Wrong buying amount')
    return {
      availabilityId: item.id,
      availabilityName: item.name,
      productId: item.productId,
      productName: item.product?.name,
      qty: buyingQty,
      price: item.price,
    }
  })
}

const restock = async (trx: TPrismaTrx, productAvailabilityId: string, addQty: number) => {
  const productAvailability = await trx.productAvailability.findFirst({ where: { id: productAvailabilityId } })
  return trx.productAvailability.update({
    where: { id: productAvailability?.id },
    data: { qty: (productAvailability?.qty || 0) + addQty },
  })
}

const decrementStock = async (trx: TPrismaTrx, productAvailabilityId: string, decrementQty: number) => {
  const productAvailability = await trx.productAvailability.findFirst({ where: { id: productAvailabilityId } })
  return trx.productAvailability.update({
    where: { id: productAvailability?.id },
    data: { qty: (productAvailability?.qty || 0) - decrementQty },
  })
}

const updateOrder = async (req: NextRequest, context: RequestContext) => {
  const { body, params } = await parseReq(req, context)
  const { orderId } = params
  const { orderItems: newOrderItems, ...customer } = updateOrderByIdBodySchema.parse(body)

  if (!orderId)
    throw new BadRequestError(ErrorKey.VALIDATION_ERROR_PATH_PARAMS, 'orderId', 'orderId is a required path params')
  const oldOrder = await prisma.order.findFirst({ where: { id: orderId }, include: { orderItems: true } })
  if (!oldOrder) throw new NotFoundError(ErrorKey.MISSING_ENTITIES, orderId, `No order with id ${orderId} was found`)
  if (oldOrder.status !== OrderStatus.DRAFT)
    throw new BadRequestError(ErrorKey.INVALID_OPERATION, oldOrder, 'Only orders with DRAFT status can be updated')

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
      ErrorKey.UNAVAILABLE_RESOURCE,
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
