import { NextResponse } from 'next/server'
import { HttpStatus } from '../enum/http-status.enum'
import { ErrorKey, ErrorMsg } from '../enum/errors.enum'

type ResponseBody = {
  data?: any
  message?: string
  errorKey?: string
  errorMessage?: string
}

export class ResponseBuilder {
  private body: ResponseBody = {}
  private init: ResponseInit | undefined
  data(data: any) {
    this.body.data = data
    return this
  }

  message(message: string) {
    this.body.message = message
    return this
  }

  errorKey(errorId: ErrorKey) {
    this.body.errorKey = errorId
    this.body.errorMessage = ErrorMsg[errorId]
    return this
  }

  status(status: HttpStatus) {
    this.init = { status: status || HttpStatus.OK, statusText: HttpStatus[status] }
    return this
  }

  build() {
    return NextResponse.json(this.body, this.init)
  }
}
