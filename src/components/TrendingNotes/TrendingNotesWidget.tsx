import WidgetContainer from '@/components/WidgetContainer'
import { useWidgets } from '@/providers/WidgetsProvider'
import CompactTrendingNotes from './CompactTrendingNotes'

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

  return (
    <WidgetContainer>
      <div className={`${heightClass} overflow-y-auto overflow-x-hidden scrollbar-hide p-4`}>
        <CompactTrendingNotes />
      </div>
    </WidgetContainer>
  )
}
