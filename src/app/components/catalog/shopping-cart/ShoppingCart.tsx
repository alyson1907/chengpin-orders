import {
  AvailabilityWithProduct,
  ShoppingCartContext,
  ShoppingCartType,
} from '@/app/components/catalog/shopping-cart/ShoppingCartProvider'
import ButtonSquareIcon from '@/app/components/common/ButtonSquareIcon'
import CustomNumberInput from '@/app/components/common/CustomNumberInput'
import { LayoutContext } from '@/app/components/layout/LayoutContextProvider'
import { useResolveSizes } from '@/app/helpers/hooks'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { Drawer, Group, Image, Text, Divider, Stack, AspectRatio } from '@mantine/core'
import { IconShoppingBag, IconTrash } from '@tabler/icons-react'
import { useContext } from 'react'

const renderCartItems = (
  items: AvailabilityWithProduct[],
  sizes: Record<string, any>,
  onTrashClick: (id: string) => void
) =>
  items.map((item, idx) => (
    <>
      <Divider key={`Cart divider ${idx}`} m={0} />
      <Group key={`Cart container ${idx}`} h={sizes.item.container.h} mt={'xs'} mb={'xs'}>
        <AspectRatio h="100%">
          <Image
            src={item.productInfo.coverImg}
            alt={`Cart item ${item.productInfo.name}`}
            h="100%"
            w="70px"
            bg={'blue'}
          />
        </AspectRatio>
        <Stack flex={1} style={{ flexShrink: 1 }} h="100%">
          <Group justify="space-between">
            <Text fw={900} maw={'70%'} truncate>
              {item.productInfo.name}
            </Text>
            <ButtonSquareIcon
              icon={<IconTrash />}
              onClick={() => onTrashClick(item.id)}
              size={sizes.item.icon.trash}
              styles={{ color: 'grey' }}
            />
          </Group>
          <Group justify="space-between">
            <Text fw={500} size="sm">
              {item.name}
            </Text>
            <CustomNumberInput
              fw={500}
              w={65}
              size="xs"
              value={item.buyingQty}
              setValue={(value: number) => {
                console.log(value)
              }}
            />
          </Group>
          <Group justify="flex-end">
            <Text fw={500} size="sm">
              {BRL.format(item.price)}
            </Text>
          </Group>
        </Stack>
      </Group>
    </>
  ))

const renderCartHeader = (sizes: Record<string, any>) => {
  return (
    <>
      <Text size={sizes.drawer.title.text} fw={800}>
        Meu Carrinho
      </Text>
      <IconShoppingBag style={{ marginLeft: 4 }} size={sizes.drawer.icon} />
    </>
  )
}

const resolveSizes = () => {
  const sizes = {
    drawer: { title: { text: 'xl' }, icon: 24 },
    item: {
      container: {
        h: '100px',
      },
      icon: {
        trash: 22,
      },
    },
  }
  return sizes
}

const calculateTotal = (cart: ShoppingCartType) => {
  return cart.items?.reduce((acc, item) => (acc += item.buyingQty * item.price), 0) || 0
}

const ShoppingCart = () => {
  const { cart, deleteItem } = useContext(ShoppingCartContext)
  const { shoppingCart } = useContext(LayoutContext)
  const sizes = useResolveSizes(resolveSizes)

  return (
    <Drawer
      title={renderCartHeader(sizes)}
      position="right"
      opened={shoppingCart.isOpen}
      onClose={shoppingCart.close}
      withCloseButton={true}
      withOverlay
      styles={{
        header: { alignItems: 'center', justifyContent: 'center' },
        title: {
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
        },
      }}
    >
      {renderCartItems(cart.items, sizes, deleteItem)}
      <Divider />
      <Group justify="space-between" mt={'xl'}>
        <Text size="xl">Total:</Text>
        <Text size="xl">{BRL.format(calculateTotal(cart))}</Text>
      </Group>
    </Drawer>
  )
}

export default ShoppingCart
