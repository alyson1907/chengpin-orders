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
import { DatesProvider } from '@mantine/dates'
import { ReactNode, Suspense, useEffect } from 'react'
import { usePathname, redirect } from 'next/navigation'
import CatalogPage from '@/app/catalog/CatalogPage'
import ShoppingCartProvider from '@/app/components/catalog/shopping-cart/ShoppingCartProvider'
import LayoutContextProvider from '@/app/components/layout/LayoutContextProvider'

const getLayout = (url: string, children: ReactNode) => {
  if (url.startsWith('/catalog'))
    return (
      <ShoppingCartProvider>
        <LayoutContextProvider>
          <CatalogPage>{children}</CatalogPage>
        </LayoutContextProvider>
      </ShoppingCartProvider>
    )
  return children
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const url = usePathname()
  useEffect(() => {
    if (url === '/') return redirect('/catalog')
  })

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
            <Suspense>{getLayout(url, children)}</Suspense>
          </DatesProvider>
        </MantineProvider>
      </body>
    </html>
  )
}

export default RootLayout
