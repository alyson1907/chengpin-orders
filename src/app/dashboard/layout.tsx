'use client'

import { checkAuth } from '@/app/auth/auth-actions'
import DashboardHeader from '@/app/components/dashboard/DashboardHeader'
import { AppShell } from '@mantine/core'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, useEffect } from 'react'

const DashboardLayout = ({ children }: PropsWithChildren) => {
  const url = usePathname()
  useEffect(() => {
    checkAuth(url)
  }, [url])
  return (
    <AppShell header={{ height: { base: 60, sm: 60, md: 80 }, offset: true }} padding="md">
      <AppShell.Header>
        <DashboardHeader />
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}

export default DashboardLayout
