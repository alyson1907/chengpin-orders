import { useState } from 'react'
import { Title, Skeleton } from '@mantine/core'
import classes from './Navbar.module.css'
import useSWR from 'swr'
import { Category } from '@prisma/client'
import { notifications } from '@mantine/notifications'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Navbar() {
  // const { data, error, isLoading } = useSWR<Category[]>('/api/category', fetcher)
  const { data, error, isLoading } = { data: [], error: true, isLoading: false }
  const [activeCategory, setActiveCategory] = useState('')
  const categories = data?.map(({ name: categoryName }) => (
    <a
      className={classes.category}
      data-active={activeCategory === categoryName || undefined}
      href="#"
      onClick={(event) => {
        event.preventDefault()
        setActiveCategory(categoryName)
      }}
      key={categoryName}
    >
      {categoryName}
    </a>
  ))
  if (error) {
    notifications.show({
      title: 'Problema ao solicitar categorias',
      message: 'Não foi possível coletar as informações de categorias de plantinha',
    })
  }
  return (
    <Skeleton visible={isLoading} height="auto" mb="xl">
      <nav className={classes.navbar}>
        <div className={classes.wrapper}>
          <div className={classes.main}>
            <Title order={4} className={classes.title}>
              Catálogo
            </Title>
            {categories}
          </div>
        </div>
      </nav>
    </Skeleton>
  )
}
