import { Group, Burger, Image, useMantineColorScheme, Tooltip, Title, TitleOrder } from '@mantine/core'
import { Parisienne } from 'next/font/google'
import { IconMoonStars, IconPlant, IconSun } from '@tabler/icons-react'
import ButtonSquareIcon from '../../ButtonSquareIcon'
import { isScreenLarger, useResolveSizes } from '@/app/helpers/hooks'
import { useRouter } from 'next/navigation'

type IProps = {
  isBurgerOpen?: boolean
  onBurgerClick?: () => void
  showBurger?: boolean
}

const headerFont = Parisienne({
  subsets: ['latin'],
  weight: '400',
})

const resolveSizes = (breakpoint: number) => {
  const result = { title: 1 as TitleOrder, logo: { height: '100%' } }
  if (!isScreenLarger(breakpoint, 'xs')) result.title = 2 as TitleOrder
  if (!isScreenLarger(breakpoint, 'xs')) result.logo.height = '70%'
  return result
}

const Header = ({ isBurgerOpen, onBurgerClick, showBurger = false }: IProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme == 'dark'
  const sizes = useResolveSizes(resolveSizes)
  const router = useRouter()
  return (
    <Group flex={sizes.title} justify="space-between" h="100%" px="md">
      {showBurger && <Burger opened={isBurgerOpen} onClick={onBurgerClick} hiddenFrom="sm" size="sm" />}
      <Image
        src={'/assets/img/company-logo.png'}
        onClick={() => router.push('/')}
        style={{ cursor: 'pointer' }}
        h={sizes.logo.height}
        fit="contain"
        alt="header-logo"
      />

      <Group>
        <Title order={sizes.title} className={headerFont.className} style={{ display: 'flex', alignItems: 'center' }}>
          Chengpin
          <IconPlant />
        </Title>
      </Group>

      <Group>
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
export default Header
