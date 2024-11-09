/* eslint-disable @next/next/no-page-custom-font */
'use client'
import './globals.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/core/styles.css'
import '@mantine/carousel/styles.css'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import theme from './theme'
import ShoppingCartProvider from '@/app/components/catalog/shopping-cart/ShoppingCartProvider'
import LayoutContextProvider from '@/app/components/layout/LayoutContextProvider'
import AppShellLayout from '@/app/components/layout/AppShellLayout'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
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
          <Notifications />
          <ShoppingCartProvider>
            <LayoutContextProvider>
              <AppShellLayout>{children}</AppShellLayout>
            </LayoutContextProvider>
          </ShoppingCartProvider>
        </MantineProvider>
      </body>
    </html>
  )
}

export default RootLayout
