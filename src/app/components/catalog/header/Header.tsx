import { Group, Burger, Image, useMantineColorScheme, Tooltip, Title, TitleOrder, Indicator } from '@mantine/core'
import { Parisienne } from 'next/font/google'
import { IconMoonStars, IconPlant, IconShoppingCart, IconSun } from '@tabler/icons-react'
import ButtonSquareIcon from '../../common/ButtonSquareIcon'
import { isScreenSmaller, useResolveSizes } from '@/app/helpers/hooks'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import btnSquareStyles from '../../common/ButtonSquareIcon.module.css'
import styles from './Header.module.css'
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
  const sizes = { title: { show: true, size: 1 as TitleOrder, iconSize: 22 }, logo: { height: '100%' } }
  if (isScreenSmaller(breakpoint, 'xs')) {
    sizes.title.show = false
    sizes.title.size = 3 as TitleOrder
    sizes.title.iconSize = 0
    sizes.logo.height = '80%'
  }
  return sizes
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
    const btn = () => (
      <ButtonSquareIcon
        icon={<IconShoppingCart />}
        className={btnSquareStyles.container}
        onClick={layout.shoppingCart.toggle}
      />
    )
    if (cart.items.length)
      return (
        <Indicator
          inline
          processing
          color="red"
          className={styles.shoppingCartIndicator}
          offset={6}
          label={cart.items.length}
          size={18}
          onClick={layout.shoppingCart.toggle}
        >
          {btn()}
        </Indicator>
      )
    return btn()
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
        {sizes.title.show && (
          <Title
            order={sizes.title.size}
            style={{ ...headerFont.style, display: 'flex', flex: 1, alignItems: 'center' }}
          >
            Chengpin
            <IconPlant size={sizes.title.iconSize} />
          </Title>
        )}
      </Group>

      <Group>
        {renderShoppingCartButton()}
        {renderDarkModeToggle()}
      </Group>
    </Group>
  )
}
export default Header
