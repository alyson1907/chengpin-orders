import { NextResponse, NextRequest } from 'next/server'
import prisma from '../../../../prisma/prisma'
import { ResponseBuilder } from '../lib/helpers/ResponseBuilder'
import { HttpStatus } from '../lib/enum/http-status.enum'
import { ErrorKey } from '../lib/enum/errors.enum'
import { createCategoryBodySchema } from './validation-schemas'
import { parseReq } from '@/app/api/lib/helpers/request-helper'

export async function POST(req: NextRequest) {
  const { body: json } = await parseReq(req)
  const validated = createCategoryBodySchema.safeParse(json)
  if (!validated.success)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(ErrorKey.VALIDATION_ERROR_JSON_BODY)
      .data(validated.error)
      .build()

  const { data: body } = validated
  const exists = await prisma.category.findFirst({ where: { name: { equals: body.name } } })
  if (exists)
    return new ResponseBuilder()
      .status(HttpStatus.BAD_REQUEST)
      .errorKey(ErrorKey.DUPLICATED_ENTRY)
      .message(`The category ${body.name} already exists`)
      .build()

  const newCategory = {
    name: body.name,
  }
  const created = await prisma.category.create({
    data: newCategory,
  })
  return new ResponseBuilder().data(created).build()
}

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    include: { products: { include: { product: true } } },
  })
  return NextResponse.json(categories)
}
