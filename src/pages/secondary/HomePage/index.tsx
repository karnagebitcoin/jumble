import Widgets from '@/components/Widgets'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useTrendingNotesDismissed } from '@/providers/TrendingNotesDismissedProvider'
import { useWidgets } from '@/providers/WidgetsProvider'
import { useDeckView } from '@/providers/DeckViewProvider'
import { useLayoutMode } from '@/providers/LayoutModeProvider'
import { DECK_VIEW_MODE, LAYOUT_MODE } from '@/constants'
import { forwardRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const HomePage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { trendingNotesDismissed, setTrendingNotesDismissed } = useTrendingNotesDismissed()
  const { enabledWidgets, getWidgetById } = useWidgets()
  const { layoutMode } = useLayoutMode()
  const { deckViewMode } = useDeckView()

  // Check if we're in multi-column mode
  const isMultiColumn = layoutMode === LAYOUT_MODE.FULL_WIDTH && deckViewMode === DECK_VIEW_MODE.MULTI_COLUMN

  // Get the first enabled widget for the title
  const firstWidget = useMemo(() => {
    if (enabledWidgets.length === 0) return null
    return getWidgetById(enabledWidgets[0])
  }, [enabledWidgets, getWidgetById])

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
  if (isMultiColumn || trendingNotesDismissed || enabledWidgets.length === 0 || !firstWidget) {
    return <div className="h-full w-full bg-transparent" ref={ref} />
  }

  return (
    <SecondaryPageLayout
      ref={ref}
      index={index}
      title={
        <>
          {firstWidget.icon}
          <div>{t(firstWidget.name)}</div>
        </>
      }
      hideBackButton
      hideTitlebarBottomBorder
      showCloseButton
      onClose={handleClose}
    >
      <div className="px-4 pt-4">
        <Widgets />
      </div>
    </SecondaryPageLayout>
  )
})
HomePage.displayName = 'HomePage'
export default HomePage
