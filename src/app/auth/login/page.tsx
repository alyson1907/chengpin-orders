'use client'
import { login } from '@/app/auth/auth-actions'
import { DefaultLoadingOverlay } from '@/app/common/DefaultLoadingOverlay'
import { Box, Button, Group, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { redirect, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setisLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => !value && 'Usuário obrigatório',
      password: (value) => !value && 'Senha obrigatória',
    },
  })

  const handleSubmit = async ({ username, password }) => {
    setLoginError(null)
    setisLoading(true)
    const isError = await login(username, password)
    // const isError = await login('admin', 'chengpin123')
    setisLoading(false)
    if (isError) return setLoginError('Invalid username or password')
    const redirectBack = searchParams.get('redirect_url') || '/'
    redirect(redirectBack)
  }

  return (
    <Box
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <DefaultLoadingOverlay visible={isLoading} />
      <Paper radius="md" p="xl" withBorder shadow="xl" w={400}>
        <Stack>
          <Title order={2}>Login</Title>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput label="Usuário" placeholder="Meu usuário" withAsterisk {...form.getInputProps('username')} />
              <PasswordInput label="Senha" placeholder="Minha senha" withAsterisk {...form.getInputProps('password')} />
              {loginError && (
                <Text c="red" size="sm">
                  {loginError}
                </Text>
              )}
              <Group mt="md">
                <Button type="submit" fullWidth>
                  Login
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Box>
  )
}
