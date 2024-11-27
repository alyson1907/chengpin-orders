import { z } from 'zod'

const idSchema = z.string().length(24)

export const productAvailabilitySchema = z.object({
  name: z.string().min(1),
  price: z.number().gte(0),
  qty: z.number().int().gte(0),
})

export const createProductAvailabilityBodySchema = z.object({
  availabilities: z.array(
    productAvailabilitySchema.extend({
      productId: idSchema,
    })
  ),
})

export const updateProductAvailabilityBodySchema = z.object({
  availabilities: z.array(
    productAvailabilitySchema.extend({
      id: idSchema,
    })
  ),
})

export const deleteProductAvailabilityBodySchema = z.object({
  availabilities: z.array(idSchema),
})
