import { RequestContext } from '@/app/api/common/types/request-context'
import * as _ from 'lodash'
import { NextRequest } from 'next/server'

type ParsedRequest = {
  body: any
  params: Record<string, string>
  qs: Record<string, any>
}

export const parseReq = async (req: NextRequest, context?: RequestContext): Promise<ParsedRequest> => {
  const parsed: ParsedRequest = {
    body: undefined,
    params: {},
    qs: {},
  }
  // Body
  parsed.body = await req.json().catch(() => {})

  // Params
  if (context) parsed.params = await context?.params

  // Querystrings
  for (const entry of req.nextUrl.searchParams.entries()) {
    const [key, value] = entry
    const primitiveValue = toPrimitive(value)
    const current = parsed.qs[key]

    if (!current) parsed.qs[key] = primitiveValue
    else if (Array.isArray(current)) parsed.qs[key] = [...current, primitiveValue]
    else parsed.qs[key] = [current, primitiveValue]
  }
  return parsed
}

const groupFilterClauses = (prismaFilter: Record<string, any>) => {
  const rootKeys = ['orderBy']
  const pagination = { skip: prismaFilter?.skip || 0, take: prismaFilter?.take || 99999 }
  delete prismaFilter.skip
  delete prismaFilter.take
  // All filters that are not "root" are grouped in the `where` clause
  const groupedWhere = Object.entries(prismaFilter).reduce(
    (acc, [field, value]) => {
      if (rootKeys.includes(field)) return { ...acc, [field]: value }
      const prevWhere = _.pick(acc, ['where'])
      acc.where = { ...prevWhere.where, [field]: value }
      return acc
    },
    { where: {}, ...pagination }
  )
  return groupedWhere
}

export const buildPrismaFilter = (qs: Record<string, any>) => {
  const nestedKey = '.'
  const prismaFilter = {}
  for (const key in qs) {
    const keyParts = key.split(nestedKey)
    assignNestedFilter(prismaFilter, keyParts, qs[key])
  }
  const grouped = groupFilterClauses(prismaFilter)
  return grouped
}

const assignNestedFilter = (currentFilter: any, keyParts: string[], value: any) => {
  const splitKey = '__'
  const [field, operator] = keyParts[0].split(splitKey)
  const stringOperators = ['contains', 'startsWith', 'endsWith']
  const prismaOperators = [
    'gte',
    'lte',
    'equals',
    'contains',
    'startsWith',
    'endsWith',
    'in',
    'notIn',
    'skip',
    'take',
    'orderBy',
  ]
  if (field === 'orderBy') currentFilter.orderBy = { [value]: operator }
  else if (keyParts.length === 1) {
    // If it's the last part, assign the filter value directly
    if (operator && prismaOperators.includes(operator)) {
      const transformedValue = stringOperators.includes(operator) ? '' + value : value
      const caseInsensitive = typeof transformedValue === 'string' ? { mode: 'insensitive' } : {}
      currentFilter[field] = {
        ...currentFilter[field],
        ...caseInsensitive,
        [operator]: transformedValue,
      }
    } else {
      // Direct match: if value is an array, use "in" filter automatically
      currentFilter[field] = Array.isArray(value) ? { in: value } : value
    }
  } else {
    // Recursively assign nested fields
    if (!currentFilter[field]) {
      currentFilter[field] = {}
    }
    // Recur into the next part
    assignNestedFilter(currentFilter[field], keyParts.slice(1), value)
  }
}

const toPrimitive = (value: string) => {
  // Handle "null" and "undefined"
  if (value.toLowerCase() === 'null') return null
  if (value.toLowerCase() === 'undefined') return undefined

  // Handle boolean values
  if (value.toLowerCase() === 'true') return true
  if (value.toLowerCase() === 'false') return false

  // Check if the value is a valid number using a regular expression
  const numberRegex = /^-?\d+(\.\d+)?$/
  if (numberRegex.test(value)) {
    // Safely convert to a number
    return parseFloat(value)
  }

  // Attempt to parse as JSON (arrays, objects, nested structures)
  try {
    const jsonParsed = JSON.parse(value)
    return jsonParsed
  } catch {
    // Continue parsing if not valid JSON
  }

  // Attempt to parse as Map or Set
  if (value.startsWith('Map(') && value.endsWith(')')) {
    try {
      const mapContent = value.slice(4, -1) // Remove "Map(" and ")"
      const parsedMap = new Map(JSON.parse(mapContent))
      return parsedMap
    } catch {
      // If parsing fails, skip to return as string
    }
  } else if (value.startsWith('Set(') && value.endsWith(')')) {
    try {
      const setContent = value.slice(4, -1) // Remove "Set(" and ")"
      const parsedSet = new Set(JSON.parse(setContent))
      return parsedSet
    } catch {
      // If parsing fails, skip to return as string
    }
  }

  // Fallback: Return the original string if no conversions applied
  return value
}
