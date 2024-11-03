import { Paper, Title, Image, Text, Group, Badge, Stack, Box, Container } from '@mantine/core'
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
  return availability.map(({ name }, idx) => (
    <Badge key={idx} visibleFrom="sm">
      {name}
    </Badge>
  ))
}

const truncateDescription = (text: string) => {
  const maxLength = 80
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

export default function ProductCard({ productInfo, selectProduct }: IProps) {
  const [isImgLoaded, setIsImgLoaded] = useState(false)
  const prices = productInfo.availability.map(({ price }) => price)
  const lowestPrice = Math.min(...prices)
  const handleCardClick = () => {
    selectProduct(productInfo.id)
  }

  return (
    <Paper onClick={handleCardClick} className={styles.paper} shadow="xl" p="md" m={0} w="100%" h="100%" withBorder>
      <Stack h="100%" justify="space-between">
        <Box h="auto">
          <Container>
            <DefaultLoadingOverlay visible={!isImgLoaded} />
            <Image
              src={productInfo.coverImg}
              h={{ base: 230, sm: 250, md: 250, lg: 300 }}
              onLoad={() => setIsImgLoaded(true)}
              alt={productInfo.name}
            />
          </Container>
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
