'use client'

import Header from '@/app/components/catalog/header/Header'
import { Navbar } from '@/app/components/catalog/navbar/Navbar'
import ShoppingCart from '@/app/components/catalog/shopping-cart/ShoppingCart'
import { LayoutContext } from '@/app/components/layout/LayoutContextProvider'
import { isScreenSmaller, useBreakpoint } from '@/app/helpers/hooks'
import { AppShell } from '@mantine/core'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, useContext, useEffect } from 'react'

const CatalogPage = ({ children }: PropsWithChildren) => {
  const layoutContext = useContext(LayoutContext)
  const { isOpen: isNavbarOpen, toggle, close } = layoutContext.navbar
  const selectedCategory = layoutContext.category.activeCategoryId
  const url = usePathname()
  const breakpoint = useBreakpoint()
  const isMobile = isScreenSmaller(breakpoint, 'sm')

  const showBurger = url === '/catalog'
  const navHidden =
    !isNavbarOpen ||
    url === '/not-found' ||
    url === '/no-catalog' ||
    url.includes('/catalog/product-details') ||
    url === '/checkout'
  const headerHidden = url === '/not-found' || url === '/no-catalog'
  const isCartEditable = !url.includes('/catalog/checkout')
  useEffect(() => {
    console.log(`children`, children)
  })
  useEffect(() => {
    if (isMobile) close()
  }, [selectedCategory, close, isMobile])

  return (
    <AppShell
      header={{ height: { base: 60, sm: 60, md: 80 }, collapsed: headerHidden, offset: !headerHidden }}
      navbar={{
        width: { sm: 200 },
        breakpoint: 'sm',
        collapsed: { mobile: navHidden, desktop: navHidden },
      }}
      padding="md"
    >
      <ShoppingCart editable={isCartEditable} />
      <AppShell.Header>
        <Header isBurgerOpen={isNavbarOpen} onBurgerClick={toggle} showBurger={showBurger} showBackBtn={!showBurger} />
      </AppShell.Header>

      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}

export default CatalogPage
