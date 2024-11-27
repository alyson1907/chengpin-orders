import { middlewares } from '@/app/api/common/apply-middlewares'
import { buildPrismaFilter, parseReq } from '@/app/api/common/helpers/request-parser'
import { OrderStatus } from '@/app/api/order/order-status.enum'
import { NextRequest } from 'next/server'
import prisma from '../../../../../../prisma/prisma'

const getStatusCount = async (req: NextRequest) => {
  const { qs } = await parseReq(req)
  const filter = buildPrismaFilter(qs)
  const totalCounts = {}
  const filteredCounts = {}
  Object.entries(OrderStatus).forEach(([key, value]) => {
    totalCounts[key] = prisma.order.count({ where: { status: value } })
  })
  Object.entries(OrderStatus).forEach(([key, value]) => {
    filteredCounts[key] = prisma.order.count({ where: { ...filter.where, status: value } })
  })
  const response = {
    totalDraft: await totalCounts[OrderStatus.DRAFT],
    totalConfirmed: await totalCounts[OrderStatus.CONFIRMED],
    totalCancelled: await totalCounts[OrderStatus.CANCELLED],
    totalFilteredDraft: await filteredCounts[OrderStatus.DRAFT],
    totalFilteredConfirmed: await filteredCounts[OrderStatus.CONFIRMED],
    totalFilteredCancelled: await filteredCounts[OrderStatus.CANCELLED],
    total: await prisma.order.count(),
  }
  return response
}

export const GET = middlewares(getStatusCount)
