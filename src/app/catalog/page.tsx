'use client'
import '@mantine/core/styles.css'
import { useContext, useEffect } from 'react'
import ProductGrid from '@/app/catalog/components/product/ProductGrid'
import { DefaultLoadingOverlay } from '@/app/common/DefaultLoadingOverlay'
import { LayoutContext } from '@/app/catalog/layout/LayoutContextProvider'
import { isScreenSmaller, useBreakpoint } from '@/app/helpers/hooks'

const CatalogMain = () => {
  const {
    category,
    navbar: { open },
  } = useContext(LayoutContext)
  const breakpoint = useBreakpoint()
  const isMobile = isScreenSmaller(breakpoint, 'sm')

  useEffect(() => {
    if (!isMobile) open()
  }, [open, isMobile])

  return (
    <>
      {!category.activeCategoryId && <DefaultLoadingOverlay />}
      <ProductGrid />
    </>
  )
}

export default CatalogMain
