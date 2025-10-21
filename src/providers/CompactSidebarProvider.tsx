import storage from '@/services/local-storage.service'
import { createContext, useContext, useState } from 'react'

type TCompactSidebarContext = {
  compactSidebar: boolean
  setCompactSidebar: (compact: boolean) => void
}

const CompactSidebarContext = createContext<TCompactSidebarContext | undefined>(undefined)

export const useCompactSidebar = () => {
  const context = useContext(CompactSidebarContext)
  if (!context) {
    throw new Error('useCompactSidebar must be used within a CompactSidebarProvider')
  }
  return context
}

export function CompactSidebarProvider({ children }: { children: React.ReactNode }) {
  const [compactSidebar, setCompactSidebarState] = useState(storage.getCompactSidebar())

  const setCompactSidebar = (compact: boolean) => {
    setCompactSidebarState(compact)
    storage.setCompactSidebar(compact)
  }

  return (
    <CompactSidebarContext.Provider
      value={{
        compactSidebar,
        setCompactSidebar
      }}
    >
      {children}
    </CompactSidebarContext.Provider>
  )
}
