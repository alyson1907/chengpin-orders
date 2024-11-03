import { Dispatch, useEffect } from 'react'
import { Title, Stack, Anchor, Text, Group } from '@mantine/core'
import styles from './Navbar.module.css'
import useSWR from 'swr'
import { notifications } from '@mantine/notifications'
import { Category } from '@prisma/client'
import { IconBook } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

type IProps = {
  activeCategoryId: string
  setActiveCategoryId: Dispatch<string>
}

const fetcher = (url: string) => {
  const qs = new URLSearchParams({
    orderBy__asc: 'name',
    visible: 'true',
  })
  return fetch(`${url}?${qs}`)
    .then((res) => res.json())
    .then((body) => body?.data?.entries)
}

const renderNavButtons = (data: any = [], activeCategoryId: string, setActiveCategoryId: Dispatch<string>) => {
  const navButtons = data.map((category: Category & { categoryProduct: Array<any> }) => {
    if (!category.visible || !category?.categoryProduct.length) return
    return (
      <Anchor
        className={styles.category}
        data-active={activeCategoryId === category.id || undefined}
        onClick={(event) => {
          event.preventDefault()
          setActiveCategoryId(category.id)
        }}
        href="#"
        key={category.name}
      >
        <Text fw={500}>{category.name}</Text>
      </Anchor>
    )
  })
  return navButtons
}
export function Navbar({ activeCategoryId, setActiveCategoryId }: IProps) {
  const { data, error, isLoading } = useSWR('/api/category', fetcher)
  const router = useRouter()

  useEffect(() => {
    if (isLoading || activeCategoryId) return
    const first = data.find((category) => category.categoryProduct.length)
    if (!first) router.push('/no-catalog')
    setActiveCategoryId(first?.id)
  }, [data, isLoading, activeCategoryId, setActiveCategoryId, router])

  if (error) {
    notifications.show({
      title: 'Problema ao solicitar categorias',
      message: 'Não foi possível coletar as informações de categorias de plantinha',
    })
  }

  return (
    <Stack className={styles.navbar} h="100%" w="100%">
      <Group>
        <Title order={4} className={styles.title}>
          <IconBook style={{ marginRight: '8px' }} />
          Catálogo
        </Title>
      </Group>
      {renderNavButtons(data, activeCategoryId, setActiveCategoryId)}
    </Stack>
  )
}
