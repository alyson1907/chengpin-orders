import { ZodSchema } from 'zod'

export const isNotValid = (value: any, schema: ZodSchema) => !schema.safeParse(value).success
