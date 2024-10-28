import { z } from 'zod'

export const createProductBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  coverImg: z.string().url(),
  imgs: z.array(z.string().url()),
  availables: z.array(
    z.object({
      name: z.string(),
      price: z.number().gte(0),
      qty: z.number().int().gte(0),
    })
  ),
  categories: z.array(
    z.object({
      id: z.string().length(24),
      name: z.string(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime().nullable(),
    })
  ),
})

export const getProductQuerySchema = z.object({
  keywords: z.object({
    skip: z.number().int().gte(0),
    take: z.number().int().gte(0),
  }),
})

export type CreateProductBody = z.infer<typeof createProductBodySchema>
