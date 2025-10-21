import { BUTTON_RADIUS_VALUES, DEFAULT_BUTTON_RADIUS } from '@/constants'
import storage from '@/services/local-storage.service'
import { createContext, useContext, useEffect, useState } from 'react'

type TButtonRadiusContext = {
  buttonRadius: number
  setButtonRadius: (radius: number) => void
}

const ButtonRadiusContext = createContext<TButtonRadiusContext | undefined>(undefined)

export const useButtonRadius = () => {
  const context = useContext(ButtonRadiusContext)
  if (!context) {
    throw new Error('useButtonRadius must be used within a ButtonRadiusProvider')
  }
  return context
}

export function ButtonRadiusProvider({ children }: { children: React.ReactNode }) {
  const [buttonRadius, setButtonRadiusState] = useState<number>(
    storage.getButtonRadius() ?? DEFAULT_BUTTON_RADIUS
  )

  const setButtonRadius = (radius: number) => {
    if (!BUTTON_RADIUS_VALUES.includes(radius as any)) {
      return
    }
    setButtonRadiusState(radius)
    storage.setButtonRadius(radius)
  }

  useEffect(() => {
    // Apply the button radius as a CSS variable
    const radiusValue = buttonRadius === 9999 ? '9999px' : `${buttonRadius}px`
    document.documentElement.style.setProperty('--button-radius', radiusValue)
  }, [buttonRadius])

  return (
    <ButtonRadiusContext.Provider value={{ buttonRadius, setButtonRadius }}>
      {children}
    </ButtonRadiusContext.Provider>
  )
}
