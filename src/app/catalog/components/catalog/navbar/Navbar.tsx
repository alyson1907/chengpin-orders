import { Dispatch, useContext, useEffect } from 'react'
import { Title, Stack, Anchor, Text, Group } from '@mantine/core'
import styles from './Navbar.module.css'
import useSWR from 'swr'
import { notifications } from '@mantine/notifications'
import { Category } from '@prisma/client'
import { IconBook, IconExclamationMark } from '@tabler/icons-react'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutContext } from '@/app/catalog/components/layout/LayoutContextProvider'

const fetcher = (url: string) => {
  const qs = new URLSearchParams({
    orderBy__asc: 'name',
    visible: 'true',
  })
  return fetch(`${url}?${qs}`)
    .then((res) => res.json())
    .then((body) => body?.data?.entries)
}

const renderNavButtons = (
  currentUrl: string,
  router,
  data: any = [],
  activeCategoryId: string,
  setActiveCategoryId: Dispatch<string>
) => {
  const navButtons = data.map((category: Category & { categoryProduct: Array<any> }) => {
    if (!category.visible || !category?.categoryProduct.length) return
    return (
      <Anchor
        className={styles.category}
        data-active={activeCategoryId === category.id || undefined}
        onClick={(event) => {
          event.preventDefault()
          setActiveCategoryId(category.id)
          if (currentUrl !== '/catalog') router.push('/catalog')
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
export const Navbar = () => {
  const { data, error, isLoading } = useSWR('/api/category', fetcher)
  const {
    category: { activeCategoryId, setActiveCategoryId },
  } = useContext(LayoutContext)
  const router = useRouter()
  const currentUrl = usePathname()

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
      icon: <IconExclamationMark />,
      color: 'red',
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
      {renderNavButtons(currentUrl, router, data, activeCategoryId, setActiveCategoryId)}
    </Stack>
  )
}
