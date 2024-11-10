'use client'
import Header from '@/app/components/catalog/header/Header'
import { Navbar } from '@/app/components/catalog/navbar/Navbar'
import { LayoutContext } from '@/app/components/layout/LayoutContextProvider'
import { isScreenSmaller, useBreakpoint } from '@/app/helpers/hooks'
import { AppShell } from '@mantine/core'
import { usePathname } from 'next/navigation'
import { useContext, useEffect } from 'react'

const AppShellLayout = ({ children }) => {
  const layoutContext = useContext(LayoutContext)
  const { isOpen: isNavbarOpen, toggle, close } = layoutContext.navbar
  const selectedCategory = layoutContext.category.activeCategoryId
  const url = usePathname()
  const breakpoint = useBreakpoint()
  const isMobile = isScreenSmaller(breakpoint, 'sm')

  const showBurger = url === '/'
  const navHidden =
    !isNavbarOpen ||
    url === '/not-found' ||
    url === '/no-catalog' ||
    url.includes('/product-details') ||
    url === '/checkout'
  const headerHidden = url === '/not-found' || url === '/no-catalog'

  useEffect(() => {
    if (isMobile) close()
  }, [selectedCategory, close, isMobile])

  return (
    <AppShell
      header={{ height: { base: 60, sm: 60, md: 80 }, collapsed: headerHidden, offset: true }}
      navbar={{
        width: { sm: 200, md: 250 },
        breakpoint: 'sm',
        collapsed: { mobile: navHidden, desktop: navHidden },
      }}
      padding={'md'}
    >
      <AppShell.Header>
        <Header isBurgerOpen={isNavbarOpen} onBurgerClick={toggle} showBurger={showBurger} />
      </AppShell.Header>

      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}

export default AppShellLayout
