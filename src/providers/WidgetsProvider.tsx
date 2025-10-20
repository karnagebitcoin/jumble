import { StorageKey } from '@/constants'
import localStorageService from '@/services/local-storage.service'
import { TrendingUp, Bitcoin } from 'lucide-react'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

export type TWidgetId = 'trending-notes' | 'bitcoin-ticker'

export type TWidget = {
  id: TWidgetId
  name: string
  description: string
  defaultEnabled: boolean
  icon: React.ReactNode
}

export const AVAILABLE_WIDGETS: TWidget[] = [
  {
    id: 'bitcoin-ticker',
    name: 'Bitcoin Ticker',
    description: 'Display real-time Bitcoin price from CoinGecko',
    defaultEnabled: false,
    icon: <Bitcoin className="h-5 w-5" />
  },
  {
    id: 'trending-notes',
    name: 'Trending Notes',
    description: 'Display trending notes from across Nostr',
    defaultEnabled: true,
    icon: <TrendingUp className="h-5 w-5" />
  }
]

type TWidgetsContext = {
  enabledWidgets: TWidgetId[]
  toggleWidget: (widgetId: TWidgetId) => void
  isWidgetEnabled: (widgetId: TWidgetId) => boolean
  getWidgetById: (widgetId: TWidgetId) => TWidget | undefined
  reorderWidgets: (newOrder: TWidgetId[]) => void
}

const WidgetsContext = createContext<TWidgetsContext | undefined>(undefined)

export function WidgetsProvider({ children }: { children: ReactNode }) {
  const [enabledWidgets, setEnabledWidgets] = useState<TWidgetId[]>(() => {
    return localStorageService.getEnabledWidgets() as TWidgetId[]
  })

  useEffect(() => {
    localStorageService.setEnabledWidgets(enabledWidgets)
  }, [enabledWidgets])

  const toggleWidget = (widgetId: TWidgetId) => {
    setEnabledWidgets((prev) => {
      if (prev.includes(widgetId)) {
        return prev.filter((id) => id !== widgetId)
      } else {
        return [...prev, widgetId]
      }
    })
  }

  const isWidgetEnabled = (widgetId: TWidgetId) => {
    return enabledWidgets.includes(widgetId)
  }

  const getWidgetById = (widgetId: TWidgetId) => {
    return AVAILABLE_WIDGETS.find((w) => w.id === widgetId)
  }

  const reorderWidgets = (newOrder: TWidgetId[]) => {
    setEnabledWidgets(newOrder)
  }

  return (
    <WidgetsContext.Provider
      value={{ enabledWidgets, toggleWidget, isWidgetEnabled, getWidgetById, reorderWidgets }}
    >
      {children}
    </WidgetsContext.Provider>
  )
}

export function useWidgets() {
  const context = useContext(WidgetsContext)
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetsProvider')
  }
  return context
}
