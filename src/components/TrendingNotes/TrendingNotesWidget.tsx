import WidgetContainer from '@/components/WidgetContainer'
import CompactTrendingNotes from './CompactTrendingNotes'

export default function TrendingNotesWidget() {
  return (
    <WidgetContainer className="max-h-[600px]">
      <CompactTrendingNotes />
    </WidgetContainer>
  )
}
