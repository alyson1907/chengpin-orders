import { NextRequest } from 'next/server'

type ParsedRequest = {
  body: any
  params: Record<string, string>
  qs: Record<string, any | Array<any>>
}

export const parseReq = async (req: NextRequest, info?): Promise<ParsedRequest> => {
  const tempQs = {}
  const parsed = {
    body: undefined,
    params: {},
    qs: {},
  }

  try {
    parsed.body = await req.json()
  } catch (e) {}
  if (info) parsed.params = await info?.params
  req.nextUrl.searchParams.entries().forEach(([key, value]) => {
    console.log(`\n\n\n\n\n\n\n [key, value]`, [key, value])
    const primitiveValue = toPrimitive(value)
    console.log(`\n\n\n\n\n\n\n primitiveValue`, primitiveValue)
    const currentQs = tempQs[key]

    if (!currentQs) return (tempQs[key] = primitiveValue)
    if (Array.isArray(currentQs)) return (tempQs[key] = [...currentQs, primitiveValue])
    return (tempQs[key] = [currentQs, primitiveValue])
  })
  parsed.qs = captureKeywords(tempQs)
  return parsed
}

const captureKeywords = (qs: Record<string, any | Array<any>>) => {
  const collectOrderBy = (keywords: Record<string, any | Array<any>>) => {
    const copy = { ...keywords }
    const containsOrderBy = Object.keys(copy).some((key) => key === 'orderByField' || key === 'orderByDirection')
    if (!containsOrderBy) return copy
    copy.orderBy = {
      [copy['orderByField']]: copy.orderByDirection,
    }
    delete copy.orderByField
    delete copy.orderByDirection
    return copy
  }

  const keywordsToCapture = ['skip', 'take', 'orderByField', 'orderByDirection']
  const unformattedKeywords = Object.entries(qs)
    .filter(([key, _]) => keywordsToCapture.includes(key))
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
  const others = Object.entries(qs)
    .filter(([key, _]) => !Object.keys(unformattedKeywords).includes(key))
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})

  const keywords = collectOrderBy(unformattedKeywords)
  return {
    keywords,
    others,
  }
}

function toPrimitive(value: string): unknown {
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
  } catch (e) {
    // Continue parsing if not valid JSON
  }

  // Attempt to parse as Map or Set
  if (value.startsWith('Map(') && value.endsWith(')')) {
    try {
      const mapContent = value.slice(4, -1) // Remove "Map(" and ")"
      const parsedMap = new Map(JSON.parse(mapContent))
      return parsedMap
    } catch (e) {
      // If parsing fails, skip to return as string
    }
  } else if (value.startsWith('Set(') && value.endsWith(')')) {
    try {
      const setContent = value.slice(4, -1) // Remove "Set(" and ")"
      const parsedSet = new Set(JSON.parse(setContent))
      return parsedSet
    } catch (e) {
      // If parsing fails, skip to return as string
    }
  }

  // Fallback: Return the original string if no conversions applied
  return value
}
