import Widgets from '@/components/Widgets'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useTrendingNotesDismissed } from '@/providers/TrendingNotesDismissedProvider'
import { useWidgets } from '@/providers/WidgetsProvider'
import { useDeckView } from '@/providers/DeckViewProvider'
import { useLayoutMode } from '@/providers/LayoutModeProvider'
import { DECK_VIEW_MODE, LAYOUT_MODE } from '@/constants'
import { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const HomePage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { trendingNotesDismissed, setTrendingNotesDismissed } = useTrendingNotesDismissed()
  const { enabledWidgets } = useWidgets()
  const { layoutMode } = useLayoutMode()
  const { deckViewMode } = useDeckView()

  // Check if we're in multi-column mode
  const isMultiColumn = layoutMode === LAYOUT_MODE.FULL_WIDTH && deckViewMode === DECK_VIEW_MODE.MULTI_COLUMN

  // Reset the dismissed state when the HomePage is shown (on page refresh or navigation back to home)
  useEffect(() => {
    // Only reset if it was dismissed before
    if (trendingNotesDismissed) {
      setTrendingNotesDismissed(false)
    }
  }, [])

  // Dispatch event when dismissed state changes
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('trendingNotesDismissed', { detail: { dismissed: trendingNotesDismissed } })
    )
  }, [trendingNotesDismissed])

  const handleClose = () => {
    setTrendingNotesDismissed(true)
  }

  // In multi-column mode, don't show widgets at all
  // If dismissed or no widgets enabled, render an invisible placeholder to maintain layout
  if (isMultiColumn || trendingNotesDismissed || enabledWidgets.length === 0) {
    return <div className="h-full w-full bg-transparent" ref={ref} />
  }

  return (
    <SecondaryPageLayout
      ref={ref}
      index={index}
      title={t('Widgets')}
      hideBackButton
      hideTitlebarBottomBorder
    >
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="px-4 pt-4 pb-4">
          <Widgets />
        </div>
      </div>
    </SecondaryPageLayout>
  )
})
HomePage.displayName = 'HomePage'
export default HomePage
