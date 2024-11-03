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
import { notFound, useParams } from 'next/navigation'
import useSWR from 'swr'
import { ProductAvailability } from '@prisma/client'
import Header from '@/app/components/catalog/header/Header'
import { useHeadroom } from '@mantine/hooks'
import React from 'react'
import { notifications } from '@mantine/notifications'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import CustomNumberInput from '@/app/components/common/CustomNumberInput'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'
import { isScreenLarger, useResolveSizes } from '@/app/helpers/hooks'

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

const renderThumbnails = (imgs: string[] = [], currentSlide: number, sizes: any) => {
  return (
    <Group mt="md" m="xs" justify="center">
      {imgs.map((src, index) => (
        <AspectRatio key={index}>
          <Image
            key={index}
            src={src}
            alt={`Thumbnail ${index + 1}`}
            height={sizes.thumbnail}
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

const resolveSizes = (breakpoint: number) => {
  const gridColSize = () => {
    if (isScreenLarger(breakpoint, 'sm'))
      return {
        col1: 7,
        col2: 5,
      }
    return {
      col1: 12,
      col2: 12,
    }
  }
  const carouselImgSize = () => {
    if (isScreenLarger(breakpoint, 'sm')) return 600
    if (isScreenLarger(breakpoint, 'xs')) return 500
    if (isScreenLarger(breakpoint, 'base')) return 400
  }

  const thumbnailSize = () => (isScreenLarger(breakpoint, 'sm') ? 80 : 60)
  return {
    grid: gridColSize(),
    thumbnail: thumbnailSize(),
    carousel: {
      img: carouselImgSize(),
    },
  }
}

export default function ProductDetailsPage() {
  const autoplay = useRef(Autoplay({ delay: 5000 }))
  const pinned = useHeadroom({ fixedAt: 120 })
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const { productId } = useParams<{ productId: string }>()
  const sizes = useResolveSizes(resolveSizes)

  const { data: product, error, isLoading } = useSWR(['/api/product', productId], fetcher)
  const [firstImageLoaded, setImageLoaded] = useState(false)
  const [selected, setSelected] = useState<ProductAvailability>({} as ProductAvailability)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (selected.id || isLoading) return
    setSelected(product?.availability[0])
  }, [selected, isLoading, setSelected, product])

  if (isLoading) return <DefaultLoadingOverlay />
  if (error) {
    notifications.show({
      title: 'Problema ao carregar detalhes do produto',
      message: 'Por favor, verifique a conexão',
    })
  }
  if (!product) return notFound()

  return (
    <AppShell header={{ height: 80, collapsed: !pinned, offset: true }} padding={'md'}>
      <DefaultLoadingOverlay visible={!firstImageLoaded} />

      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" mt="lg">
          <Grid gutter="md">
            {/* Left Side: Image Carousel */}
            <Grid.Col span={sizes.grid.col1}>
              <Paper shadow="md" p="md">
                <Carousel
                  onSlideChange={setCurrentSlide}
                  plugins={[autoplay.current]}
                  onMouseEnter={autoplay.current.stop}
                  onMouseLeave={autoplay.current.reset}
                  withIndicators
                  height={sizes.carousel.img}
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
                        onLoad={() => index === 0 && setImageLoaded(true)}
                      />
                    </Carousel.Slide>
                  ))}
                </Carousel>
                {renderThumbnails(product?.imgs, currentSlide, sizes)}
              </Paper>
            </Grid.Col>

            {/* Right Side: Product Info */}
            <Grid.Col span={sizes.grid.col2} style={{ textAlign: 'justify' }}>
              <Stack m="md">
                <Title order={2}>{product.name}</Title>
                {renderStockBadge(product?.availability)}
                <Text size="md" c="dimmed">
                  {product.description}
                </Text>
                <Divider />
                {renderAvailabeSection(product?.availability, selected, setSelected)}

                {/* Product Details */}
                <Text
                  size="xl"
                  fw={700}
                  mt="md"
                  c={colorScheme === 'dark' ? theme.colors.green[4] : theme.colors.green[9]}
                >
                  Preço: {BRL.format(selected.price || 0)}
                </Text>
                {/* Quantity Selector and Buttons */}
                <Stack>
                  <Group>
                    <Text>Quantidade</Text>
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
                  </Group>
                  <Button leftSection={<IconShoppingCart />} size="md" mt="sm" variant="filled">
                    Adicionar ao Carrinho
                  </Button>
                  <Text c="dimmed" size="sm">
                    OBS: Após o pedido, entraremos em contato para confirmação do mesmo
                  </Text>
                </Stack>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
