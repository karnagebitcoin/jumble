import { DEFAULT_FONT_SIZE } from '@/constants'
import storage from '@/services/local-storage.service'
import { createContext, useContext, useEffect, useState } from 'react'

type TFontSizeContext = {
  fontSize: number
  setFontSize: (size: number) => void
}

const FontSizeContext = createContext<TFontSizeContext | undefined>(undefined)

export const useFontSize = () => {
  const context = useContext(FontSizeContext)
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider')
  }
  return context
}

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<number>(storage.getFontSize() ?? DEFAULT_FONT_SIZE)

  const setFontSize = (size: number) => {
    setFontSizeState(size)
    storage.setFontSize(size)
  }

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`)
  }, [fontSize])

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}
