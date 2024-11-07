'use client'
import '@mantine/core/styles.css'
import { useContext, useEffect } from 'react'
import ProductGrid from './catalog/product/ProductGrid'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'
import { LayoutContext } from '@/app/components/layout/LayoutContextProvider'
import { isScreenSmaller, useBreakpoint } from '@/app/helpers/hooks'

const App = () => {
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

export default App
