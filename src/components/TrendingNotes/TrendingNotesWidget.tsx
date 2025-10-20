import WidgetContainer from '@/components/WidgetContainer'
import { useWidgets, AVAILABLE_WIDGETS } from '@/providers/WidgetsProvider'
import CompactTrendingNotes from './CompactTrendingNotes'
import { CardHeader, CardTitle } from '@/components/ui/card'

const HEIGHT_CLASSES = {
  short: 'max-h-[220px]',
  medium: 'max-h-[320px]',
  tall: 'max-h-[480px]'
}

export default function TrendingNotesWidget() {
  const { trendingNotesHeight, enabledWidgets } = useWidgets()

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 border-b">
        <CardTitle className="font-semibold" style={{ fontSize: '14px' }}>{widgetName}</CardTitle>
      </CardHeader>
      <div className={`${heightClass} overflow-y-auto overflow-x-hidden scrollbar-hide px-4 pb-4`}>
        <CompactTrendingNotes />
      </div>
    </WidgetContainer>
  )
}
