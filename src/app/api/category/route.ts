import { NextResponse, NextRequest } from 'next/server'
import prisma from '../../../../prisma/prisma'
import { ResponseBuilder } from '../ResponseBuilder'
import { HttpStatus } from '../enum/http-status.enum'
import { ErrorKey } from '../enum/errors.enum'
import { createCategoryBodySchema } from './validation-schemas'

export async function POST(req: NextRequest) {
  const json = await req.json()
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
  })
  return NextResponse.json(categories)
}
