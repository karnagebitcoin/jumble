import localStorageService from '@/services/local-storage.service'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

type TTrendingNotesDismissedContext = {
  trendingNotesDismissed: boolean
  setTrendingNotesDismissed: (dismissed: boolean) => void
}

const TrendingNotesDismissedContext = createContext<TTrendingNotesDismissedContext | undefined>(
  undefined
)

export function useTrendingNotesDismissed() {
  const context = useContext(TrendingNotesDismissedContext)
  if (context === undefined) {
    throw new Error(
      'useTrendingNotesDismissed must be used within a TrendingNotesDismissedProvider'
    )
  }
  return context
}

export function TrendingNotesDismissedProvider({ children }: { children: ReactNode }) {
  const [trendingNotesDismissed, setTrendingNotesDismissedState] = useState(
    localStorageService.getTrendingNotesDismissed()
  )

  useEffect(() => {
    localStorageService.setTrendingNotesDismissed(trendingNotesDismissed)
  }, [trendingNotesDismissed])

  return (
    <TrendingNotesDismissedContext.Provider
      value={{
        trendingNotesDismissed,
        setTrendingNotesDismissed: setTrendingNotesDismissedState
      }}
    >
      {children}
    </TrendingNotesDismissedContext.Provider>
  )
}
