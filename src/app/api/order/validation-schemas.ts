import { OrderStatus } from '@/app/api/order/order-status.enum'
import { z } from 'zod'

const idSchema = z.string().length(24)

const orderBaseSchema = z.object({
  deliveryDate: z.string().date(),
  commercialDate: z.string().date(),
  customerKey: z.string().max(6),
  customerName: z.string(),
  customerPhone: z.string().max(14),
  status: z.nativeEnum(OrderStatus).optional(),
})

const orderItemsBaseSchema = z.object({
  id: idSchema,
  qty: z.number().int().min(1),
})

export const createOrderBodySchema = orderBaseSchema.omit({ status: true }).extend({
  orderItems: z.array(orderItemsBaseSchema),
})

export const updateOrderByIdBodySchema = orderBaseSchema.extend({
  orderItems: z.array(orderItemsBaseSchema).min(1),
})
