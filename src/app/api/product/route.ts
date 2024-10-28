import { ErrorKey } from '@/app/api/lib/enum/errors.enum'
import { HttpStatus } from '@/app/api/lib/enum/http-status.enum'
import { ResponseBuilder } from '@/app/api/lib/helpers/ResponseBuilder'
import { NextRequest } from 'next/server'
import prisma from '../../../../prisma/prisma'
import { CreateProductBody, createProductBodySchema, getProductQuerySchema } from '@/app/api/product/validation-schemas'
import { parseReq } from '@/app/api/lib/helpers/request-helper'
import { baseQueryStringSchema } from '@/app/api/lib/validation-schemas/base-request-validation-schemas'

const getCategoriesByName = async (categories: CreateProductBody['categories']) => {
  const categoryNames = categories.map(({ name }) => name)
  const existant = await prisma.category.findMany({
    where: { name: { in: categoryNames } },
  })
  return {
    notFoundCategories: categoryNames.filter((c) => !existant.some((e) => e.name.toLowerCase() === c.toLowerCase())),
    foundCategories: existant,
  }
}

export async function POST(req: NextRequest) {
  const { body } = await parseReq(req)
  const validated = createProductBodySchema.safeParse(body)
  if (!validated.success)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(ErrorKey.VALIDATION_ERROR_JSON_BODY)
      .data(validated.error)
      .build()
  const { availables, categories, ...product } = validated.data
  const { notFoundCategories, foundCategories } = await getCategoriesByName(categories)
  if (notFoundCategories.length)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(ErrorKey.MISSING_ENTITIES)
      .data({
        notFoundCategories,
        foundCategories,
      })
      .build()

  const productExists = await prisma.product.findFirst({ where: { name: { equals: product.name } } })
  if (productExists)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(ErrorKey.DUPLICATED_ENTRY)
      .message(`The product "${product.name}" already exists`)
      .build()

  const created = await prisma.product.create({
    data: {
      ...product,
      availables: { create: availables },
      categories: {
        create: categories.map(({ id }) => ({ category: { connect: { id } } })),
      },
    },
    include: {
      availables: true,
      categories: true,
    },
  })
  return new ResponseBuilder().data(created).build()
}

export async function GET(req: NextRequest) {
  const { qs } = await parseReq(req)
  console.log('\n\n\n\n', qs)
  const { success, data, error } = baseQueryStringSchema.safeParse(qs)
  if (!success)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(ErrorKey.VALIDATION_ERROR_QUERY_STRING)
      .data(error)
      .build()

  const { keywords, others: filters } = qs

  const products = await prisma.product.findMany({
    ...keywords,
    where: { categories: { some: { categoryId: filters.categoryId } } },
  })

  return new ResponseBuilder().data(products).build()
}
