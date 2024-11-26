'use client'
import { createContext, Dispatch, PropsWithChildren, useState } from 'react'

type TDashboardLayoutContext = {
  selectedCategory: string
  setSelectedCategory: Dispatch<string>
}

const defaultProvided: TDashboardLayoutContext = {
  selectedCategory: '',
  setSelectedCategory: () => {},
}

export const DashboardLayoutContext = createContext(defaultProvided)

const DashboardLayoutContextProvider = ({ children }: PropsWithChildren) => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const provided: TDashboardLayoutContext = {
    selectedCategory,
    setSelectedCategory,
  }
  return <DashboardLayoutContext.Provider value={provided}>{children}</DashboardLayoutContext.Provider>
}

export default DashboardLayoutContextProvider
