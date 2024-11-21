'use client'
import { checkAuth } from '@/app/auth/auth-actions'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'
import DashboardHeader from '@/app/components/dashboard/DashboardHeader'
import { AppShell } from '@mantine/core'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, useEffect, useState } from 'react'

const DashboardLayout = ({ children }: PropsWithChildren) => {
  const url = usePathname()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  useEffect(() => {
    checkAuth(url).then(() => setIsCheckingAuth(false))
  }, [url])
  return (
    <AppShell header={{ height: { base: 60, sm: 60, md: 80 }, offset: true }} padding="md">
      <DefaultLoadingOverlay visible={isCheckingAuth} />
      <AppShell.Header>
        <DashboardHeader />
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}

export default DashboardLayout
