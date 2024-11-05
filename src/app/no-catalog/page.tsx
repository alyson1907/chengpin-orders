'use client'
import companyInfo from '@/app/company-info'
import { isScreenSmaller, useResolveSizes } from '@/app/helpers/hooks'
import { AppShell, Text, Image, Stack, Title, Button, TitleOrder } from '@mantine/core'
import { IconBrandWhatsapp } from '@tabler/icons-react'

const resolveSizes = (current: number) => {
  const result = {
    title: 1 as TitleOrder,
    logo: {
      w: 300,
    },
  }
  if (isScreenSmaller(current, 'sm')) {
    result.title = 2 as TitleOrder
    result.logo.w = 250
  }
  if (isScreenSmaller(current, 'xs')) {
    result.title = 3 as TitleOrder
    result.logo.w = 150
  }
  return result
}

const openWhatsapp = () => {
  window.open(`https://wa.me/${companyInfo.contact.whatsapp}?text=Olá Chengpin! Tudo bem?`)
}

const NoCatalogPage = () => {
  const sizes = useResolveSizes(resolveSizes)
  return (
    <AppShell>
      <AppShell.Main style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Stack align="center" ml="xl" mr="xl">
          <Image src={'/assets/img/company-logo.png'} alt="not-found-logo" w={sizes.logo.w} fit="contain" />
          <Title order={sizes.title}>Catálogo vazio ᕱ⑅ᕱ</Title>
          <Text>Que pena! Parece que nosso catálogo online está vazio...</Text>
          <Text>Mas não se preocupe! Vamos te atender logo abaixo: </Text>
          <Button onClick={openWhatsapp} mt="md" radius="xl" leftSection={<IconBrandWhatsapp />}>
            Whatsapp
          </Button>
        </Stack>
      </AppShell.Main>
    </AppShell>
  )
}

export default NoCatalogPage
