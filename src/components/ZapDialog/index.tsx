import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ACTUAL_ZAP_SOUNDS, ZAP_SOUNDS } from '@/constants'
import { useNostr } from '@/providers/NostrProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useZap } from '@/providers/ZapProvider'
import lightning from '@/services/lightning.service'
import noteStatsService from '@/services/note-stats.service'
import { Loader } from 'lucide-react'
import { NostrEvent } from 'nostr-tools'
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import UserAvatar from '../UserAvatar'
import Username from '../Username'

export default function ZapDialog({
  open,
  setOpen,
  pubkey,
  event,
  defaultAmount,
  defaultComment
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  pubkey: string
  event?: NostrEvent
  defaultAmount?: number
  defaultComment?: string
}) {
  const { t } = useTranslation()
  const { isSmallScreen } = useScreenSize()
  const drawerContentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (drawerContentRef.current) {
        drawerContentRef.current.style.setProperty('bottom', `env(safe-area-inset-bottom)`)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      handleResize() // Initial call in case the keyboard is already open
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  if (isSmallScreen) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerOverlay onClick={() => setOpen(false)} />
        <DrawerContent
          hideOverlay
          onOpenAutoFocus={(e) => e.preventDefault()}
          ref={drawerContentRef}
          className="flex flex-col gap-4 px-4 mb-4"
        >
          <DrawerHeader>
            <DrawerTitle className="flex gap-2 items-center">
              <div className="shrink-0">{t('Zap to')}</div>
              <UserAvatar size="small" userId={pubkey} />
              <Username userId={pubkey} className="truncate flex-1 w-0 text-start h-5" />
            </DrawerTitle>
            <DialogDescription></DialogDescription>
          </DrawerHeader>
          <ZapDialogContent
            open={open}
            setOpen={setOpen}
            recipient={pubkey}
            event={event}
            defaultAmount={defaultAmount}
            defaultComment={defaultComment}
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <div className="shrink-0">{t('Zap to')}</div>
            <UserAvatar size="small" userId={pubkey} />
            <Username userId={pubkey} className="truncate flex-1 max-w-fit text-start h-5" />
          </DialogTitle>
        </DialogHeader>
        <ZapDialogContent
          open={open}
          setOpen={setOpen}
          recipient={pubkey}
          event={event}
          defaultAmount={defaultAmount}
          defaultComment={defaultComment}
        />
      </DialogContent>
    </Dialog>
  )
}

function ZapDialogContent({
  setOpen,
  recipient,
  event,
  defaultAmount,
  defaultComment
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  recipient: string
  event?: NostrEvent
  defaultAmount?: number
  defaultComment?: string
}) {
  const { t, i18n } = useTranslation()
  const { pubkey } = useNostr()
  const { defaultZapSats, defaultZapComment, zapSound } = useZap()
  const [sats, setSats] = useState(defaultAmount ?? defaultZapSats)
  const [comment, setComment] = useState(defaultComment ?? defaultZapComment)
  const [zapping, setZapping] = useState(false)
  const presetAmounts = useMemo(() => {
    if (i18n.language.startsWith('zh')) {
      return [
        { display: '21', val: 21 },
        { display: '66', val: 66 },
        { display: '210', val: 210 },
        { display: '666', val: 666 },
        { display: '1k', val: 1000 },
        { display: '2.1k', val: 2100 },
        { display: '6.6k', val: 6666 },
        { display: '10k', val: 10000 },
        { display: '21k', val: 21000 },
        { display: '66k', val: 66666 },
        { display: '100k', val: 100000 },
        { display: '210k', val: 210000 }
      ]
    }

    return [
      { display: '21', val: 21 },
      { display: '42', val: 42 },
      { display: '210', val: 210 },
      { display: '420', val: 420 },
      { display: '1k', val: 1000 },
      { display: '2.1k', val: 2100 },
      { display: '4.2k', val: 4200 },
      { display: '10k', val: 10000 },
      { display: '21k', val: 21000 },
      { display: '42k', val: 42000 },
      { display: '100k', val: 100000 },
      { display: '210k', val: 210000 }
    ]
  }, [i18n.language])

  const handleZap = async () => {
    try {
      if (!pubkey) {
        throw new Error('You need to be logged in to zap')
      }

      // Play zap sound IMMEDIATELY when zap button is pressed
      if (zapSound !== ZAP_SOUNDS.NONE) {
        let soundToPlay = zapSound
        // If random is selected, pick a random sound
        if (zapSound === ZAP_SOUNDS.RANDOM) {
          const randomIndex = Math.floor(Math.random() * ACTUAL_ZAP_SOUNDS.length)
          soundToPlay = ACTUAL_ZAP_SOUNDS[randomIndex]
        }
        const audio = new Audio(`/sounds/${soundToPlay}.mp3`)
        audio.volume = 0.5
        audio.play().catch(() => {
          // Ignore errors (e.g., autoplay policy restrictions)
        })
      }

      setZapping(true)
      const zapResult = await lightning.zap(pubkey, event ?? recipient, sats, comment, () =>
        setOpen(false)
      )
      // user canceled
      if (!zapResult) {
        return
      }
      if (event) {
        noteStatsService.addZap(pubkey, event.id, zapResult.invoice, sats, comment)
      }
    } catch (error) {
      toast.error(`${t('Zap failed')}: ${(error as Error).message}`)
    } finally {
      setZapping(false)
    }
  }

  return (
    <>
      {/* Sats slider or input */}
      <div className="flex flex-col items-center">
        <div className="flex justify-center w-full">
          <input
            id="sats"
            value={sats}
            onChange={(e) => {
              setSats((pre) => {
                if (e.target.value === '') {
                  return 0
                }
                let num = parseInt(e.target.value, 10)
                if (isNaN(num) || num < 0) {
                  num = pre
                }
                return num
              })
            }}
            onFocus={(e) => {
              requestAnimationFrame(() => {
                const val = e.target.value
                e.target.setSelectionRange(val.length, val.length)
              })
            }}
            className="bg-transparent text-center w-full p-0 focus-visible:outline-none text-6xl font-bold"
          />
        </div>
        <Label htmlFor="sats">{t('Sats')}</Label>
      </div>

      {/* Preset sats buttons */}
      <div className="grid grid-cols-6 gap-2">
        {presetAmounts.map(({ display, val }) => (
          <Button variant="secondary" key={val} onClick={() => setSats(val)}>
            {display}
          </Button>
        ))}
      </div>

      {/* Comment input */}
      <div>
        <Label htmlFor="comment">{t('zapComment')}</Label>
        <Input id="comment" value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>

      <Button onClick={handleZap}>
        {zapping && <Loader className="animate-spin" />} {t('Zap n sats', { n: sats })}
      </Button>
    </>
  )
}
