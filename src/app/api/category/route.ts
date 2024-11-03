import { NextRequest } from 'next/server'
import prisma from '../../../../prisma/prisma'
import { ErrorKey } from '../lib/error/errors.enum'
import { createCategoryBodySchema, updateCategoryBodySchema } from './validation-schemas'
import { buildPrismaFilter, parseReq } from '@/app/api/lib/helpers/request-parser'
import { errorsMiddleware } from '@/app/api/lib/error/error-handler-middleware'
import { BadRequestError, NotFoundError } from '@/app/api/lib/error/common-errors'
import { PaginationDto } from '@/app/api/lib/types/common-response'
import { Category } from '@prisma/client'

const createCategories = async (req: NextRequest) => {
  const { body } = await parseReq(req)
  const data = createCategoryBodySchema.parse(body)

  const exists = await prisma.category.findFirst({ where: { name: { equals: data.name } } })
  if (exists) throw new BadRequestError(ErrorKey.DUPLICATED_ENTRY, data, `The category ${body.name} already exists`)

  const newCategory = {
    name: body.name,
  }
  const created = await prisma.category.create({
    data: newCategory,
  })
  return created
}

const getCategories = async (req: NextRequest): Promise<PaginationDto<Category>> => {
  const { qs } = await parseReq(req)
  const filter = buildPrismaFilter(qs)
  const total = await prisma.category.count(filter)
  const categories = await prisma.category.findMany({
    ...filter,
    include: { categoryProduct: { include: { product: true } } },
  })
  return {
    entries: categories,
    total,
    totalFiltered: categories.length,
  }
}

const updateCategories = async (req: NextRequest) => {
  const { body } = await parseReq(req)
  const { data } = updateCategoryBodySchema.parse(body)
  const found = await prisma.category.findMany({
    where: { id: { in: data.map(({ id }) => id) } },
  })
  const notFound = data.filter((category) => !found.map(({ id }) => id).includes(category.id))
  if (notFound.length) throw new NotFoundError(ErrorKey.MISSING_ENTITIES, notFound)

  const promises = data.map((newInfo) =>
    prisma.category.update({
      where: { id: newInfo.id },
      data: { name: newInfo.name, visible: newInfo.visible },
      include: { categoryProduct: { include: { product: true } } },
    })
  )
  return Promise.all(promises)
}

export const POST = errorsMiddleware(createCategories)
export const GET = errorsMiddleware(getCategories)
export const PATCH = errorsMiddleware(updateCategories)
