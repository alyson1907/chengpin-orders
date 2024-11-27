import { mutate } from 'swr'

export const refreshCategoriesNavbar = () => {
  mutate((key) => Array.isArray(key) && key[0] === '/api/category', undefined, { revalidate: true })
}

export const refreshProductsList = () => {
  mutate((key) => Array.isArray(key) && key[0] === '/api/product' && typeof key[1] === 'string', undefined, {
    revalidate: true,
  })
}
