import { useDisclosure } from '@mantine/hooks'
import { createContext, Dispatch, SetStateAction, useState } from 'react'

type LayoutContextType = {
  category: {
    activeCategoryId: string
    setActiveCategoryId: Dispatch<SetStateAction<string>>
  }
  navbar: { isOpen: boolean; toggle: () => void; open: () => void; close: () => void }
  shoppingCart: { isOpen: boolean; toggle: () => void; open: () => void; close: () => void }
}

export const LayoutContext = createContext({} as LayoutContextType)

const LayoutContextProvider = ({ children }) => {
  const [activeCategoryId, setActiveCategoryId] = useState('')
  const [isNavbarOpen, { toggle: navToggle, open: navOpen, close: navClose }] = useDisclosure(true)
  const [isShoppingCartOpen, { toggle: cartToggle, open: cartOpen, close: cartClose }] = useDisclosure(false)
  return (
    <LayoutContext.Provider
      value={{
        category: { activeCategoryId, setActiveCategoryId },
        navbar: { isOpen: isNavbarOpen, toggle: navToggle, open: navOpen, close: navClose },
        shoppingCart: { isOpen: isShoppingCartOpen, toggle: cartToggle, open: cartOpen, close: cartClose },
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export default LayoutContextProvider
