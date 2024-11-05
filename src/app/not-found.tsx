'use client'
import { AppShell, Text, Image, Stack, Title, Button } from '@mantine/core'
import { IconHome } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

const NotFoundPage = () => {
  const route = useRouter()
  return (
    <AppShell>
      <AppShell.Main style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Stack align="center">
          <Image src={'/assets/img/chengpin-logo.svg'} alt="not-found-logo" w="20%" fit="contain" />
          <Title order={1}>Página não encontrada ᕱ⑅ᕱ</Title>
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
