import WidgetContainer from '@/components/WidgetContainer'
import CompactTrendingNotes from './CompactTrendingNotes'

export default function TrendingNotesWidget() {
  return (
    <WidgetContainer>
      <div className="max-h-[calc(var(--vh,100vh)-8rem)] overflow-y-auto overflow-x-hidden scrollbar-hide">
        <CompactTrendingNotes />
      </div>
    </WidgetContainer>
  )
}
