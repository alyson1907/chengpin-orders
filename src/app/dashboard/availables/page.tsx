'use client'

import { checkAuth } from '@/app/auth/auth-actions'
import { Box } from '@mantine/core'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const DashboardAvailables = () => {
  const url = usePathname()
  useEffect(() => {
    checkAuth(url)
  }, [url])
  return <Box>Availables</Box>
}

export default DashboardAvailables
