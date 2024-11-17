import { ErrorKey } from '@/app/api/common/error/errors.enum'

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

export class UnauthorizedError {
  errorKey: ErrorKey.AUTH_INVALID_TOKEN | ErrorKey.AUTH_NO_PERMISSION
  message?: string

  constructor(errorKey: ErrorKey.AUTH_INVALID_TOKEN | ErrorKey.AUTH_NO_PERMISSION, message?: string) {
    this.errorKey = errorKey
    this.message = message
  }
}
