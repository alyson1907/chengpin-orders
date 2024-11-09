import { Group, Burger, Image, useMantineColorScheme, Tooltip, Title, TitleOrder, Badge } from '@mantine/core'
import { Parisienne } from 'next/font/google'
import { IconMoonStars, IconPlant, IconShoppingCart, IconSun } from '@tabler/icons-react'
import ButtonSquareIcon from '../../common/ButtonSquareIcon'
import { isScreenLarger, useResolveSizes } from '@/app/helpers/hooks'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import styles from '../../common/ButtonSquareIcon.module.css'
import { ShoppingCartContext } from '@/app/components/catalog/shopping-cart/ShoppingCartProvider'
import { LayoutContext } from '@/app/components/layout/LayoutContextProvider'

type IProps = {
  isBurgerOpen?: boolean
  onBurgerClick?: () => void
  showBurger?: boolean
  showLogo?: boolean
}

const headerFont = Parisienne({
  subsets: ['latin'],
  weight: '400',
})

const resolveSizes = (breakpoint: number) => {
  const result = { title: 1 as TitleOrder, logo: { height: '100%' } }
  if (!isScreenLarger(breakpoint, 'xs')) {
    result.title = 3 as TitleOrder
    result.logo.height = '80%'
  }
  return result
}

const Header = ({ isBurgerOpen, onBurgerClick, showBurger = true, showLogo = true }: IProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme == 'dark'
  const { cart } = useContext(ShoppingCartContext)
  const layout = useContext(LayoutContext)
  const sizes = useResolveSizes(resolveSizes)
  const router = useRouter()

  const renderDarkModeToggle = () => (
    <Tooltip label="Light/Dark">
      <ButtonSquareIcon
        styles={{ color: isDark ? 'yellow' : 'grey' }}
        onClick={toggleColorScheme}
        icon={isDark ? <IconSun /> : <IconMoonStars />}
      />
    </Tooltip>
  )

  const renderShoppingCartButton = () => {
    return (
      <>
        <ButtonSquareIcon icon={<IconShoppingCart />} className={styles.container} onClick={layout.shoppingCart.toggle}>
          {!!cart.items.length && <Badge className={styles.badge}>{cart.items.length}</Badge>}
        </ButtonSquareIcon>
      </>
    )
  }

  return (
    <Group justify="space-between" h="100%" px="md">
      <Group h="100%">
        {showBurger && <Burger opened={isBurgerOpen} onClick={onBurgerClick} size="sm" />}
        {showLogo && (
          <Image
            src={'/assets/img/chengpin-logo.svg'}
            onClick={() => router.push('/')}
            style={{ cursor: 'pointer' }}
            h={sizes.logo.height}
            fit="contain"
            alt="header-logo"
          />
        )}
      </Group>

      <Group>
        <Title order={sizes.title} style={{ ...headerFont.style, display: 'flex', flex: 1, alignItems: 'center' }}>
          Chengpin
          <IconPlant />
        </Title>
      </Group>

      <Group>
        {renderShoppingCartButton()}
        {renderDarkModeToggle()}
      </Group>
    </Group>
  )
}
export default Header
