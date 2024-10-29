import { ErrorKey } from '@/app/api/lib/error/errors.enum'
import { ResponseBuilder } from '@/app/api/lib/helpers/response-builder'
import { NextRequest } from 'next/server'
import prisma from '../../../../prisma/prisma'
import { CreateProductBody, createProductBodySchema } from '@/app/api/product/validation-schemas'
import { buildPrismaFilter, parseReq } from '@/app/api/lib/helpers/request-helper'
import { errorsMiddleware } from '@/app/api/lib/error/error-handler-middleware'
import { BadRequestError } from '@/app/api/lib/error/common-errors'

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

const createProducts = async (req: NextRequest) => {
  const { body } = await parseReq(req)
  const data = createProductBodySchema.parse(body)
  const { availables, categories, ...product } = data
  const { notFoundCategories, foundCategories } = await getCategoriesByName(categories)
  if (notFoundCategories.length)
    throw new BadRequestError(ErrorKey.MISSING_ENTITIES, {
      notFoundCategories,
      foundCategories,
    })

  const productExists = await prisma.product.findFirst({ where: { name: { equals: product.name } } })
  if (productExists)
    throw new BadRequestError(
      ErrorKey.DUPLICATED_ENTRY,
      { name: product.name },
      `The product "${product.name}" already exists`
    )

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

const getProducts = async (req: NextRequest) => {
  const { qs } = await parseReq(req)
  const filter = buildPrismaFilter(qs)
  const products = await prisma.product.findMany(filter)
  return new ResponseBuilder().data(products).build()
}

export const POST = errorsMiddleware(createProducts)
export const GET = errorsMiddleware(getProducts)
