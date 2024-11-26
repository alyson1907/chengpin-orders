'use client'
import { DefaultLoadingOverlay } from '@/app/common/DefaultLoadingOverlay'
import { DashboardLayoutContext } from '@/app/dashboard/layout/DashboardLayoutContextProvider'
import CreateProductModal from '@/app/dashboard/products/CreateProductModal'
import EditableProduct from '@/app/dashboard/products/EditableProduct'
import { handleResponseError, showErrorToast } from '@/app/helpers/handle-request-error'
import { Button, Group } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons-react'
import { useContext, useState } from 'react'
import useSWR, { mutate } from 'swr'

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

const sendCreateProduct = async (body: Record<string, any>) => {
  const res = await fetch('/api/product', { method: 'POST', body: JSON.stringify(body) })
  const resBody = await res.json()
  handleResponseError(resBody)
  return resBody
}
const DashboardProducts = () => {
  const { selectedCategory } = useContext(DashboardLayoutContext)
  const { data, error, isLoading, mutate: mutateProduct } = useSWR(['/api/product', selectedCategory], fetcher)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [isCreateProductOpen, { open: openCreateProduct, close: closeCreateProduct }] = useDisclosure(false)

  if (isLoading) return <DefaultLoadingOverlay />
  if (error) {
    showErrorToast('Problema ao consultar lista de produtos', 'Verifique sua conexão')
  }

  return (
    <>
      <CreateProductModal
        opened={isCreateProductOpen}
        onClose={closeCreateProduct}
        onSave={async (body) => {
          await sendCreateProduct(body)
          mutateProduct()
          mutate(['/api/category', { orderBy__desc: 'visible' }])
          close()
        }}
      />
      <Group justify="flex-end">
        <Button leftSection={<IconPlus />} color="indigo" onClick={openCreateProduct}>
          Novo Produto
        </Button>
      </Group>
      {data.entries.map((product: any) => (
        <EditableProduct
          key={product.id}
          product={product}
          expandedProductId={expandedProductId}
          setExpandedProductId={setExpandedProductId}
          afterUpdate={() => {
            mutateProduct()
            mutate(['/api/category', { orderBy__desc: 'visible' }])
          }}
        />
      ))}
    </>
  )
}

export default DashboardProducts
