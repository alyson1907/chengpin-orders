/* eslint-disable @next/next/no-page-custom-font */
'use client'
import './globals.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/core/styles.css'
import '@mantine/carousel/styles.css'
import '@mantine/dates/styles.css'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import theme from './theme'
import ShoppingCartProvider from '@/app/catalog/components/catalog/shopping-cart/ShoppingCartProvider'
import LayoutContextProvider from '@/app/catalog/components/layout/LayoutContextProvider'
import AppShellLayout from '@/app/catalog/components/layout/AppShellLayout'
import { DatesProvider } from '@mantine/dates'
import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter, redirect } from 'next/navigation'

const getLayout = (url: string, children: ReactNode) => {
  if (url.startsWith('/catalog'))
    return (
      <ShoppingCartProvider>
        <LayoutContextProvider>
          <AppShellLayout>{children}</AppShellLayout>
        </LayoutContextProvider>
      </ShoppingCartProvider>
    )
  return children
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const url = usePathname()
  const router = useRouter()
  useEffect(() => {
    if (url === '/') return redirect('/catalog')
  }, [url, router])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@100..900&family=Yrsa:ital,wght@0,300..700;1,300..700&display=swap"
          rel="stylesheet"
        />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <DatesProvider settings={{ locale: 'pt-br', firstDayOfWeek: 0 }}>
            <Notifications />
            {getLayout(url, children)}
          </DatesProvider>
        </MantineProvider>
      </body>
    </html>
  )
}

export default RootLayout
