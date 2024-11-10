import { ShoppingCartContext, ShoppingCartType } from '@/app/components/catalog/shopping-cart/ShoppingCartProvider'
import ButtonSquareIcon from '@/app/components/common/ButtonSquareIcon'
import CustomNumberInput from '@/app/components/common/CustomNumberInput'
import { LayoutContext } from '@/app/components/layout/LayoutContextProvider'
import { isScreenSmaller, useResolveSizes } from '@/app/helpers/hooks'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { Drawer, Group, Image, Text, Divider, Stack, AspectRatio, Button } from '@mantine/core'
import { IconShoppingBag, IconShoppingCartOff, IconTrash, IconTruck } from '@tabler/icons-react'
import { useContext } from 'react'

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

const resolveSizes = (currentBp: number) => {
  const sizes = {
    drawer: { title: { text: 'xl' }, icon: 24 },
    item: {
      availabilityFontSize: 'sm',
      qtyInputWidth: 80,
      container: {
        h: '100px',
      },
      icon: {
        trash: 22,
      },
    },
  }

  if (isScreenSmaller(currentBp, 'xs')) {
    sizes.item.icon.trash = 20
    sizes.item.availabilityFontSize = 'xs'
    sizes.item.qtyInputWidth = 60
  }

  return sizes
}

const calculateTotal = (cart: ShoppingCartType) => {
  return cart.items?.reduce((acc, item) => (acc += item.buyingQty * item.price), 0) || 0
}

const ShoppingCart = () => {
  const { cart, deleteItem, setQty } = useContext(ShoppingCartContext)
  const { shoppingCart } = useContext(LayoutContext)
  const sizes = useResolveSizes(resolveSizes)

  const renderCartItems = (onTrashClick: (id: string) => void) =>
    cart.items.map((item, idx) => (
      <>
        <Divider key={`Cart divider ${idx}`} m={0} />
        <Group key={`Cart container ${idx}`} h={sizes.item.container.h} mt={'xl'} mb={'xl'}>
          <AspectRatio h="100%">
            <Image src={item.productInfo.coverImg} alt={`Cart item ${item.productInfo.name}`} h="100%" w="70px" />
          </AspectRatio>
          <Stack flex={1} style={{ flexShrink: 1 }} h="100%">
            <Group justify="space-between">
              <Text fw={900} maw="75%" lineClamp={1}>
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
              <Text fw={500} size={sizes.item.availabilityFontSize}>
                {item.name}
              </Text>
              <CustomNumberInput
                fw={500}
                w={sizes.item.qtyInputWidth}
                min={1}
                max={item.qty}
                allowDecimal={false}
                isPlusMinusButtons={false}
                size="sm"
                value={item.buyingQty}
                setValue={(value: number) => {
                  setQty(item.id, value)
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

  const renderEmptyCart = () => {
    return (
      <Stack h={'85%'} justify="center" align="center">
        <IconShoppingCartOff width="100%" height={'10%'} color="grey" opacity={0.7} />
        <Text c="grey">Seu carrinho ainda está vazio...</Text>
      </Stack>
    )
  }

  const renderCartContent = () => {
    return (
      <>
        {renderCartItems(deleteItem)}
        <Divider />
        <Group justify="space-between" mt={'xl'}>
          <Text size="md">Total:</Text>
          <Text size="md">{BRL.format(calculateTotal(cart))}</Text>
        </Group>
        <Group mt={'sm'}>
          <Button w="100%" onClick={() => {}} leftSection={<IconTruck />} size="md">
            Finalizar pedido
          </Button>
        </Group>
      </>
    )
  }

  return (
    <Drawer
      key={'Shopping cart drawre container'}
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
        body: {
          height: '100%',
        },
      }}
    >
      <Divider />
      {cart.items.length ? renderCartContent() : renderEmptyCart()}
    </Drawer>
  )
}

export default ShoppingCart
