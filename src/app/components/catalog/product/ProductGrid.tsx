import { SimpleGrid } from '@mantine/core'
import ProductCard from './ProductCard'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useContext, useEffect, useMemo, useState } from 'react'
import { notifications } from '@mantine/notifications'
import { LayoutContext } from '@/app/components/layout/LayoutContextProvider'

const fetcher = async ([url, activeCategoryId]: [string, string]) => {
  if (!activeCategoryId) return []
  const qs = new URLSearchParams({
    ['categoryProduct.some.categoryId']: activeCategoryId,
    ['availability.some.qty.gt']: '0',
  })
  return fetch(`${url}?${qs}`).then((res) => res.json())
}

const ProductGrid = () => {
  const layoutContext = useContext(LayoutContext)
  const { data: response, error } = useSWR(['/api/product', layoutContext.category.activeCategoryId], fetcher)
  const [selectedProductId, setSelectedProductId] = useState('')
  const router = useRouter()
  useMemo(() => response, [response])

  useEffect(() => {
    if (selectedProductId) router.push(`/product-details/${selectedProductId}`)
  }, [selectedProductId, router])

  if (error) {
    notifications.show({
      title: 'Problema ao carregar lista de produtos',
      message: 'Por favor, verifique a conexão',
    })
  }
  return (
    <SimpleGrid cols={{ base: 2, sm: 2, md: 3, lg: 4 }}>
      {response?.data?.entries.map((product) => (
        <ProductCard key={product.id} productInfo={product} selectProduct={setSelectedProductId} />
      ))}
    </SimpleGrid>
  )
}

export default ProductGrid
