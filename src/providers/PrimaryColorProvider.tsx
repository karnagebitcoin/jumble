import { DEFAULT_PRIMARY_COLOR, PRIMARY_COLORS } from '@/constants'
import storage from '@/services/local-storage.service'
import { TPrimaryColor } from '@/types'
import { createContext, useContext, useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'

type PrimaryColorProviderProps = {
  children: React.ReactNode
}

type PrimaryColorProviderState = {
  primaryColor: TPrimaryColor
  setPrimaryColor: (color: TPrimaryColor) => void
}

const PrimaryColorProviderContext = createContext<PrimaryColorProviderState | undefined>(undefined)

export function PrimaryColorProvider({ children }: PrimaryColorProviderProps) {
  const [primaryColor, setPrimaryColorState] = useState<TPrimaryColor>(DEFAULT_PRIMARY_COLOR)
  const { theme } = useTheme()

  useEffect(() => {
    const init = async () => {
      const color = storage.getPrimaryColor()
      setPrimaryColorState(color)
      updateCSSVariables(color, theme)
    }
    init()
  }, [])

  useEffect(() => {
    updateCSSVariables(primaryColor, theme)
  }, [theme, primaryColor])

  const updateCSSVariables = (color: TPrimaryColor, currentTheme: 'light' | 'dark') => {
    const root = window.document.documentElement
    const colorConfig = PRIMARY_COLORS[color]

    const primaryValue = currentTheme === 'dark' ? colorConfig.dark : colorConfig.light
    const foregroundValue = currentTheme === 'dark' ? colorConfig.foreground.dark : colorConfig.foreground.light

    root.style.setProperty('--primary', primaryValue)
    root.style.setProperty('--primary-hover', colorConfig.hover)
    root.style.setProperty('--ring', primaryValue)
    root.style.setProperty('--primary-foreground', foregroundValue)
  }

  const setPrimaryColor = (color: TPrimaryColor) => {
    storage.setPrimaryColor(color)
    setPrimaryColorState(color)
    updateCSSVariables(color, theme)
  }

  return (
    <PrimaryColorProviderContext.Provider
      value={{
        primaryColor,
        setPrimaryColor
      }}
    >
      {children}
    </PrimaryColorProviderContext.Provider>
  )
}

export const usePrimaryColor = () => {
  const context = useContext(PrimaryColorProviderContext)

  if (context === undefined)
    throw new Error('usePrimaryColor must be used within a PrimaryColorProvider')

  return context
}
