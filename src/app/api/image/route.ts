import { middlewares } from '@/app/api/common/apply-middlewares'
import { NextRequest } from 'next/server'

const uploadImages = async (req: NextRequest) => {
  console.log(req)
  return 'images upload ok!'
}

export const POST = middlewares(uploadImages)
