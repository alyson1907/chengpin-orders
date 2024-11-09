/* eslint-disable @typescript-eslint/no-unused-vars */
import { Product, ProductAvailability } from '@prisma/client'
import React, { createContext, useEffect, useState } from 'react'
import _ from 'lodash'

type PickedProduct = Pick<Product, 'id' | 'name' | 'coverImg'>
type PickedAvailability = Pick<ProductAvailability, 'id' | 'name' | 'price'> & { buyingQty: number; maxQty: number }

export type AvailabilityWithProduct = PickedAvailability & { productInfo: PickedProduct }
export type ShoppingCartType = {
  items: Array<AvailabilityWithProduct>
}

const emptyCart: ShoppingCartType = {
  items: [],
}

const defaultProvided = {
  cart: emptyCart,
  addItem: (product: Product, availability: ProductAvailability, addQty: number): AvailabilityWithProduct => {
    return {
      id: '',
      name: '',
      price: 0.0,
      buyingQty: 0,
      maxQty: 0,
      productInfo: {
        id: '',
        name: '',
        coverImg: '',
      },
    }
  },
  removeItem: (availability: ProductAvailability, removeQty: number) => {},
  deleteItem: (id: string) => {},
}

const buildCartItem = (product: Product, availability: ProductAvailability): AvailabilityWithProduct => {
  return {
    id: availability.id,
    name: availability.name,
    price: availability.price,
    buyingQty: 0,
    maxQty: availability.qty,
    productInfo: {
      id: product.id,
      name: product.name,
      coverImg: product.coverImg,
    },
  }
}

export const ShoppingCartContext = createContext(defaultProvided)

const saveToLocalStorage = (cart: ShoppingCartType) =>
  window.localStorage.setItem('chengpin-shopping-cart', JSON.stringify(cart))

const readFromLocalStorage = (): ShoppingCartType =>
  JSON.parse(window.localStorage.getItem('chengpin-shopping-cart') || JSON.stringify(emptyCart)) || emptyCart

const removeById = (arr: AvailabilityWithProduct[], availabilityId: string) => {
  return _.filter(arr, ({ id }) => id !== availabilityId)
}
const ShoppingCartProvider = ({ children }) => {
  const [cart, setCart] = useState(emptyCart)

  useEffect(() => {
    setCart(readFromLocalStorage())
  }, [])

  const addItem = (product: Product, availability: ProductAvailability, addQty = 1) => {
    const found = cart.items?.find((item) => item.id === availability.id) || buildCartItem(product, availability)
    const item = { ...found }
    item.buyingQty += addQty
    const newItems = [...removeById(cart.items, availability.id), item]
    setCart({ ...cart, items: newItems })
    saveToLocalStorage(cart)
    return item
  }

  const removeItem = (availability: ProductAvailability, removeQty = 1) => {
    const found = cart.items.find((item) => item.id === availability.id)
    if (!found) return
    const item = { ...found }
    item.buyingQty -= removeQty
    const newItems = removeById(cart.items, availability.id)
    if (item.buyingQty > 0) newItems.push(item)
    setCart({ ...cart, items: newItems })
    saveToLocalStorage(cart)
  }

  const deleteItem = (id: string) => {
    const newItems = removeById(cart.items, id)
    setCart({ ...cart, items: newItems })
    saveToLocalStorage(cart)
  }

  const provided = {
    cart,
    addItem,
    removeItem,
    deleteItem,
  }

  return <ShoppingCartContext.Provider value={provided}>{children}</ShoppingCartContext.Provider>
}

export default ShoppingCartProvider
