import { middlewares, middlewaresWithoutAuth } from '@/app/api/common/apply-middlewares'
import { BadRequestError, NotFoundError } from '@/app/api/common/error/common-errors'
import { ErrorKey } from '@/app/api/common/error/errors.enum'
import { buildPrismaFilter, parseReq } from '@/app/api/common/helpers/request-parser'
import { PaginationDto } from '@/app/api/common/types/common-response'
import {
  CreateProductBody,
  createProductBodySchema,
  deleteProductsBodySchema,
  updateProductsBodySchema,
} from '@/app/api/product/validation-schemas'
import { Product } from '@prisma/client'
import { NextRequest } from 'next/server'
import prisma from '../../../../prisma/prisma'

const fetchCategories = async (categories: CreateProductBody['categories']) => {
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

const productInclude = { availability: true, categoryProduct: { include: { category: true } } }
const createProduct = async (req: NextRequest): Promise<Product> => {
  const { body } = await parseReq(req)
  const data = createProductBodySchema.parse(body)
  const { availability, categories, ...product } = data
  const { notFoundCategories, foundCategories } = await fetchCategories(categories)
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
    include: productInclude,
  })
  return created
}

const getProducts = async (req: NextRequest): Promise<PaginationDto<Product>> => {
  const { qs } = await parseReq(req)
  const { skip, take, ...filter } = buildPrismaFilter(qs)
  const total = await prisma.product.count()
  const totalFiltered = await prisma.product.count(filter)
  const products = await prisma.product.findMany({
    ...filter,
    skip,
    take,
    include: productInclude,
  })
  return {
    entries: products,
    total,
    totalFiltered,
  }
}

const updateProducts = async (req: NextRequest): Promise<Product[]> => {
  const { body } = await parseReq(req)
  const { data } = updateProductsBodySchema.parse(body)

  const allCategories = data.flatMap((p) => p.categories.map(({ id }) => id))
  const foundCategories = await prisma.category.findMany({
    where: { id: { in: allCategories } },
  })
  if (allCategories.length !== foundCategories.length)
    throw new NotFoundError(
      ErrorKey.MISSING_ENTITIES,
      { receivedCategories: allCategories, foundCategories },
      'Some categories were not found'
    )

  const promises = await prisma.$transaction(async (trx) => {
    const promises = data.flatMap(async ({ id, categories, ...data }) => {
      await trx.categoryProduct.deleteMany({ where: { productId: id } })
      await trx.categoryProduct.createMany({
        data: categories.map((category) => ({ productId: id, categoryId: category.id })),
      })
      const updated = await trx.product.update({
        where: { id },
        data,
        include: productInclude,
      })
      return updated
    })

    const result = await Promise.all(promises)
    return result
  })
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

export const POST = middlewares(createProduct)
export const GET = middlewaresWithoutAuth(getProducts)
export const PUT = middlewares(updateProducts)
export const DELETE = middlewares(deleteProducts)
