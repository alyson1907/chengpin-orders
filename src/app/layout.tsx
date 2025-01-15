/* eslint-disable @next/next/no-page-custom-font */
'use client'
import '@mantine/carousel/styles.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/notifications/styles.css'
import './globals.css'

import CatalogPage from '@/app/catalog/CatalogPage'
import ShoppingCartProvider from '@/app/catalog/components/shopping-cart/ShoppingCartProvider'
import LayoutContextProvider from '@/app/catalog/layout/LayoutContextProvider'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import { Notifications } from '@mantine/notifications'
import { Lexend_Deca, Roboto } from 'next/font/google'
import { redirect, usePathname } from 'next/navigation'
import { ReactNode, Suspense, useEffect } from 'react'
import theme from './theme'

const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
  weight: ['100', '300', '400', '500', '700', '900'],
})

const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend-deca',
})

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
    <html lang="en" suppressHydrationWarning className={`${lexendDeca.variable} ${roboto.variable}`}>
      <head>
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
