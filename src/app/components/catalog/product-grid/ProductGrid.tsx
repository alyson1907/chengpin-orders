import { Grid } from '@mantine/core'
import { v7 as uuid } from 'uuid'
import ProductCard from '../product-card/ProductCard'
import { Category } from '@prisma/client'
import useSWR from 'swr'

const products = [
  {
    id: uuid(),
    name: 'Alocasia Variado',
    description: 'Várias plantinhas que vem em camada 10x8',
    price: 9.8,
    potSize: 12,
    qty: 200,
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
    price: 12.99,
    potSize: 12,
    qty: 100,
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
    price: 9.8,
    potSize: 12,
    qty: 200,
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
    price: 12.99,
    potSize: 12,
    qty: 100,
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
    price: 9.8,
    potSize: 12,
    qty: 200,
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
    price: 12.99,
    potSize: 12,
    qty: 100,
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
  // Logic to fetch all products from the received category
  // return fetch(url, {}).then((res) => res.json())
  return products
}

type IProps = {
  productCategory: Category
}

export default function ProductGrid({ productCategory }: IProps) {
  const { data: products = [], error, isLoading } = useSWR(['/api/product/:category', productCategory], fetcher)
  return (
    <Grid>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Grid>
  )
}
