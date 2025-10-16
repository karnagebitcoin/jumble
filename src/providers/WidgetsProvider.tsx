import { StorageKey } from '@/constants'
import localStorageService from '@/services/local-storage.service'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

export type TWidgetId = 'trending-notes'

export type TWidget = {
  id: TWidgetId
  name: string
  description: string
  defaultEnabled: boolean
}

export const AVAILABLE_WIDGETS: TWidget[] = [
  {
    id: 'trending-notes',
    name: 'Trending Notes',
    description: 'Display trending notes from across Nostr',
    defaultEnabled: true
  }
]

type TWidgetsContext = {
  enabledWidgets: TWidgetId[]
  toggleWidget: (widgetId: TWidgetId) => void
  isWidgetEnabled: (widgetId: TWidgetId) => boolean
}

const WidgetsContext = createContext<TWidgetsContext | undefined>(undefined)

export function WidgetsProvider({ children }: { children: ReactNode }) {
  const [enabledWidgets, setEnabledWidgets] = useState<TWidgetId[]>(() => {
    return localStorageService.getEnabledWidgets()
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

  return (
    <WidgetsContext.Provider value={{ enabledWidgets, toggleWidget, isWidgetEnabled }}>
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
