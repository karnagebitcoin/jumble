import { TZapSound } from '@/constants'
import lightningService from '@/services/lightning.service'
import storage from '@/services/local-storage.service'
import { onConnected, onDisconnected } from '@getalby/bitcoin-connect-react'
import { GetInfoResponse, WebLNProvider } from '@webbtc/webln-types'
import { createContext, useContext, useEffect, useState } from 'react'

type TZapContext = {
  isWalletConnected: boolean
  provider: WebLNProvider | null
  walletInfo: GetInfoResponse | null
  defaultZapSats: number
  updateDefaultSats: (sats: number) => void
  defaultZapComment: string
  updateDefaultComment: (comment: string) => void
  quickZap: boolean
  updateQuickZap: (quickZap: boolean) => void
  zapSound: TZapSound
  updateZapSound: (sound: TZapSound) => void
  chargeZapEnabled: boolean
  updateChargeZapEnabled: (enabled: boolean) => void
  chargeZapLimit: number
  updateChargeZapLimit: (limit: number) => void
  zapOnReactions: boolean
  updateZapOnReactions: (enabled: boolean) => void
  onlyZapsMode: boolean
  updateOnlyZapsMode: (enabled: boolean) => void
}

const ZapContext = createContext<TZapContext | undefined>(undefined)

export const useZap = () => {
  const context = useContext(ZapContext)
  if (!context) {
    throw new Error('useZap must be used within a ZapProvider')
  }
  return context
}

export function ZapProvider({ children }: { children: React.ReactNode }) {
  const [defaultZapSats, setDefaultZapSats] = useState<number>(storage.getDefaultZapSats())
  const [defaultZapComment, setDefaultZapComment] = useState<string>(storage.getDefaultZapComment())
  const [quickZap, setQuickZap] = useState<boolean>(storage.getQuickZap())
  const [zapSound, setZapSound] = useState<TZapSound>(storage.getZapSound())
  const [chargeZapEnabled, setChargeZapEnabled] = useState<boolean>(storage.getChargeZapEnabled())
  const [chargeZapLimit, setChargeZapLimit] = useState<number>(storage.getChargeZapLimit())
  const [zapOnReactions, setZapOnReactions] = useState<boolean>(storage.getZapOnReactions())
  const [onlyZapsMode, setOnlyZapsMode] = useState<boolean>(storage.getOnlyZapsMode())
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [provider, setProvider] = useState<WebLNProvider | null>(null)
  const [walletInfo, setWalletInfo] = useState<GetInfoResponse | null>(null)

  useEffect(() => {
    const unSubOnConnected = onConnected((provider) => {
      setIsWalletConnected(true)
      setWalletInfo(null)
      setProvider(provider)
      lightningService.provider = provider
      provider.getInfo().then(setWalletInfo)
    })
    const unSubOnDisconnected = onDisconnected(() => {
      setIsWalletConnected(false)
      setProvider(null)
      lightningService.provider = null
    })

    return () => {
      unSubOnConnected()
      unSubOnDisconnected()
    }
  }, [])

  const updateDefaultSats = (sats: number) => {
    storage.setDefaultZapSats(sats)
    setDefaultZapSats(sats)
  }

  const updateDefaultComment = (comment: string) => {
    storage.setDefaultZapComment(comment)
    setDefaultZapComment(comment)
  }

  const updateQuickZap = (quickZap: boolean) => {
    storage.setQuickZap(quickZap)
    setQuickZap(quickZap)
  }

  const updateZapSound = (sound: TZapSound) => {
    storage.setZapSound(sound)
    setZapSound(sound)
  }

  const updateChargeZapEnabled = (enabled: boolean) => {
    storage.setChargeZapEnabled(enabled)
    setChargeZapEnabled(enabled)
  }

  const updateChargeZapLimit = (limit: number) => {
    storage.setChargeZapLimit(limit)
    setChargeZapLimit(limit)
  }

  const updateZapOnReactions = (enabled: boolean) => {
    storage.setZapOnReactions(enabled)
    setZapOnReactions(enabled)
  }

  const updateOnlyZapsMode = (enabled: boolean) => {
    storage.setOnlyZapsMode(enabled)
    setOnlyZapsMode(enabled)
  }

  return (
    <ZapContext.Provider
      value={{
        isWalletConnected,
        provider,
        walletInfo,
        defaultZapSats,
        updateDefaultSats,
        defaultZapComment,
        updateDefaultComment,
        quickZap,
        updateQuickZap,
        zapSound,
        updateZapSound,
        chargeZapEnabled,
        updateChargeZapEnabled,
        chargeZapLimit,
        updateChargeZapLimit,
        zapOnReactions,
        updateZapOnReactions,
        onlyZapsMode,
        updateOnlyZapsMode
      }}
    >
      {children}
    </ZapContext.Provider>
  )
}
