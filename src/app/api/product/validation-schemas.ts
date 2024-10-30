import { productAvailabilitySchema } from '@/app/api/availability/validation-schemas'
import { categorySchema } from '@/app/api/category/validation-schemas'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  coverImg: z.string().url().min(1),
  imgs: z.array(z.string().url()).min(1),
})

export const createProductBodySchema = productSchema.extend({
  availability: z.array(productAvailabilitySchema),
  categories: z.array(categorySchema.extend({ id: z.string().length(24) })),
})

export const updateProductsBodySchema = z.object({
  data: z.array(productSchema.partial().extend({ id: z.string().length(24) })),
})

export const deleteProductsBodySchema = z.object({
  data: z.array(z.object({ id: z.string().length(24) })),
})

export type CreateProductBody = z.infer<typeof createProductBodySchema>
