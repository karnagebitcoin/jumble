import Widgets from '@/components/Widgets'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useWidgets } from '@/providers/WidgetsProvider'
import { useDeckView } from '@/providers/DeckViewProvider'
import { useLayoutMode } from '@/providers/LayoutModeProvider'
import { useSecondaryPage } from '@/PageManager'
import { DECK_VIEW_MODE, LAYOUT_MODE } from '@/constants'
import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const HomePage = forwardRef(({ index }: { index?: number }, ref) => {
  const { enabledWidgets } = useWidgets()
  const { layoutMode } = useLayoutMode()
  const { deckViewMode } = useDeckView()
  const { clear } = useSecondaryPage()
  const { t } = useTranslation()

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
      <div className="px-4 pt-4 pb-4 bg-transparent relative">
        {/* Floating close button - always visible */}
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="titlebar-icon"
            title={t('close')}
            onClick={() => clear()}
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <X />
          </Button>
        </div>
        <Widgets />
      </div>
    </SecondaryPageLayout>
  )
})
HomePage.displayName = 'HomePage'
export default HomePage
