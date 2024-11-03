import { ErrorKey } from '@/app/api/lib/error/errors.enum'
import { NextRequest } from 'next/server'
import prisma from '../../../../prisma/prisma'
import {
  CreateProductBody,
  createProductBodySchema,
  deleteProductsBodySchema,
  updateProductsBodySchema,
} from '@/app/api/product/validation-schemas'
import { buildPrismaFilter, parseReq } from '@/app/api/lib/helpers/request-parser'
import { errorsMiddleware } from '@/app/api/lib/error/error-handler-middleware'
import { BadRequestError, NotFoundError } from '@/app/api/lib/error/common-errors'
import { Product } from '@prisma/client'
import { PaginationDto } from '@/app/api/lib/types/common-response'

const getCategoriesByName = async (categories: CreateProductBody['categories']) => {
  const categoryIds = categories.map(({ id }) => id)
  const existant = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  })
  return {
    notFoundCategories: categoryIds.filter(
      (catId) => !existant.some((e) => e.id.toLowerCase() === catId.toLowerCase())
    ),
    foundCategories: existant,
  }
}

const createProduct = async (req: NextRequest): Promise<Product> => {
  const { body } = await parseReq(req)
  const data = createProductBodySchema.parse(body)
  const { availability, categories, ...product } = data
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
      availability: { create: availability },
      categoryProduct: {
        create: categories.map(({ id }) => ({ category: { connect: { id } } })),
      },
    },
    include: {
      availability: true,
      categoryProduct: true,
    },
  })
  return created
}

const getProducts = async (req: NextRequest): Promise<PaginationDto<Product>> => {
  const { qs } = await parseReq(req)
  const filter = buildPrismaFilter(qs)
  const total = await prisma.product.count()
  const products = await prisma.product.findMany({ ...filter, include: { availability: true } })
  return {
    entries: products,
    total,
    totalFiltered: products.length,
  }
}

const updateProducts = async (req: NextRequest): Promise<Product[]> => {
  const { body } = await parseReq(req)
  const { data } = updateProductsBodySchema.parse(body)
  const promises = data.flatMap(({ id, ...data }) =>
    prisma.product.update({
      where: { id },
      data,
    })
  )
  return Promise.all(promises)
}

const deleteProducts = async (req: NextRequest): Promise<Product[]> => {
  const { body } = await parseReq(req)
  const { data: products } = deleteProductsBodySchema.parse(body)

  const found = await prisma.product.findMany({ where: { id: { in: products.map(({ id }) => id) } } })
  const notFound = products.filter((product) => !found.map((f) => f.id).includes(product.id))
  if (found.length !== products.length)
    throw new NotFoundError(ErrorKey.MISSING_ENTITIES, notFound, `Listed entities where not found for deletion`)

  const deleted = await prisma.$transaction(async (trx) => {
    const deleted = products.map(async ({ id: productId }) => {
      await trx.productAvailability.deleteMany({ where: { productId } })
      await trx.categoryProduct.deleteMany({ where: { productId } })
      return trx.product.delete({
        where: { id: productId },
      })
    })
    const result = await Promise.all(deleted)
    return result
  })
  return deleted
}

export const POST = errorsMiddleware(createProduct)
export const GET = errorsMiddleware(getProducts)
export const PATCH = errorsMiddleware(updateProducts)
export const DELETE = errorsMiddleware(deleteProducts)
