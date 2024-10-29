import { Paper, Title, Image, Text, Skeleton, Group, Badge, Stack } from '@mantine/core'
import styles from './ProductCard.module.css'
import React, { useState } from 'react'
import { BRL } from '@/app/helpers/NumberFormatter.helper'

type IProps = {
  product: any
  onClick: () => void
}

const renderAvailableBadges = (availables) => {
  return availables.map(({ name }, idx) => (
    <Badge key={idx} visibleFrom="sm">
      {name}
    </Badge>
  ))
}

export default function ProductCard({ product, onClick }: IProps) {
  console.log(product.availables.length)
  const [isImgLoaded, setIsImgLoaded] = useState(false)
  const prices = product.availables.map(({ price }) => price)
  const lowestPrice = Math.min(...prices)
  return (
    <Skeleton visible={!isImgLoaded}>
      <Paper onClick={onClick} className={styles.paper} shadow="xl" p="md" m={0} w="100%" h="100%" withBorder>
        <Image
          src={product.coverImg}
          w="100%"
          h={{ base: 230, sm: 250, md: 250, lg: 300 }}
          onLoad={() => setIsImgLoaded(true)}
        />
        <Stack justify="space-between">
          <Group justify="space-between" mt="sm">
            <Title order={5}>{product.name}</Title>
            <Text size="md" fw={500}>
              {BRL.format(lowestPrice)}
            </Text>
          </Group>
          <Text size="sm">{product.description}</Text>
          <Group justify="flex-start" mt="sm">
            {renderAvailableBadges(product.availables)}
          </Group>
        </Stack>
      </Paper>
    </Skeleton>
  )
}
