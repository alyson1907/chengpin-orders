import { Dispatch, useEffect } from 'react'
import { Title, Stack, Anchor, Text } from '@mantine/core'
import styles from './Navbar.module.css'
import useSWR from 'swr'
import { notifications } from '@mantine/notifications'
import { Category } from '@prisma/client'

type IProps = {
  activeCategoryId: string
  setActiveCategoryId: Dispatch<string>
}

const fetcher = (url: string) =>
  fetch(`${url}?orderBy__asc=name`)
    .then((res) => res.json())
    .then((body) => body?.data?.entries)

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

  useEffect(() => {
    if (isLoading || activeCategoryId) return
    setActiveCategoryId(data[0]?.id)
  }, [data, activeCategoryId, setActiveCategoryId, isLoading])
  if (error) {
    notifications.show({
      title: 'Problema ao solicitar categorias',
      message: 'Não foi possível coletar as informações de categorias de plantinha',
    })
  }

  return (
    <Stack className={styles.navbar} h="100%" w="100%">
      <Title order={4} className={styles.title}>
        Catálogo
      </Title>
      {renderNavButtons(data, activeCategoryId, setActiveCategoryId)}
    </Stack>
  )
}
