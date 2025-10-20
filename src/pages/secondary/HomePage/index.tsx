import Widgets from '@/components/Widgets'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useWidgets } from '@/providers/WidgetsProvider'
import { useDeckView } from '@/providers/DeckViewProvider'
import { useLayoutMode } from '@/providers/LayoutModeProvider'
import { DECK_VIEW_MODE, LAYOUT_MODE } from '@/constants'
import { forwardRef } from 'react'

const HomePage = forwardRef(({ index }: { index?: number }, ref) => {
  const { enabledWidgets } = useWidgets()
  const { layoutMode } = useLayoutMode()
  const { deckViewMode } = useDeckView()

  // Check if we're in multi-column mode
  const isMultiColumn = layoutMode === LAYOUT_MODE.FULL_WIDTH && deckViewMode === DECK_VIEW_MODE.MULTI_COLUMN

  // In multi-column mode or no widgets enabled, render an invisible placeholder to maintain layout
  if (isMultiColumn || enabledWidgets.length === 0) {
    return <div className="h-full w-full bg-transparent" ref={ref} />
  }

  return (
    <SecondaryPageLayout
      ref={ref}
      index={index}
      hideTitlebar
    >
      <div className="px-4 pt-4 pb-4 bg-transparent">
        <Widgets />
      </div>
    </SecondaryPageLayout>
  )
})
HomePage.displayName = 'HomePage'
export default HomePage
