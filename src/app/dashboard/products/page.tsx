'use client'
import { DashboardLayoutContext } from '@/app/dashboard/layout/DashboardLayoutContextProvider'
import EditableProduct from '@/app/dashboard/products/EditableProduct'
import { useContext, useEffect } from 'react'

const DashboardProducts = () => {
  const { selectedCategory } = useContext(DashboardLayoutContext)

  useEffect(() => {
    console.log(selectedCategory)
  })

  return <EditableProduct />
}

export default DashboardProducts
