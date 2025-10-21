import { useWidgets, TWidgetId } from '@/providers/WidgetsProvider'
import { usePageTheme } from '@/providers/PageThemeProvider'
import TrendingNotesWidget from '@/components/TrendingNotes/TrendingNotesWidget'
import BitcoinTickerWidget from '@/components/BitcoinTicker/BitcoinTickerWidget'
import PinnedNoteWidget from '@/components/PinnedNoteWidget'
import { cn } from '@/lib/utils'

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  'bitcoin-ticker': BitcoinTickerWidget,
  'trending-notes': TrendingNotesWidget
}

export default function Widgets() {
  const { enabledWidgets, pinnedNoteWidgets } = useWidgets()
  const { pageTheme } = usePageTheme()

  if (enabledWidgets.length === 0) {
    return null
  }

  // Use border for pure-black theme, shadow for others
  const widgetClassName = cn(
    "rounded-xl bg-card overflow-hidden",
    pageTheme === 'pure-black' ? "border border-neutral-900" : "shadow-lg"
  )

  return (
    <div className="space-y-4">
      {enabledWidgets.map((widgetId) => {
        // Check if this is a pinned note widget
        const pinnedNote = pinnedNoteWidgets.find((w) => w.id === widgetId)
        if (pinnedNote) {
          return (
            <div key={widgetId} className={widgetClassName}>
              <PinnedNoteWidget widgetId={widgetId} eventId={pinnedNote.eventId} />
            </div>
          )
        }

        // Otherwise, render a standard widget
        const WidgetComponent = WIDGET_COMPONENTS[widgetId]
        if (!WidgetComponent) return null

        return (
          <div key={widgetId} className={widgetClassName}>
            <WidgetComponent />
          </div>
        )
      })}
    </div>
  )
}
