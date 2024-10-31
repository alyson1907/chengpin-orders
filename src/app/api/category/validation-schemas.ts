import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string(),
  visible: z.boolean().optional(),
})

export const createCategoryBodySchema = z.object({
  name: z.string(),
})

export const updateCategoryBodySchema = z.object({
  data: z.array(categorySchema.extend({ id: z.string().length(24) })),
})

export const deleteCategoryParamSchema = z.object({
  id: z.string().length(24),
})
