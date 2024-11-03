'use client'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import {
  Container,
  Grid,
  Paper,
  Image,
  Group,
  Badge,
  Text,
  Title,
  Stack,
  Button,
  Divider,
  AppShell,
  AspectRatio,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core'
import { Carousel } from '@mantine/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { IconShoppingCart } from '@tabler/icons-react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { ProductAvailability } from '@prisma/client'
import Header from '@/app/components/catalog/header/Header'
import { useHeadroom } from '@mantine/hooks'
import React from 'react'
import { notifications } from '@mantine/notifications'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import CustomNumberInput from '@/app/components/common/CustomNumberInput'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'

const fetcher = async ([url, productId]: [string, string]) => {
  const qs = new URLSearchParams({
    id: productId,
  })
  const response = await fetch(`${url}?${qs}`).then((res) => res.json())
  return response?.data?.entries?.shift()
}

const renderStockBadge = (availability: ProductAvailability[] = []) => {
  const totalQty = availability.reduce((acc, item) => (acc += item.qty), 0)
  const isSelling = !!totalQty
  return (
    <Group m="xs">
      <Badge color={isSelling ? 'matcha' : 'red'}>{isSelling ? 'Em Estoque' : 'Indisponível'}</Badge>
      <Text c="dimmed" size="sm">
        {totalQty} à venda
      </Text>
    </Group>
  )
}

const renderThumbnails = (imgs: string[] = [], currentSlide: number) => {
  return (
    <Group mt="md" m="xs" justify="center">
      {imgs.map((src, index) => (
        <AspectRatio key={index}>
          <Image
            key={index}
            src={src}
            alt={`Thumbnail ${index + 1}`}
            height={80}
            radius="sm"
            style={{ scale: currentSlide === index ? 1.2 : 1, transition: '200ms' }}
          />
        </AspectRatio>
      ))}
    </Group>
  )
}

const renderAvailabeSection = (
  availability: ProductAvailability[] = [],
  selected: ProductAvailability,
  setSelected: Dispatch<SetStateAction<ProductAvailability>>
) => {
  const sorted = availability.sort((a, b) => a.price - b.price)
  return (
    <>
      <Title order={5} mt="sm">
        Disponíveis:
      </Title>
      <Group m="xs">
        {sorted.map((available, idx) => (
          <Button
            key={`Availability ${idx}`}
            onClick={() => setSelected(available)}
            radius="xl"
            variant={selected.id === available.id ? 'filled' : 'light'}
          >
            {available.name}
          </Button>
        ))}
      </Group>
    </>
  )
}

export default function ProductDetailsPage() {
  const autoplay = useRef(Autoplay({ delay: 5000 }))
  const pinned = useHeadroom({ fixedAt: 120 })
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const { productId } = useParams<{ productId: string }>()

  const { data: product, error, isLoading } = useSWR(['/api/product', productId], fetcher)
  const [imagesLoaded, setImagesLoaded] = useState(0)
  const [selected, setSelected] = useState<ProductAvailability>({} as ProductAvailability)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (selected.id || isLoading) return
    setSelected(product?.availability[0])
    console.log(selected)
  }, [selected, isLoading, setSelected, product?.availability])

  if (isLoading) return <DefaultLoadingOverlay />
  if (error) {
    notifications.show({
      title: 'Problema ao carregar detalhes do produto',
      message: 'Por favor, verifique a conexão',
    })
  }

  return (
    <AppShell header={{ height: 80, collapsed: !pinned, offset: true }} padding={'md'}>
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <DefaultLoadingOverlay visible={imagesLoaded < product.imgs.length} />
      <AppShell.Main>
        <Container size="lg" mt="lg">
          <Grid gutter="md">
            {/* Left Side: Image Carousel */}
            <Grid.Col span={7}>
              <Paper shadow="md" p="md">
                <Carousel
                  onSlideChange={setCurrentSlide}
                  plugins={[autoplay.current]}
                  onMouseEnter={autoplay.current.stop}
                  onMouseLeave={autoplay.current.reset}
                  withIndicators
                  height={600}
                  slideSize="100%"
                  slideGap="md"
                  loop
                >
                  {product?.imgs.map((src, index) => (
                    <Carousel.Slide key={index}>
                      <Image
                        src={src}
                        alt={`Product image ${index + 1}`}
                        fit="cover"
                        height="100%"
                        radius="sm"
                        onLoad={() => setImagesLoaded(imagesLoaded + 1)}
                      />
                    </Carousel.Slide>
                  ))}
                </Carousel>
                {renderThumbnails(product?.imgs, currentSlide)}
              </Paper>
            </Grid.Col>

            {/* Right Side: Product Info */}
            <Grid.Col span={5} style={{ textAlign: 'justify' }}>
              <Stack m="md">
                <Title order={2}>{product.name}</Title>
                {renderStockBadge(product?.availability)}
                <Text size="md" c="dimmed">
                  {product.description}
                </Text>
                <Divider />
                {renderAvailabeSection(product?.availability, selected, setSelected)}

                {/* Product Details */}
                {/* <Stack m="xs" mt="sm">
                  <Text size="sm">• Material: Leather</Text>
                  <Text size="sm">• Color: Brown</Text>
                  <Text size="sm">• Size: 23 inch x 31 inch</Text>
                  <Text size="sm">• Size: 23 inch x 31 inch</Text>
                  <Text size="sm">• Weight: 1200 grams</Text>
                </Stack> */}

                {/* Price Section */}
                <Group mt="md">
                  <Text size="xl" fw={700} c={colorScheme === 'dark' ? theme.colors.green[4] : theme.colors.green[9]}>
                    Preço: {BRL.format(selected.price || 0)}
                  </Text>
                </Group>

                {/* Quantity Selector and Buttons */}
                <Group mt="sm">
                  <Text>Quantidade</Text>
                  {/* <NumberInput
                    value={quantity}
                    onChange={(val) => setQuantity(Number(val) || 1)}
                    min={1}
                    max={selected.qty}
                    step={1}
                    stepHoldDelay={300}
                    stepHoldInterval={50}
                    styles={{ input: { width: '4rem' } }}
                  /> */}
                  <CustomNumberInput
                    value={quantity}
                    setValue={setQuantity}
                    min={1}
                    max={selected.qty}
                    step={1}
                    stepHoldDelay={200}
                    allowDecimal={false}
                    w={80}
                    styles={{
                      input: {
                        textAlign: 'center',
                        paddingRight: 0,
                        paddingLeft: 0,
                      },
                    }}
                  />
                  <Text c="dimmed" size="sm">
                    {`+${selected.qty} disponíveis`}
                  </Text>
                  <Button leftSection={<IconShoppingCart />} size="md" variant="filled">
                    Adicionar ao Carrinho
                  </Button>
                  <Text c="dimmed" size="sm">
                    OBS: Após o pedido, entraremos em contato para confirmação do mesmo
                  </Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
