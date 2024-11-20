import { Group } from '@mantine/core'
import Link from 'next/link'

const DashboardHeader = () => {
  return (
    <Group justify="center" w="100%" h="100%">
      <Link href={'/dashboard/categories'}>Categorias</Link>
      <Link href={'/dashboard/products'}>Produtos</Link>
      <Link href={'/dashboard/avaliables'}>Disponíveis à Venda</Link>
    </Group>
  )
}

export default DashboardHeader
