import { z } from 'zod'

export const baseQueryStringSchema = z.object({
  keywords: z.object({
    skip: z.number().int().gte(0),
    take: z.number().int().gte(0),
    orderByField: z.string().optional(),
    orderByDirection: z.union([z.literal('asc'), z.literal('desc')]).optional(),
  }),
  others: z.object({}),
})
