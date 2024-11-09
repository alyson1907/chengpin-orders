import { Paper, Title, Image, Text, Group, Badge, Stack, Box } from '@mantine/core'
import styles from './ProductCard.module.css'
import React, { Dispatch, useState } from 'react'
import { BRL } from '@/app/helpers/NumberFormatter.helper'
import { Product, ProductAvailability } from '@prisma/client'
import { DefaultLoadingOverlay } from '@/app/components/common/DefaultLoadingOverlay'

type IProps = {
  productInfo: Product & { availability: ProductAvailability[] }
  selectProduct: Dispatch<any>
}

const renderAvailableBadges = (availability) => {
  return availability.map(({ name }, idx: number) => (
    <Badge key={idx} visibleFrom="sm">
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
    <Paper onClick={handleCardClick} className={styles.paper} shadow="xl" p="sm" m={0} w="100%" h="100%" withBorder>
      <DefaultLoadingOverlay visible={!isImgLoaded} />
      <Stack h="100%" justify="space-between">
        <Box h="auto">
          <Image
            src={productInfo.coverImg}
            h={{ base: 400, xs: 300, sm: 300, md: 275, lg: 300 }}
            onLoad={() => setIsImgLoaded(true)}
            alt={productInfo.name}
          />
          <Group justify="space-between" mt="sm">
            <Title order={5}>{productInfo.name}</Title>
            <Text size="md" fw={500}>
              {BRL.format(lowestPrice)}
            </Text>
          </Group>
          <Text size="sm" mt="sm">
            {truncateDescription(String(productInfo.description))}
          </Text>
        </Box>
        <Group justify="flex-start" mt="sm">
          {renderAvailableBadges(productInfo.availability)}
        </Group>
      </Stack>
    </Paper>
  )
}
export default ProductCard
