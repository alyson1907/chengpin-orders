'use client'
import { DefaultLoadingOverlay } from '@/app/common/DefaultLoadingOverlay'
import { DashboardLayoutContext } from '@/app/dashboard/layout/DashboardLayoutContextProvider'
import EditableProduct from '@/app/dashboard/products/EditableProduct'
import { handleResponseError, showErrorToast } from '@/app/helpers/handle-request-error'
import { useContext, useState } from 'react'
import useSWR from 'swr'

const fetcher = async ([url, categoryId]: [string, string]) => {
  const empty = {
    entries: [],
    total: 0,
    totalFiltered: 0,
  }
  if (!categoryId) return empty
  const qs = new URLSearchParams({
    ['categoryProduct.some.categoryId']: categoryId,
  })
  const res = await fetch(`${url}?${qs}`)
  const resBody = await res.json()
  handleResponseError(resBody)
  return { ...empty, ...resBody?.data }
}

const DashboardProducts = () => {
  const { selectedCategory } = useContext(DashboardLayoutContext)
  const { data, error, isLoading } = useSWR(['/api/product', selectedCategory], fetcher)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)

  if (isLoading) return <DefaultLoadingOverlay />
  if (error) {
    showErrorToast('Problema ao consultar lista de produtos', 'Verifique sua conexão')
  }

  return data.entries.map((product: any) => (
    <EditableProduct
      key={product.id}
      product={product}
      expandedProductId={expandedProductId}
      setExpandedProductId={setExpandedProductId}
    />
  ))
}

export default DashboardProducts
