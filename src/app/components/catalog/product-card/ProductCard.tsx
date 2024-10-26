import { Paper, Title } from '@mantine/core'

type IProps = {
  product: any
}

export default function ProductCard({ product }: IProps) {
  return (
    <Paper shadow="md" p="xl">
      <Title order={5}>{product.name}</Title>
    </Paper>
  )
}
