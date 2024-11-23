import ButtonSquareIcon from '@/app/components/common/ButtonSquareIcon'
import { Anchor, Group, Tooltip, useMantineColorScheme } from '@mantine/core'
import { IconSun, IconMoonStars } from '@tabler/icons-react'

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
        <Anchor href={'/dashboard'}>Pedidos</Anchor>
        <Anchor href={'/dashboard/products'}>Produtos</Anchor>
      </Group>
      <Group>{renderDarkModeToggle()}</Group>
    </Group>
  )
}

export default DashboardHeader
