import WidgetContainer from '@/components/WidgetContainer'
import { useWidgets, AVAILABLE_WIDGETS } from '@/providers/WidgetsProvider'
import CompactTrendingNotes from './CompactTrendingNotes'
import { useTranslation } from 'react-i18next'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useSecondaryPage } from '@/PageManager'

const HEIGHT_CLASSES = {
  short: 'max-h-[220px]',
  medium: 'max-h-[320px]',
  tall: 'max-h-[480px]'
}

export default function TrendingNotesWidget() {
  const { trendingNotesHeight, enabledWidgets } = useWidgets()
  const { t } = useTranslation()
  const { clear } = useSecondaryPage()

  // Check if trending notes is the only enabled widget
  // (other widgets could be pinned notes or bitcoin ticker)
  const otherWidgets = enabledWidgets.filter(id => id !== 'trending-notes')
  const isOnlyWidget = otherWidgets.length === 0

  // Use full height if it's the only widget, otherwise use the configured height
  const heightClass = isOnlyWidget ? 'h-full' : HEIGHT_CLASSES[trendingNotesHeight]

  // Get the widget name from AVAILABLE_WIDGETS
  const widgetName = AVAILABLE_WIDGETS.find(w => w.id === 'trending-notes')?.name || 'Trending Notes'

  return (
    <WidgetContainer className={isOnlyWidget ? 'h-full' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-lg font-semibold">{widgetName}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          title={t('close')}
          onClick={() => clear()}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <div className={`${heightClass} overflow-y-auto overflow-x-hidden scrollbar-hide px-4 pb-4`}>
        <CompactTrendingNotes />
      </div>
    </WidgetContainer>
  )
}
