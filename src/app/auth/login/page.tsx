'use client'
import React, { useState } from 'react'
import { useForm } from '@mantine/form'
import { TextInput, PasswordInput, Button, Box, Paper, Text, Group, Stack, Title } from '@mantine/core'

export default function LoginPage() {
  const [loginError, setLoginError] = useState<string | null>(null)
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

  const handleSubmit = (values: typeof form.values) => {
    setLoginError(null)
    if (values.username !== 'admin' || values.password !== 'password123') {
      setLoginError('Invalid username or password')
      return
    }
    alert('Logged in successfully')
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
      <Paper radius="md" p="xl" withBorder shadow="xl" w={400}>
        <Stack>
          <Title order={2}>Login</Title>

          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
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
