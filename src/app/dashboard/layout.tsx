'use client'
import { checkAuth } from '@/app/auth/auth-actions'
import { DefaultLoadingOverlay } from '@/app/common/DefaultLoadingOverlay'
import DashboardHeader from '@/app/dashboard/components/DashboardHeader'
import DashboardNavbar from '@/app/dashboard/components/DashboardNavbar'
import DashboardLayoutContextProvider from '@/app/dashboard/layout/DashboardLayoutContextProvider'
import { AppShell, ScrollArea } from '@mantine/core'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, useEffect, useState } from 'react'

const DashboardLayout = ({ children }: PropsWithChildren) => {
  const url = usePathname()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth(url).then(() => setIsCheckingAuth(false))
  }, [url])

  const isNavHidden = url !== '/dashboard/products'
  return (
    <DashboardLayoutContextProvider>
      <AppShell
        header={{ height: { base: 60, sm: 60, md: 80 }, offset: true }}
        navbar={{
          width: { sm: 250 },
          breakpoint: 'sm',
          collapsed: { mobile: isNavHidden, desktop: isNavHidden },
        }}
        padding="md"
      >
        <DefaultLoadingOverlay visible={isCheckingAuth} />

        <AppShell.Header>
          <DashboardHeader />
        </AppShell.Header>

        <AppShell.Navbar>
          <AppShell.Section grow component={ScrollArea}>
            <DashboardNavbar />
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </DashboardLayoutContextProvider>
  )
}

export default DashboardLayout
