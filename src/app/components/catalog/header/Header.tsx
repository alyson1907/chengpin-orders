import { Group, Burger, Image, useMantineColorScheme, Tooltip } from '@mantine/core'
import { IconMoonStars, IconSun } from '@tabler/icons-react'
import ButtonSquareIcon from '../../ButtonSquareIcon'

type IProps = {
  isBurgerOpen: boolean
  onBurgerClick: () => void
}
export default function Header({ isBurgerOpen, onBurgerClick }: IProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme == 'dark'

  return (
    <Group h="100%" px="md">
      <Burger opened={isBurgerOpen} onClick={onBurgerClick} hiddenFrom="sm" size="sm" />
      <Image src={'assets/img/SVG_Logo.png'} h="100%" fit="contain" />

      <Group flex={1} justify="flex-end">
        <Tooltip label="Light/Dark">
          <ButtonSquareIcon
            styles={{ color: isDark ? 'yellow' : 'grey' }}
            onClick={toggleColorScheme}
            icon={isDark ? <IconSun /> : <IconMoonStars />}
          />
        </Tooltip>
      </Group>
    </Group>
  )
}
