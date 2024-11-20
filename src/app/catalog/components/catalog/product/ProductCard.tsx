import { Paper, Title, Image, Text, Group, Badge, Stack, Box, Container } from '@mantine/core'
import styles from './ProductCard.module.css'
import React, { Dispatch, useState } from 'react'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { Product, ProductAvailability } from '@prisma/client'
import { DefaultLoadingOverlay } from '@/app/catalog/components/common/DefaultLoadingOverlay'

type IProps = {
  productInfo: Product & { availability: ProductAvailability[] }
  selectProduct: Dispatch<any>
}

const renderAvailableBadges = (availability) => {
  return availability.map(({ name }, idx: number) => (
    <Badge key={idx} size="sm" variant="outline" m={0} style={{ cursor: 'pointer' }}>
      {name}
    </Badge>
  ))
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
