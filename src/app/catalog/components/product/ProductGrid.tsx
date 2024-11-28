import { LayoutContext } from '@/app/catalog/layout/LayoutContextProvider'
import { showErrorToast } from '@/app/helpers/handle-request-error'
import { Center, Loader, Pagination, SimpleGrid, Stack } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { useContext, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import ProductCard from './ProductCard'

type IProps = {
  productFilters?: Record<string, string>
}

const fetcher = async ([url, activeCategoryId, productFilters, page]: [
  string,
  string,
  Record<string, any> | undefined,
  number
]) => {
  if (!activeCategoryId) return []

  const take = productFilters?.perPage || 8
  const skip = (page - 1) * take
  const filter: { [k: string]: any } = {
    ['categoryProduct.some.categoryId']: activeCategoryId,
    ['availability.some.qty.gt']: '0',
    skip: skip.toString(),
    take: take.toString(),
  }
  if (productFilters?.productName) filter['name__contains'] = productFilters.productName
  const qs = new URLSearchParams(filter)
  return fetch(`${url}?${qs}`).then((res) => res.json())
}

const ProductGrid = ({ productFilters }: IProps) => {
  const layoutContext = useContext(LayoutContext)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(8)
  const {
    data: response,
    error,
    isLoading,
  } = useSWR(['/api/product', layoutContext.category.activeCategoryId, productFilters, page], fetcher)
  const [selectedProductId, setSelectedProductId] = useState('')
  const router = useRouter()
  useMemo(() => response, [response])
  useEffect(() => {
    setPage(1)
  }, [layoutContext.category.activeCategoryId, productFilters])

  useEffect(() => {
    setPerPage(parseInt(productFilters?.perPage || ''))
  }, [productFilters?.perPage, setPerPage])

  useEffect(() => {
    console.log(`page ${page} perPage ${perPage} totalFiltered ${response?.data?.totalFiltered}`)
  })

  useEffect(() => {
    if (selectedProductId) router.push(`/catalog/product-details/${selectedProductId}`)
  }, [selectedProductId, router])

  const onPageChange = (page: number) => {
    setPage(page)
  }

  if (isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    )
  if (error) {
    showErrorToast('Problema ao carregar lista de produtos', 'Por favor, verifique a conexão')
  }
  return (
    <Stack>
      <Pagination
        mt="md"
        total={Math.ceil((response?.data?.totalFiltered || 1) / perPage)}
        value={page}
        onChange={onPageChange}
      />
      <SimpleGrid mt="md" cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4 }}>
        {response?.data?.entries?.map((product) => (
          <ProductCard key={product.id} productInfo={product} selectProduct={setSelectedProductId} />
        ))}
      </SimpleGrid>
      <Pagination
        mt="md"
        total={Math.ceil((response?.data?.totalFiltered || 1) / perPage)}
        value={page}
        onChange={onPageChange}
      />
    </Stack>
  )
}

export default ProductGrid
