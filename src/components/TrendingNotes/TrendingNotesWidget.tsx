import WidgetContainer from '@/components/WidgetContainer'
import CompactTrendingNotes from './CompactTrendingNotes'

export default function TrendingNotesWidget() {
  return (
    <WidgetContainer>
      <div className="max-h-[600px] overflow-y-auto overflow-x-hidden scrollbar-hide">
        <CompactTrendingNotes />
      </div>
    </WidgetContainer>
  )
}
