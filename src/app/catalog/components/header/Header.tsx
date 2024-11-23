import { Group, Burger, Image, useMantineColorScheme, Tooltip, Title, TitleOrder, Indicator } from '@mantine/core'
import { Parisienne } from 'next/font/google'
import { IconChevronLeft, IconMoonStars, IconPlant, IconShoppingCart, IconSun } from '@tabler/icons-react'
import ButtonSquareIcon from '@/app/common/ButtonSquareIcon'
import btnSquareStyles from '@/app/common/ButtonSquareIcon.module.css'
import { isScreenSmaller, useResolveSizes } from '@/app/helpers/hooks'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import styles from './Header.module.css'
import { ShoppingCartContext } from '@/app/catalog/components/shopping-cart/ShoppingCartProvider'
import { LayoutContext } from '@/app/catalog/layout/LayoutContextProvider'

type IProps = {
  isBurgerOpen?: boolean
  onBurgerClick?: () => void
  showBurger?: boolean
  showLogo?: boolean
  showBackBtn?: boolean
}

const headerFont = Parisienne({
  subsets: ['latin'],
  weight: '400',
})

const resolveSizes = (breakpoint: number) => {
  const sizes = {
    title: { show: true, size: 1 as TitleOrder, iconSize: 22 },
    logo: { height: '90%' },
    btn: {
      container: 40,
      icon: 28,
    },
  }
  if (isScreenSmaller(breakpoint, 'xs')) {
    sizes.title.show = true
    sizes.title.size = 3 as TitleOrder
    sizes.title.iconSize = 0
    sizes.logo.height = '0%'
    sizes.btn.container = 32
    sizes.btn.icon = 22
  }
  return sizes
}

const Header = ({
  isBurgerOpen,
  onBurgerClick,
  showBurger = true,
  showBackBtn = !showBurger,
  showLogo = true,
}: IProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme == 'dark'
  const { cart } = useContext(ShoppingCartContext)
  const layout = useContext(LayoutContext)
  const sizes = useResolveSizes(resolveSizes)
  const router = useRouter()

  const renderDarkModeToggle = () => (
    <Tooltip label="Light/Dark">
      <ButtonSquareIcon
        size={sizes.btn.container}
        styles={{ color: isDark ? 'yellow' : 'grey' }}
        onClick={toggleColorScheme}
        icon={isDark ? <IconSun size={sizes.btn.icon} /> : <IconMoonStars size={sizes.btn.icon} />}
      />
    </Tooltip>
  )

  const renderShoppingCartButton = () => {
    const btn = () => (
      <ButtonSquareIcon
        size={sizes.btn.container}
        icon={<IconShoppingCart size={sizes.btn.icon} />}
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

  const handleBackBtn = () => {
    if (window.history?.length > 2) return router.back()
    return router.replace('/')
  }

  return (
    <Group justify="space-between" h="100%" px="md">
      <Group h="100%">
        {showBurger && <Burger opened={isBurgerOpen} onClick={onBurgerClick} size="sm" />}
        {showBackBtn && (
          // <IconChevronLeft size={sizes.btn.icon} color={isDark ? theme.colors.matcha[2] : theme.colors.matcha[5]} />
          <ButtonSquareIcon
            size={sizes.btn.container}
            onClick={handleBackBtn}
            styles={{ variant: 'transparent' }}
            icon={<IconChevronLeft size={sizes.btn.icon} />}
          ></ButtonSquareIcon>
        )}
        {showLogo && (
          <Image
            src={'/assets/img/chengpin-logo.svg'}
            onClick={() => router.push('/catalog')}
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
