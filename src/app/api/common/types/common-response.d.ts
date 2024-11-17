export type PaginationDto<T> = {
  entries: T[]
  total: number
  totalFiltered: number
}
