'use client'
import '@mantine/core/styles.css'
import { AppShell } from '@mantine/core'
import { Navbar } from './catalog/navbar/Navbar'
import { useEffect, useState } from 'react'
import { useDisclosure, useHeadroom } from '@mantine/hooks'
import ProductGrid from './catalog/product/ProductGrid'
import Header from './catalog/header/Header'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'

export default function App() {
  const [isBurgerOpen, { toggle, close }] = useDisclosure()
  const pinned = useHeadroom({ fixedAt: 120 })
  const [activeCategoryId, setActiveCategoryId] = useState('')
  console.log(activeCategoryId)

  useEffect(() => {
    close()
  }, [activeCategoryId, close])

  return (
    <AppShell
      header={{ height: 80, collapsed: !pinned, offset: true }}
      navbar={{ width: { sm: 200, md: 250 }, breakpoint: 'sm', collapsed: { mobile: !isBurgerOpen } }}
      padding={'md'}
    >
      {!activeCategoryId && <DefaultLoadingOverlay />}
      <AppShell.Header>
        <Header onBurgerClick={toggle} isBurgerOpen={isBurgerOpen} showBurger={true} />
      </AppShell.Header>

      <AppShell.Navbar>
        <Navbar activeCategoryId={activeCategoryId} setActiveCategoryId={setActiveCategoryId} />
      </AppShell.Navbar>

      <AppShell.Main>
        <ProductGrid activeCategoryId={activeCategoryId} />
      </AppShell.Main>
    </AppShell>
  )
}
