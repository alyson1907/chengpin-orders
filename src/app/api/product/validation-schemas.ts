import { productAvailabilitySchema } from '@/app/api/availability/validation-schemas'
import { z } from 'zod'

const idSchema = z.string().length(24)
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  coverImg: z.string().url().min(1),
  imgs: z.array(z.string().url()).min(1),
})

export const createProductBodySchema = productSchema.extend({
  availability: z.array(productAvailabilitySchema).optional(),
  categories: z.array(z.object({ id: idSchema })),
})

export const updateProductsBodySchema = z.object({
  data: z.array(productSchema.extend({ id: idSchema, categories: z.array(z.object({ id: idSchema })) })),
})

export const deleteProductsBodySchema = z.object({
  data: z.array(z.object({ id: idSchema })),
})

export type CreateProductBody = z.infer<typeof createProductBodySchema>
