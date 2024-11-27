'use client'
import { ShoppingCartContext } from '@/app/catalog/components/shopping-cart/ShoppingCartProvider'
import { LayoutContext } from '@/app/catalog/layout/LayoutContextProvider'
import CustomNumberInput from '@/app/common/CustomNumberInput'
import { DefaultLoadingOverlay } from '@/app/common/DefaultLoadingOverlay'
import { isScreenLarger, useResolveSizes } from '@/app/helpers/hooks'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { Carousel } from '@mantine/carousel'
import {
  Alert,
  AspectRatio,
  Badge,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Image,
  Paper,
  Popover,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { ProductAvailability } from '@prisma/client'
import { IconCheck, IconExclamationCircle, IconExclamationMark, IconShoppingCart } from '@tabler/icons-react'
import Autoplay from 'embla-carousel-autoplay'
import { EmblaCarouselType } from 'embla-carousel-react'
import { notFound, useParams } from 'next/navigation'
import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react'
import useSWR from 'swr'

const fetcher = async ([url, productId]: [string, string]) => {
  const qs = new URLSearchParams({
    id: productId,
  })
  const response = await fetch(`${url}?${qs}`).then((res) => res.json())
  return response?.data?.entries?.shift()
}

const renderStockBadge = (totalForSale = 0) => {
  const isSelling = !!totalForSale
  return (
    <Group m="xs">
      <Badge color={isSelling ? 'matcha' : 'red'}>{isSelling ? 'Em Estoque' : 'Indisponível'}</Badge>
      <Text c="dimmed" size="sm">
        {totalForSale} à venda
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
            disabled={available.qty <= 0}
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

const ProductDetailsPage = () => {
  // Globals
  const theme = useMantineTheme()
  const shoppingCart = useContext(ShoppingCartContext)
  const layoutContext = useContext(LayoutContext)
  const { colorScheme } = useMantineColorScheme()

  const autoplay = useRef(Autoplay({ delay: 5000 }))
  const [currentSlide, setCurrentSlide] = useState(0)
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null)
  const { productId } = useParams<{ productId: string }>()
  const sizes = useResolveSizes(resolveSizes)
  // Data
  const { data: product, error, isLoading } = useSWR(['/api/product', productId], fetcher)
  const [firstImageLoaded, setImageLoaded] = useState(false)

  const [selected, setSelected] = useState<ProductAvailability>({} as ProductAvailability)
  const [addQty, setAddQty] = useState(1)
  const [totalForSale, setTotalForSale] = useState(0)
  const [isQuantityError, setIsQuantityError] = useState(false)

  const handleAddToCart = () => {
    const currentQty = shoppingCart.cart.items.find(({ id }) => id === selected.id)?.buyingQty || 0
    const nextQty = currentQty + addQty
    if (nextQty > selected.qty) return setIsQuantityError(true)
    const added = shoppingCart.addItem(product, { ...selected, buyingQty: currentQty }, addQty)
    notifications.show({
      title: `${product?.name} - ${selected.name} (x${added.buyingQty})`,
      message: 'Produto adicionado ao carrinho!',
      icon: <IconCheck />,
      position: 'top-center',
    })
  }

  const renderQuantitySelector = () => {
    return (
      <Group>
        <Text>Quantidade</Text>
        <Popover width={'auto'} position="top" withArrow shadow="md" opened={isQuantityError}>
          <Popover.Target>
            <CustomNumberInput
              disabled={!totalForSale}
              error={isQuantityError}
              value={addQty}
              setValue={setAddQty}
              min={1}
              max={selected.qty}
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
          </Popover.Target>
          <Popover.Dropdown c="red" p={0} m={'sm'}>
            <Alert
              m={0}
              variant="transparent"
              icon={<IconExclamationCircle />}
              c="red"
              styles={(theme) => ({
                message: { color: colorScheme === 'dark' ? theme.colors.red[4] : theme.colors.red[7] },
              })}
            >
              Quantidade no carrinho excede a quantidade disponível
            </Alert>
          </Popover.Dropdown>
        </Popover>
        <Text c="dimmed" size="sm">
          {`+${selected.qty} disponíveis`}
        </Text>
      </Group>
    )
  }

  useEffect(() => {
    if (selected.id || isLoading) return
    layoutContext.navbar.close()
    const totalForSale = product?.availability.reduce((acc: number, item: ProductAvailability) => (acc += item.qty), 0)
    setTotalForSale(totalForSale)
    setSelected(product?.availability.find(({ qty }) => qty) || product?.availability[0])
  }, [layoutContext.navbar, product, isLoading, selected, setSelected])

  useEffect(() => {
    setIsQuantityError(false)
  }, [selected, addQty])

  useEffect(() => {
    setTimeout(() => embla && embla.reInit(), 300)
  }, [embla])

  if (isLoading) return <DefaultLoadingOverlay />
  if (error) {
    notifications.show({
      title: 'Problema ao carregar detalhes do produto',
      message: 'Por favor, verifique a conexão',
      icon: <IconExclamationMark />,
      color: 'red',
    })
  }
  if (!product) return notFound()

  return (
    <Container size="lg" mt="lg">
      <DefaultLoadingOverlay visible={!firstImageLoaded} />
      <Grid gutter="md">
        {/* Left Side: Image Carousel */}
        <Grid.Col span={sizes.grid.col1}>
          <Paper shadow="md" p="md">
            <Carousel
              getEmblaApi={setEmbla}
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
            {renderStockBadge(totalForSale)}
            <Text size="md" c="dimmed">
              {product.description}
            </Text>
            <Divider />
            {renderAvailabeSection(product?.availability, selected, setSelected)}

            <Text size="xl" fw={700} mt="md" c={colorScheme === 'dark' ? theme.colors.green[4] : theme.colors.green[9]}>
              Preço: {BRL.format(selected.price || 0)}
            </Text>

            {/* Quantity Selector and Buttons */}
            <Stack>
              {renderQuantitySelector()}
              <Button
                leftSection={<IconShoppingCart />}
                disabled={!totalForSale}
                onClick={handleAddToCart}
                size="md"
                variant="filled"
              >
                Adicionar
              </Button>
              <Text c="dimmed" size="sm">
                OBS: Após o pedido, entraremos em contato para confirmação do mesmo
              </Text>
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
export default ProductDetailsPage
