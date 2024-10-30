import { z } from 'zod'

export const productAvailabilitySchema = z.object({
  name: z.string().min(1),
  price: z.number().gte(0),
  qty: z.number().int().gte(0),
})
