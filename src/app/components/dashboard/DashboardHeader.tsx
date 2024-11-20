import ButtonSquareIcon from '@/app/components/common/ButtonSquareIcon'
import { Group, Tooltip, useMantineColorScheme } from '@mantine/core'
import { IconSun, IconMoonStars } from '@tabler/icons-react'
import Link from 'next/link'

const DashboardHeader = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme == 'dark'
  const renderDarkModeToggle = () => (
    <Tooltip label="Light/Dark">
      <ButtonSquareIcon
        styles={{ color: isDark ? 'yellow' : 'grey' }}
        onClick={toggleColorScheme}
        icon={isDark ? <IconSun /> : <IconMoonStars />}
      />
    </Tooltip>
  )
  return (
    <Group justify="center" w="100%" h="100%">
      <Group>
        <Link href={'/dashboard'}>Pedidos</Link>
        <Link href={'/dashboard/categories'}>Categorias</Link>
        <Link href={'/dashboard/products'}>Produtos</Link>
        <Link href={'/dashboard/availables'}>Disponíveis à Venda</Link>
      </Group>
      <Group>{renderDarkModeToggle()}</Group>
    </Group>
  )
}

export default DashboardHeader
