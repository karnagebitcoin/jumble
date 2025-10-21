import { createContext, ReactNode, useContext, useState } from 'react'

type TWidgetSidebarDismissedContext = {
  widgetSidebarDismissed: boolean
  setWidgetSidebarDismissed: (dismissed: boolean) => void
}

const WidgetSidebarDismissedContext = createContext<TWidgetSidebarDismissedContext | undefined>(
  undefined
)

export function useWidgetSidebarDismissed() {
  const context = useContext(WidgetSidebarDismissedContext)
  if (context === undefined) {
    throw new Error(
      'useWidgetSidebarDismissed must be used within a WidgetSidebarDismissedProvider'
    )
  }
  return context
}

export function WidgetSidebarDismissedProvider({ children }: { children: ReactNode }) {
  // Use session state (not persisted) - resets on page refresh
  const [widgetSidebarDismissed, setWidgetSidebarDismissed] = useState(false)

  return (
    <WidgetSidebarDismissedContext.Provider
      value={{
        widgetSidebarDismissed,
        setWidgetSidebarDismissed
      }}
    >
      {children}
    </WidgetSidebarDismissedContext.Provider>
  )
}
