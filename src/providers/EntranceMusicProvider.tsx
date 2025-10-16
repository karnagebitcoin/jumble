import { ENTRANCE_MUSIC_FREQUENCY, TEntranceMusicFrequency } from '@/constants'
import localStorageService from '@/services/local-storage.service'
import { createContext, ReactNode, useContext, useState } from 'react'

type EntranceMusicContextType = {
  entranceMusicUrl: string
  setEntranceMusicUrl: (url: string) => void
  entranceMusicFrequency: TEntranceMusicFrequency
  setEntranceMusicFrequency: (frequency: TEntranceMusicFrequency) => void
  shouldPlayEntranceMusic: () => boolean
  markEntranceMusicPlayed: () => void
}

const EntranceMusicContext = createContext<EntranceMusicContextType | undefined>(undefined)

export function EntranceMusicProvider({ children }: { children: ReactNode }) {
  const [entranceMusicUrl, setEntranceMusicUrlState] = useState<string>(
    localStorageService.getEntranceMusicUrl()
  )
  const [entranceMusicFrequency, setEntranceMusicFrequencyState] =
    useState<TEntranceMusicFrequency>(localStorageService.getEntranceMusicFrequency())

  const setEntranceMusicUrl = (url: string) => {
    localStorageService.setEntranceMusicUrl(url)
    setEntranceMusicUrlState(url)
  }

  const setEntranceMusicFrequency = (frequency: TEntranceMusicFrequency) => {
    localStorageService.setEntranceMusicFrequency(frequency)
    setEntranceMusicFrequencyState(frequency)
  }

  const shouldPlayEntranceMusic = () => {
    if (!entranceMusicUrl) return false

    const lastPlayed = localStorageService.getEntranceMusicLastPlayed()
    const now = Date.now()

    if (entranceMusicFrequency === ENTRANCE_MUSIC_FREQUENCY.EVERY_REFRESH) {
      return true
    }

    // ONCE_PER_DAY: Check if 24 hours have passed
    const twentyFourHours = 24 * 60 * 60 * 1000
    return now - lastPlayed >= twentyFourHours
  }

  const markEntranceMusicPlayed = () => {
    localStorageService.setEntranceMusicLastPlayed(Date.now())
  }

  return (
    <EntranceMusicContext.Provider
      value={{
        entranceMusicUrl,
        setEntranceMusicUrl,
        entranceMusicFrequency,
        setEntranceMusicFrequency,
        shouldPlayEntranceMusic,
        markEntranceMusicPlayed
      }}
    >
      {children}
    </EntranceMusicContext.Provider>
  )
}

export function useEntranceMusic() {
  const context = useContext(EntranceMusicContext)
  if (context === undefined) {
    throw new Error('useEntranceMusic must be used within an EntranceMusicProvider')
  }
  return context
}
