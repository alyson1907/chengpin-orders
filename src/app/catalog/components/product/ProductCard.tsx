import { DefaultLoadingOverlay } from '@/app/common/DefaultLoadingOverlay'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { Badge, Box, Container, Group, Image, Paper, Stack, Text, Title } from '@mantine/core'
import { Product, ProductAvailability } from '@prisma/client'
import { Dispatch, useState } from 'react'
import styles from './ProductCard.module.css'

type IProps = {
  productInfo: Product & { availability: ProductAvailability[] }
  selectProduct: Dispatch<any>
}

const renderAvailableBadges = (availability: any[]) => {
  const displayAmount = 4
  const head = availability.slice(0, displayAmount)
  const tail = availability.slice(displayAmount, availability.length)
  const badges = head.map(({ name }, idx: number) => (
    <Badge key={idx} size="sm" variant="outline" m={0} style={{ cursor: 'pointer' }}>
      {name}
    </Badge>
  ))
  return (
    <>
      {badges}
      {!!tail.length && (
        <Text size="xs" c="dimmed">
          +{tail.length} tamanhos
        </Text>
      )}
    </>
  )
}

const truncateDescription = (text: string) => {
  const maxLength = 80
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

const ProductCard = ({ productInfo, selectProduct }: IProps) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false)
  const prices = productInfo.availability.map(({ price }) => price)
  const lowestPrice = Math.min(...prices)
  const handleCardClick = () => {
    selectProduct(productInfo.id)
  }

  return (
    <Paper onClick={handleCardClick} className={styles.paper} shadow="xl" p={0} m={0} w="100%" h="100%">
      <DefaultLoadingOverlay visible={!isImgLoaded} />
      <Stack h="100%" justify="space-between">
        <Box h="auto">
          <Image
            src={productInfo.coverImg}
            h={{ base: 400, xs: 300, sm: 300, md: 275, lg: 300 }}
            onLoad={() => setIsImgLoaded(true)}
            alt={productInfo.name}
          />
          <Container p="sm">
            <Stack>
              <Title order={5}>{productInfo.name}</Title>
              <Text size="sm" fw={400}>
                {BRL.format(lowestPrice)}
              </Text>
              {productInfo.description && (
                <Text size="sm" c="dimmed">
                  {truncateDescription(productInfo.description as string)}
                </Text>
              )}
            </Stack>
            <Group justify="flex-start" mt="sm">
              {renderAvailableBadges(productInfo.availability)}
            </Group>
          </Container>
        </Box>
      </Stack>
    </Paper>
  )
}
export default ProductCard
