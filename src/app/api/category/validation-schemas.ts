import { z } from 'zod'

export const createCategoryBodySchema = z.object({
  name: z.string(),
})

export const deleteCategoryParamSchema = z.object({
  id: z.string().length(24),
})
