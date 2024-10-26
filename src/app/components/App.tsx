'use client'
import '@mantine/core/styles.css'
import { AppShell, Burger, Button, Card } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Navbar } from './catalog/navbar/Navbar'

export default function App() {
  const [opened, { toggle }] = useDisclosure()
  return (
    <AppShell
      header={{ height: 45 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding={'md'}
    >
      <AppShell.Header>
        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main>Main</AppShell.Main>
    </AppShell>
  )
}
