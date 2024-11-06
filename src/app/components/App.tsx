'use client'
import '@mantine/core/styles.css'
import { useContext, useEffect } from 'react'
import ProductGrid from './catalog/product/ProductGrid'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'
import { LayoutContext } from '@/app/context/LayoutContextProvider'

const App = () => {
  const {
    category,
    navbar: { open },
  } = useContext(LayoutContext)

  useEffect(() => {
    open()
  }, [open])

  return (
    <>
      {!category.activeCategoryId && <DefaultLoadingOverlay />}
      <ProductGrid />
    </>
  )
}

export default App
