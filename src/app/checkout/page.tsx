'use client'
import React, { useContext, useEffect, useState } from 'react'
import { IMaskInput } from 'react-imask'
import {
  AspectRatio,
  Box,
  Button,
  Container,
  Group,
  InputBase,
  Stack,
  Stepper,
  Text,
  Title,
  Image,
  TitleOrder,
  MantineSize,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { ShoppingCartContext, ShoppingCartType } from '@/app/components/catalog/shopping-cart/ShoppingCartProvider'
import { z } from 'zod'
import { LayoutContext } from '@/app/components/layout/LayoutContextProvider'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import {
  IconCheck,
  IconChecklist,
  IconChevronLeft,
  IconChevronRight,
  IconGhost,
  IconLeaf,
  IconShoppingBag,
} from '@tabler/icons-react'
import { isScreenSmaller, useResolveSizes } from '@/app/helpers/hooks'
import { useRouter } from 'next/navigation'

type SizesType = {
  text: MantineSize
  itemName: MantineSize
  title: {
    icon: number
  }
  btn: { icon: number }
  stepper: {
    size: MantineSize
    icon: number
    title: TitleOrder
    orientation: 'horizontal' | 'vertical' | undefined
    mt: MantineSize | string
  }
  summary: { imgw: string; imgh: string; imgRatio: number; placeholder: { icon: string; text: MantineSize } }
  orderComplete: { logo: { maw: number | string } }
}

const resolveSizes = (currentBp: number) => {
  const sizes: SizesType = {
    text: 'sm',
    itemName: 'md',
    title: { icon: 24 },
    btn: { icon: 16 },
    stepper: { size: 'md', icon: 36, title: 4, orientation: 'horizontal', mt: 'xl' },
    summary: { imgw: '55px', imgh: 'auto', imgRatio: 9 / 16, placeholder: { icon: '25%', text: 'lg' } },
    orderComplete: { logo: { maw: 150 } },
  }

  if (isScreenSmaller(currentBp, 'xs')) {
    sizes.title.icon = 0
    sizes.btn.icon = 14
    sizes.text = 'sm'
    sizes.itemName = 'md'

    sizes.stepper.size = 'md'
    sizes.stepper.icon = 28
    sizes.stepper.title = 5
    sizes.stepper.orientation = 'vertical'
    sizes.stepper.mt = '0'

    sizes.summary.imgw = '45px'
    sizes.summary.imgRatio = 6 / 16
    sizes.summary.placeholder.icon = '30%'
    sizes.summary.placeholder.text = 'md'

    sizes.orderComplete.logo.maw = 90
  }
  return sizes
}

const mobilePhoneRegex = /(?:([1-9]{2})|([0-9]{3})?)\ (\d{4,5})\-(\d{4})/i
const totalValue = (cart: ShoppingCartType) => cart.items.reduce((acc, item) => acc + item.price * item.buyingQty, 0)
const isNotValid = (value: any, schema: z.Schema) => {
  const isValid = schema.safeParse(value).success
  return !isValid
}

const CheckoutPage = () => {
  const [activeStep, setActiveStep] = useState(0)
  const { cart, clearCart } = useContext(ShoppingCartContext)
  const layout = useContext(LayoutContext)
  const closeNavbar = layout.navbar.close
  const sizes = useResolveSizes(resolveSizes) as SizesType
  const router = useRouter()
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      buyerKey: '',
      firstName: '',
      lastName: '',
      phone: '',
    },

    validate: {
      buyerKey: (value) => isNotValid(value, z.string().regex(/\d/g).max(6)) && 'A chave deve ser menor que 6 dígitos',
      firstName: (value) => isNotValid(value, z.string().min(1)) && 'Primeiro nome não pode ser vazio',
      lastName: (value) => isNotValid(value, z.string().min(1)) && 'Sobrenome não pode ser vazio',
      phone: (value) =>
        isNotValid(value, z.string().regex(mobilePhoneRegex)) && 'Whatsapp deve ser um número de telefone',
    },
    transformValues: (values) => {
      const { firstName, lastName, phone, buyerKey } = values
      return {
        buyerKey: buyerKey.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim().replaceAll(/\D/g, ''),
      }
    },
  })

  useEffect(() => {
    closeNavbar()
  }, [closeNavbar])

  const handleNext = () => setActiveStep((prev) => prev + 1)
  const handlePrevious = () => setActiveStep((prev) => prev - 1)
  const handleSubmit = (values, event) => {
    console.log(`handleSubmit`, JSON.stringify(values), event)
    handleNext()
  }
  const handleSendOrder = () => {
    // Send BE request
    clearCart()
    handleNext()
  }

  const renderFormStep = () => (
    <Stepper.Step label="Informações" description="Nome e contato">
      <Stack justify="space-between" mih={430}>
        <Box>
          <Title
            order={sizes.stepper.title}
            style={{ display: 'flex', alignItems: 'center' }}
            mt={sizes.stepper.mt}
            mb="md"
          >
            <IconChecklist size={sizes.title.icon} /> Passo 1: Preencha suas informações
          </Title>
          <form onSubmit={form.onSubmit(handleSubmit)} id="checkout-form">
            <InputBase
              key={form.key('buyerKey')}
              label="Chave do Comprador"
              placeholder="000000"
              withAsterisk
              {...form.getInputProps('buyerKey')}
              type="number"
            />
            <InputBase
              key={form.key('firstName')}
              label="Primeiro nome"
              placeholder="José Carlos"
              withAsterisk
              {...form.getInputProps('firstName')}
            />
            <InputBase
              key={form.key('lastName')}
              label="Sobrenome"
              placeholder="Silva Costa"
              withAsterisk
              {...form.getInputProps('lastName')}
            />
            <InputBase
              key={form.key('phone')}
              label="Whatsapp (celular)"
              placeholder="(15) 9999-3333"
              component={IMaskInput}
              mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
              withAsterisk
              {...form.getInputProps('phone')}
            />
          </form>
        </Box>
        <Group justify="flex-end" mt="md">
          <Button type="submit" form="checkout-form" rightSection={<IconChevronRight size={sizes.btn.icon} />}>
            Próximo
          </Button>
        </Group>
      </Stack>
    </Stepper.Step>
  )

  const renderSummaryStep = () => {
    const isCartEmpty = !cart.items.length
    const cartInfo = (
      <>
        {cart.items.map((item, idx) => (
          <Group key={`Cart container ${idx}`} h={'auto'} mt={'xl'} mb={'xl'}>
            <AspectRatio h="100%" ratio={sizes.summary.imgRatio}>
              <Image
                src={item.productInfo.coverImg}
                alt={`Cart item ${item.productInfo.name}`}
                w={sizes.summary.imgw}
              />
            </AspectRatio>
            <Stack flex={1} style={{ flexShrink: 1 }} h="100%">
              <Group justify="space-between">
                <Text size={sizes.itemName} fw={900} maw="75%" lineClamp={1}>
                  {item.productInfo.name}
                </Text>
              </Group>
              <Group justify="flex-between">
                <Text size={sizes.text} fw={500}>
                  Quantidade: {item.buyingQty}
                </Text>
                <Text size={sizes.text} fw={500}>
                  {item.name}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size={sizes.text} fw={500}>
                  Valor unitário: {BRL.format(item.price)}
                </Text>
                <Text size={sizes.text} fw={900} c="matcha">
                  Total: {BRL.format(item.price * item.buyingQty)}
                </Text>
              </Group>
            </Stack>
          </Group>
        ))}
        <Group justify="flex-end">
          <Text size="lg" fw={700}>
            Total do pedido: {BRL.format(totalValue(cart))}
          </Text>
        </Group>
      </>
    )
    const emptyCartPlaceholder = (
      <Stack h={'100%'} w={'100%'} mih={300} justify="center" align="center">
        <IconGhost
          width={sizes.summary.placeholder.icon}
          height={sizes.summary.placeholder.icon}
          color="grey"
          opacity={0.7}
        />
        <Text c="grey" size={sizes.summary.placeholder.text}>
          Seu carrinho ainda está vazio...
        </Text>
      </Stack>
    )

    return (
      <Stepper.Step label="Resumo" description="Verifique sua compra">
        <Stack justify="space-between" mih={430}>
          <Box>
            <Title
              order={sizes.stepper.title}
              style={{ display: 'flex', alignItems: 'center' }}
              mt={sizes.stepper.mt}
              mb="md"
            >
              <IconShoppingBag size={sizes.title.icon} />
              Passo 2: Resumo do Pedido
            </Title>
            <Box mt="md">{isCartEmpty ? emptyCartPlaceholder : cartInfo}</Box>
          </Box>
          <Box>
            <Group justify="space-between" mt="md">
              <Button
                variant="outline"
                onClick={handlePrevious}
                leftSection={<IconChevronLeft size={sizes.btn.icon} />}
              >
                Voltar
              </Button>
              <Button
                onClick={handleSendOrder}
                rightSection={<IconCheck size={sizes.btn.icon} />}
                disabled={isCartEmpty}
              >
                Finalizar
              </Button>
            </Group>
          </Box>
        </Stack>
      </Stepper.Step>
    )
  }

  const renderOrderSentStep = () => (
    <Stepper.Completed>
      <Stack justify="space-between" mih={300}>
        <Box>
          <Title
            order={sizes.stepper.title}
            style={{ display: 'flex', alignItems: 'center' }}
            mt={sizes.stepper.mt}
            mb="md"
          >
            <IconCheck size={sizes.title.icon} />
            Tudo pronto, pedido enviado!
          </Title>
          <Text mt="md" size={sizes.text}>
            Logo entraremos em contato pelo telefone enviado para a confirmação do pedido
          </Text>
          <Text mt="sm" size={sizes.text}>
            A Chengpin agradece sua compra!
          </Text>
        </Box>
        <Button w={'100%'} leftSection={<IconLeaf />} onClick={() => router.push('/')}>
          Voltar ao catálogo
        </Button>
      </Stack>
    </Stepper.Completed>
  )

  return (
    <Container p="xl">
      <Box maw={500} mx="auto">
        <Stepper
          orientation={sizes.stepper.orientation}
          active={activeStep}
          size={sizes.stepper.size}
          iconSize={sizes.stepper.icon}
        >
          {renderFormStep()}
          {renderSummaryStep()}
          {renderOrderSentStep()}
        </Stepper>
      </Box>
    </Container>
  )
}

export default CheckoutPage
