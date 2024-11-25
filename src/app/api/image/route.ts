import { middlewares } from '@/app/api/common/apply-middlewares'
import imgur from '@/app/api/common/lib/imgur'
import { NextRequest } from 'next/server'

const uploadImages = async (req: NextRequest) => {
  const data = await req.formData()
  const files = data.getAll('file')
  const promises = files.map((file) => imgur.upload(file))
  const responses = await Promise.all(promises)
  return {
    links: responses.map((res) => res.link),
  }
}

export const POST = middlewares(uploadImages)
