'use client'
import { isScreenSmaller, useResolveSizes } from '@/app/helpers/hooks'
import { AppShell, Text, Image, Stack, Title, Button, TitleOrder } from '@mantine/core'
import { IconHome } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

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

const NotFoundPage = () => {
  const route = useRouter()
  const sizes = useResolveSizes(resolveSizes)
  return (
    <AppShell>
      <AppShell.Main style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Stack align="center">
          <Image src={'/assets/img/chengpin-logo.svg'} alt="not-found-logo" w={sizes.logo.w} fit="contain" />
          <Title order={sizes.title}>Página não encontrada ᕱ⑅ᕱ</Title>
          <Text>Procuramos por todos os lugares, mas não encontramos nada por aqui!</Text>
          <Button onClick={() => route.push('/')} mt="md" radius="xl" leftSection={<IconHome />}>
            Voltar à página inicial
          </Button>
        </Stack>
      </AppShell.Main>
    </AppShell>
  )
}

export default NotFoundPage
