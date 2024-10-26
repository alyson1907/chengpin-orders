'use client'
import '@mantine/core/styles.css'
import { AppShell } from '@mantine/core'
import { Navbar } from './catalog/navbar/Navbar'
import { useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import ProductGrid from './catalog/product-grid/ProductGrid'
import Header from './catalog/header/Header'

export default function App() {
  const [isBurgerOpen, { toggle, close }] = useDisclosure()
  const [activeCategory, setActiveCategory] = useState({ id: '', name: '', createdAt: new Date() })

  useEffect(() => {
    close()
  }, [activeCategory])

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !isBurgerOpen } }}
      padding={'md'}
    >
      <AppShell.Header>
        <Header onBurgerClick={toggle} isBurgerOpen={isBurgerOpen} />
      </AppShell.Header>

      <AppShell.Navbar>
        <Navbar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      </AppShell.Navbar>

      <AppShell.Main>
        <ProductGrid productCategory={activeCategory} />
      </AppShell.Main>
    </AppShell>
  )
}
