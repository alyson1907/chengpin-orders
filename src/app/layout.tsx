'use client'
import './globals.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/core/styles.css'
import '@mantine/carousel/styles.css'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import theme from './theme'
import ShoppingCartProvider from '@/app/context/ShoppingCartProvider'
import LayoutContextProvider from '@/app/context/LayoutContextProvider'
import AppShellLayout from '@/app/components/AppShellLayout'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
