import { ErrorKey } from '@/app/api/lib/error/errors.enum'

export class BadRequestError {
  errorKey: ErrorKey
  data: any
  message?: string

  constructor(errorKey: ErrorKey, data: any, message?: string) {
    this.errorKey = errorKey
    this.data = data
    this.message = message
  }
}

export class NotFoundError {
  errorKey: ErrorKey
  data: any
  message?: string

  constructor(errorKey: ErrorKey, data: any, message?: string) {
    this.errorKey = errorKey
    this.data = data
    this.message = message
  }
}
