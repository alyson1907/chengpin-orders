'use client'
import { checkAuth } from '@/app/auth/auth-actions'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'
import DashboardHeader from '@/app/components/dashboard/DashboardHeader'
import DashboardNavbar from '@/app/components/dashboard/DashboardNavbar'
import { AppShell } from '@mantine/core'
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
    <AppShell
      header={{ height: { base: 60, sm: 60, md: 80 }, offset: true }}
      navbar={{
        width: { sm: 200 },
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
        <DashboardNavbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}

export default DashboardLayout
