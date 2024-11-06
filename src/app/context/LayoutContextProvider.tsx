import { useDisclosure } from '@mantine/hooks'
import { createContext, Dispatch, SetStateAction, useState } from 'react'

type LayoutContextType = {
  category: {
    activeCategoryId: string
    setActiveCategoryId: Dispatch<SetStateAction<string>>
  }
  navbar: { isOpen: boolean; toggle: () => void; open: () => void; close: () => void }
}

export const LayoutContext = createContext({} as LayoutContextType)

const LayoutContextProvider = ({ children }) => {
  const [activeCategoryId, setActiveCategoryId] = useState('')
  const [isNavbarOpen, { toggle, open, close }] = useDisclosure(true)
  return (
    <LayoutContext.Provider
      value={{
        category: { activeCategoryId, setActiveCategoryId },
        navbar: { isOpen: isNavbarOpen, toggle, open, close },
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export default LayoutContextProvider
