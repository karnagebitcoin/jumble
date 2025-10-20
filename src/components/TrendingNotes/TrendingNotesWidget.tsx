import WidgetContainer from '@/components/WidgetContainer'
import { useWidgets } from '@/providers/WidgetsProvider'
import CompactTrendingNotes from './CompactTrendingNotes'

const HEIGHT_CLASSES = {
  short: 'max-h-[220px]',
  medium: 'max-h-[320px]',
  tall: 'max-h-[480px]'
}

export default function TrendingNotesWidget() {
  const { trendingNotesHeight } = useWidgets()

  return (
    <WidgetContainer>
      <div className={`${HEIGHT_CLASSES[trendingNotesHeight]} overflow-y-auto overflow-x-hidden scrollbar-hide p-4`}>
        <CompactTrendingNotes />
      </div>
    </WidgetContainer>
  )
}
