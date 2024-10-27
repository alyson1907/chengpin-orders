import { Dispatch } from 'react'
import { Title, Skeleton, Stack, Anchor } from '@mantine/core'
import styles from './Navbar.module.css'
import useSWR from 'swr'
import { notifications } from '@mantine/notifications'
import { Category } from '@prisma/client'

type IProps = {
  activeCategory: Category
  setActiveCategory: Dispatch<any>
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Navbar({ activeCategory, setActiveCategory }: IProps) {
  const { data: categories = [], error, isLoading } = useSWR<Category[]>('/api/category', fetcher)
  const navButtons = categories.map((category) => (
    <Anchor
      className={styles.category}
      data-active={activeCategory.id === category.id || undefined}
      href="#"
      onClick={(event) => {
        event.preventDefault()
        setActiveCategory(category)
      }}
      key={category.name}
    >
      {category.name}
    </Anchor>
  ))

  if (error) {
    notifications.show({
      title: 'Problema ao solicitar categorias',
      message: 'Não foi possível coletar as informações de categorias de plantinha',
    })
  }

  return (
    <Skeleton visible={isLoading} height="100%" mb="xl">
      <Stack className={styles.navbar} h="100%" w="100%">
        <Title order={4} className={styles.title}>
          Catálogo
        </Title>
        {navButtons}
      </Stack>
    </Skeleton>
  )
}
