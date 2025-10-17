import storage from '@/services/local-storage.service'
import { TCustomFeed } from '@/types'
import { createContext, useContext, useEffect, useState } from 'react'

type TCustomFeedsContext = {
  customFeeds: TCustomFeed[]
  addCustomFeed: (feed: TCustomFeed) => void
  removeCustomFeed: (id: string) => void
  updateCustomFeed: (id: string, updates: Partial<TCustomFeed>) => void
}

const CustomFeedsContext = createContext<TCustomFeedsContext | undefined>(undefined)

export const useCustomFeeds = () => {
  const context = useContext(CustomFeedsContext)
  if (!context) {
    throw new Error('useCustomFeeds must be used within a CustomFeedsProvider')
  }
  return context
}

export function CustomFeedsProvider({ children }: { children: React.ReactNode }) {
  const [customFeeds, setCustomFeeds] = useState<TCustomFeed[]>([])

  useEffect(() => {
    setCustomFeeds(storage.getCustomFeeds())
  }, [])

  const addCustomFeed = (feed: TCustomFeed) => {
    storage.addCustomFeed(feed)
    setCustomFeeds(storage.getCustomFeeds())
  }

  const removeCustomFeed = (id: string) => {
    storage.removeCustomFeed(id)
    setCustomFeeds(storage.getCustomFeeds())
  }

  const updateCustomFeed = (id: string, updates: Partial<TCustomFeed>) => {
    storage.updateCustomFeed(id, updates)
    setCustomFeeds(storage.getCustomFeeds())
  }

  return (
    <CustomFeedsContext.Provider
      value={{
        customFeeds,
        addCustomFeed,
        removeCustomFeed,
        updateCustomFeed
      }}
    >
      {children}
    </CustomFeedsContext.Provider>
  )
}
