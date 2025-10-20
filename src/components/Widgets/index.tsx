import { useWidgets, TWidgetId } from '@/providers/WidgetsProvider'
import TrendingNotesWidget from '@/components/TrendingNotes/TrendingNotesWidget'
import BitcoinTickerWidget from '@/components/BitcoinTicker/BitcoinTickerWidget'
import PinnedNoteWidget from '@/components/PinnedNoteWidget'

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  'bitcoin-ticker': BitcoinTickerWidget,
  'trending-notes': TrendingNotesWidget
}

export default function Widgets() {
  const { enabledWidgets, pinnedNoteWidgets } = useWidgets()

  if (enabledWidgets.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {enabledWidgets.map((widgetId) => {
        // Check if this is a pinned note widget
        const pinnedNote = pinnedNoteWidgets.find((w) => w.id === widgetId)
        if (pinnedNote) {
          return (
            <div key={widgetId} className="border rounded-xl bg-card overflow-hidden">
              <PinnedNoteWidget widgetId={widgetId} eventId={pinnedNote.eventId} />
            </div>
          )
        }

        // Otherwise, render a standard widget
        const WidgetComponent = WIDGET_COMPONENTS[widgetId]
        if (!WidgetComponent) return null

        return (
          <div key={widgetId} className="border rounded-xl bg-card overflow-hidden">
            <WidgetComponent />
          </div>
        )
      })}
    </div>
  )
}
