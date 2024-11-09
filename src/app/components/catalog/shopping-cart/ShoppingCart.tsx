import {
  AvailabilityWithProduct,
  ShoppingCartContext,
} from '@/app/components/catalog/shopping-cart/ShoppingCartProvider'
import CustomNumberInput from '@/app/components/common/CustomNumberInput'
import { LayoutContext } from '@/app/components/layout/LayoutContextProvider'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { Drawer, Group, Image, Title, Text, Divider, Stack } from '@mantine/core'
import { IconShoppingBag, IconTrash } from '@tabler/icons-react'
import { useContext } from 'react'

const renderCartItems = (items: AvailabilityWithProduct[]) =>
  items.map((item, idx) => (
    <>
      <Divider key={`Cart divider ${idx}`} />
      <Group
        key={`Cart Group ${idx}`}
        styles={{
          root: { display: 'flex', flexDirection: 'row' },
        }}
        mt={16}
        mb={16}
      >
        <Image src={item.productInfo.coverImg} alt={`Cart item ${item.productInfo.name}`} mah={110} />
        <Group>
          <Stack>
            <Title order={4}>
              {item.productInfo.name}
              <IconTrash />
            </Title>
            <Text fw={500}>{item.name}</Text>
            <CustomNumberInput
              fw={500}
              w={80}
              value={item.buyingQty}
              setValue={(value: number) => {
                console.log(value)
              }}
            />
          </Stack>
          <Text fw={500}>{BRL.format(item.price)}</Text>
        </Group>
      </Group>
    </>
  ))

const renderCartHeader = () => {
  return (
    <>
      <Title order={3}>Meu Carrinho</Title>
      <IconShoppingBag style={{ marginLeft: 4 }} />
    </>
  )
}

const ShoppingCart = () => {
  const { cart } = useContext(ShoppingCartContext)
  const { shoppingCart } = useContext(LayoutContext)

  return (
    <Drawer
      title={renderCartHeader()}
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
      <Divider key={`First divider`} />
      {renderCartItems(cart.items)}
    </Drawer>
  )
}

export default ShoppingCart
