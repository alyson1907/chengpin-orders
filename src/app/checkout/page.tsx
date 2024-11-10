'use client'
import { useContext, useEffect, useState } from 'react'
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
import { IconCheck, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { isScreenSmaller, useResolveSizes } from '@/app/helpers/hooks'

type SizesType = {
  text: MantineSize
  itemName: MantineSize
  btn: { icon: number }
  stepper: {
    size: MantineSize
    icon: number
    title: TitleOrder
    orientation: 'horizontal' | 'vertical' | undefined
  }
  summary: { imgw: string; imgh: string; imgRatio: number }
}

const resolveSizes = (currentBp: number) => {
  const sizes: SizesType = {
    text: 'md',
    itemName: 'lg',
    btn: { icon: 16 },
    stepper: { size: 'md', icon: 36, title: 4, orientation: 'horizontal' },
    summary: { imgw: '60px', imgh: 'auto', imgRatio: 9 / 16 },
  }

  if (isScreenSmaller(currentBp, 'xs')) {
    sizes.btn.icon = 14
    sizes.text = 'sm'
    sizes.itemName = 'md'
    sizes.stepper.size = 'md'
    sizes.stepper.icon = 28
    sizes.stepper.title = 5
    sizes.stepper.orientation = 'vertical'
    sizes.summary.imgw = '45px'
    sizes.summary.imgRatio = 6 / 16
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
  const { cart } = useContext(ShoppingCartContext)
  const layout = useContext(LayoutContext)
  const closeNavbar = layout.navbar.close
  const sizes = useResolveSizes(resolveSizes) as SizesType
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
    },
    validate: {
      firstName: (value) => isNotValid(value, z.string().min(1)),
      lastName: (value) => isNotValid(value, z.string().min(1)),
      phone: (value) => isNotValid(value, z.string().regex(mobilePhoneRegex)),
      email: (value) => isNotValid(value, z.string().email()),
    },
    transformValues: (values) => {
      const { firstName, lastName, phone, email } = values
      return {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim().replaceAll(/\D/g, ''),
        email: email.trim(),
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

  const renderFormStep = () => (
    <Stepper.Step label="Informações" description="Nome e contato">
      <Title order={sizes.stepper.title}>Passo 1: Preencha suas informações</Title>
      <form onSubmit={form.onSubmit(handleSubmit)} id="checkout-form">
        <InputBase
          mt="md"
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
          mask={[{ mask: '(00) 00000-0000' }]}
          withAsterisk
          {...form.getInputProps('phone')}
        />
        <InputBase
          key={form.key('email')}
          label="Email"
          placeholder="jose@exemplo.com"
          withAsterisk
          {...form.getInputProps('email')}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit" rightSection={<IconChevronRight size={sizes.btn.icon} />}>
            Próximo
          </Button>
        </Group>
      </form>
    </Stepper.Step>
  )

  const renderSummaryStep = () => {
    return (
      <Stepper.Step label="Resumo" description="Confirme a compra">
        <Title order={sizes.stepper.title}>Passo 2: Resumo do Pedido</Title>
        <Box mt="md">
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
                    Total {BRL.format(item.price * item.buyingQty)}
                  </Text>
                </Group>
              </Stack>
            </Group>
          ))}
          <Text size="lg" fw={700}>
            Total: {BRL.format(totalValue(cart))}
          </Text>
          <Text mt="md"></Text>
        </Box>
        <Group justify="space-between" mt="md">
          <Button variant="outline" onClick={handlePrevious} leftSection={<IconChevronLeft size={sizes.btn.icon} />}>
            Voltar
          </Button>
          <Button onClick={handleNext} rightSection={<IconCheck size={sizes.btn.icon} />}>
            Finalizar
          </Button>
        </Group>
      </Stepper.Step>
    )
  }

  const renderOrderSentStep = () => (
    <Stepper.Completed>
      <Title order={sizes.stepper.title}>Pronto! Pedido enviado!</Title>
      <Text mt="md" size={sizes.text}>
        Logo entraremos em contato para a confirmação do mesmo
      </Text>
      <Text mt="md" size={sizes.text}>
        A Chengpin agradece sua compra!
      </Text>
    </Stepper.Completed>
  )

  return (
    <Container size="xs" p="md" mt="xl">
      <Box maw={500} mx="auto">
        <Stepper
          orientation={sizes.stepper.orientation}
          active={activeStep}
          onStepClick={setActiveStep}
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
