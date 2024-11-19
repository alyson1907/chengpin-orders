import { BadRequestError } from '@/app/api/common/error/common-errors'
import prisma from '../../../../prisma/prisma'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

type TPrismaTrx = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export const findAvailables = async (orderItems: { id: string; qty: number }[]) => {
  return prisma.productAvailability.findMany({
    where: { id: { in: orderItems.map(({ id }) => id) } },
    include: { product: true },
  })
}

export const filterItemsNotInAvailables = async (orderItems: { id: string; qty: number }[]) => {
  const currentAvailables = await findAvailables(orderItems)
  return orderItems.filter((b) => !currentAvailables.some((ca) => ca.id === b.id))
}

export const filterInsufficientStock = async (orderItems: { id: string; qty: number }[], order?: any) => {
  const currentAvailables = await findAvailables(orderItems)
  return orderItems.filter((b) => {
    const newQty = b.qty
    const currentlyInOrderQty =
      (order && order.orderItems.find((orderItem) => orderItem.availabilityId === b.id)?.qty) || 0
    const availableQty = currentAvailables.find((ca) => ca.id === b.id)?.qty || 0
    return newQty > availableQty + currentlyInOrderQty
  })
}

export const buildOrderItemsInsert = async (orderItems: { id: string; qty: number }[]) => {
  const currentAvailables = await findAvailables(orderItems)
  return currentAvailables.map((item) => {
    const buyingQty = orderItems.find((a) => a.id === item.id)?.qty
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

export const restock = async (trx: TPrismaTrx, productAvailabilityId: string, addQty: number) => {
  const productAvailability = await trx.productAvailability.findFirst({ where: { id: productAvailabilityId } })
  if (!productAvailability) return
  return trx.productAvailability.update({
    where: { id: productAvailability.id },
    data: { qty: productAvailability.qty + addQty },
  })
}

export const decrementStock = async (trx: TPrismaTrx, productAvailabilityId: string, decrementQty: number) => {
  const productAvailability = await trx.productAvailability.findFirst({ where: { id: productAvailabilityId } })
  if (!productAvailability) return
  return trx.productAvailability.update({
    where: { id: productAvailability.id },
    data: { qty: productAvailability.qty - decrementQty },
  })
}
