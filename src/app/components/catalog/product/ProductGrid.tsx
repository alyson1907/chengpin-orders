import { SimpleGrid } from '@mantine/core'
import { v7 as uuid } from 'uuid'
import ProductCard from './ProductCard'
import { Category } from '@prisma/client'
import useSWR from 'swr'
import { useDisclosure } from '@mantine/hooks'
import ProductDetails from './ProductDetails'
import GridSkeleton from './GridSkeleton'

const products = [
  {
    id: uuid(),
    name: 'Alocasia Variado',
    description: 'Várias plantinhas que vem em camada 10x8',
    availability: [
      { name: 'Pote 9', price: 8.99, qty: 12 },
      { name: 'Pote 15', price: 9.99, qty: 25 },
      { name: 'Camada 10x8', price: 10.99, qty: 25 },
      { name: 'Unidade', price: 12.99, qty: 25 },
      { name: 'Pote 14', price: 14.99, qty: 25 },
    ],
    coverImg:
      'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGl4Ym02MTU0N2ZtYWQydm53azM4d3NvMnIxNDl0MGZleTE0aGg1YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nAELLSB7jV0wVejr1h/giphy.webp',
    imgs: [
      'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
      'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
      'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg',
      'https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg',
    ],
    categories: [{ name: 'Alocasia' }],
  },
  {
    id: uuid(),
    name: 'Alocasia Black Velvet',
    description: 'Black Velvet individual',
    availability: [
      { name: 'Pote 9', price: 12.99, qty: 12 },
      { name: 'Pote 15', price: 14.99, qty: 25 },
    ],
    coverImg:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1699&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    imgs: [
      'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
      'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
      'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg',
      'https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg',
    ],
    categories: [{ name: 'Alocasia' }],
  },
  {
    id: uuid(),
    name: 'Alocasia Variado',
    description: 'Várias plantinhas que vem em camada 10x8',
    availability: [
      { name: 'Pote 9', price: 9.8, qty: 12 },
      { name: 'Pote 15', price: 14.99, qty: 25 },
    ],
    coverImg: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    imgs: [
      'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
      'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
      'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg',
      'https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg',
    ],
    categories: [{ name: 'Alocasia' }],
  },
  {
    id: uuid(),
    name: 'Alocasia Black Velvet',
    description: 'Black Velvet individual',
    availability: [
      { name: 'Pote 9', price: 12.99, qty: 12 },
      { name: 'Pote 15', price: 14.99, qty: 25 },
    ],
    coverImg: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',

    imgs: [
      'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
      'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
      'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg',
      'https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg',
    ],
    categories: [{ name: 'Alocasia' }],
  },
  {
    id: uuid(),
    name: 'Alocasia Variado',
    description: 'Várias plantinhas que vem em camada 10x8',
    availability: [
      { name: 'Pote 9', price: 9.8, qty: 12 },
      { name: 'Pote 15', price: 14.99, qty: 25 },
    ],
    coverImg: 'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg',

    imgs: [
      'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
      'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
      'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg',
      'https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg',
    ],
    categories: [{ name: 'Alocasia' }],
  },
  {
    id: uuid(),
    name: 'Alocasia Black Velvet',
    description: 'Black Velvet individual',
    availability: [
      { name: 'Pote 9', price: 12.99, qty: 12 },
      { name: 'Pote 15', price: 14.99, qty: 25 },
    ],
    coverImg: 'https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg',

    imgs: [
      'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
      'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
      'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg',
      'https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg',
    ],
    categories: [{ name: 'Alocasia' }],
  },
]

const fetcher = ([url, category]: [string, Category]) => {
  if (url)
    if (category)
      // Logic to fetch all products from the received category
      // return fetch(url, {}).then((res) => res.json())
      return products
}

type IProps = {
  productCategory: Category
}

export default function ProductGrid({ productCategory }: IProps) {
  const { data: products = [], error, isLoading } = useSWR(['/api/product/:category', productCategory], fetcher)
  const [isProductModalOpen, { toggle: toggleProductModal, close: closeProductModal }] = useDisclosure()
  // const [productDetails, setProductDetails] = useState<any>(products[0])
  if (error) {
  }
  if (isLoading) return <GridSkeleton visible={isLoading} />

  return (
    <>
      <ProductDetails isOpen={isProductModalOpen} onClose={closeProductModal} />
      <SimpleGrid cols={{ base: 2, sm: 2, md: 3, lg: 4 }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onClick={toggleProductModal} />
        ))}
      </SimpleGrid>
    </>
  )
}
