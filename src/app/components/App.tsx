'use client'
import '@mantine/core/styles.css'
import { AppShell, Modal } from '@mantine/core'
import { Navbar } from './catalog/navbar/Navbar'
import { useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import ProductGrid from './catalog/product/ProductGrid'
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
      navbar={{ width: { sm: 200, md: 250 }, breakpoint: 'sm', collapsed: { mobile: !isBurgerOpen } }}
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
