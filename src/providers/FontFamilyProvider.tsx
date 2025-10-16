import { DEFAULT_FONT_FAMILY, FONT_FAMILIES } from '@/constants'
import storage from '@/services/local-storage.service'
import { TFontFamily } from '@/types'
import { createContext, useContext, useEffect, useState } from 'react'

type TFontFamilyContext = {
  fontFamily: TFontFamily
  setFontFamily: (family: TFontFamily) => void
}

const FontFamilyContext = createContext<TFontFamilyContext | undefined>(undefined)

export const useFontFamily = () => {
  const context = useContext(FontFamilyContext)
  if (!context) {
    throw new Error('useFontFamily must be used within a FontFamilyProvider')
  }
  return context
}

export function FontFamilyProvider({ children }: { children: React.ReactNode }) {
  const [fontFamily, setFontFamilyState] = useState<TFontFamily>(
    storage.getFontFamily() ?? DEFAULT_FONT_FAMILY
  )

  const setFontFamily = (family: TFontFamily) => {
    setFontFamilyState(family)
    storage.setFontFamily(family)
  }

  useEffect(() => {
    const fontValue = FONT_FAMILIES[fontFamily].value
    document.documentElement.style.setProperty('--font-family', fontValue)
  }, [fontFamily])

  return (
    <FontFamilyContext.Provider value={{ fontFamily, setFontFamily }}>
      {children}
    </FontFamilyContext.Provider>
  )
}
