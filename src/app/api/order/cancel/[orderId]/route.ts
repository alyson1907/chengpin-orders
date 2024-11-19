import { middlewares } from '@/app/api/common/apply-middlewares'
import { BadRequestError, NotFoundError } from '@/app/api/common/error/common-errors'
import { parseReq } from '@/app/api/common/helpers/request-parser'
import { RequestContext } from '@/app/api/common/types/request-context'
import { NextRequest } from 'next/server'
import prisma from '../../../../../../prisma/prisma'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { OrderStatus } from '@/app/api/order/order-status.enum'
import { restock } from '@/app/api/order/order-helper'

const cancelOrder = async (req: NextRequest, context: RequestContext) => {
  const { params } = await parseReq(req, context)
  const { orderId } = params
  if (!orderId)
    throw new BadRequestError(ErrorKey.VALIDATION_ERROR_PATH_PARAMS, 'orderId', 'orderId is a required path params')
  const order = await prisma.order.findFirst({ where: { id: orderId }, include: { orderItems: true } })
  if (!order) throw new NotFoundError(ErrorKey.MISSING_ENTITIES, orderId, `No order with id ${orderId} was found`)
  if (order.status !== OrderStatus.DRAFT)
    throw new BadRequestError(ErrorKey.INVALID_OPERATION, order, 'Only orders with DRAFT status can be cancelled')

  const cancelledOrder = await prisma.$transaction(async (trx) => {
    const restockPromises = order.orderItems.map((item) => restock(trx, item.availabilityId, item.qty))
    await Promise.all(restockPromises)
    return trx.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELLED } })
  })
  return cancelledOrder
}

export const POST = middlewares(cancelOrder)
