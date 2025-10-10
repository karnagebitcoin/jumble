import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDeepBrowsing } from '@/providers/DeepBrowsingProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { hasBackgroundAudioAtom } from '@/services/media-manager.service'
import { useAtomValue } from 'jotai'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTopButton({
  scrollAreaRef,
  className
}: {
  scrollAreaRef?: React.RefObject<HTMLDivElement>
  className?: string
}) {
  const { isSmallScreen } = useScreenSize()
  const { deepBrowsing, lastScrollTop } = useDeepBrowsing()
  const hasBackgroundAudio = useAtomValue(hasBackgroundAudioAtom)
  const visible = !deepBrowsing && lastScrollTop > 800

  const handleScrollToTop = () => {
    if (!scrollAreaRef) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className={cn(
        `fixed sm:sticky z-30 flex justify-end w-full pr-3 pointer-events-none transition-opacity duration-700 ${visible ? '' : 'opacity-0'}`,
        className
      )}
      style={{
        bottom: isSmallScreen
          ? `calc(env(safe-area-inset-bottom) + ${hasBackgroundAudio ? 7.25 : 3.85}rem)`
          : `calc(env(safe-area-inset-bottom) + 0.85rem)`
      }}
    >
      <Button
        variant="secondary-2"
        className="rounded-full w-12 h-12 p-0 hover:text-background pointer-events-auto disabled:pointer-events-none"
        onClick={handleScrollToTop}
        disabled={!visible}
      >
        <ChevronUp />
      </Button>
    </div>
  )
}
