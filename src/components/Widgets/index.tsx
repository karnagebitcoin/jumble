import { useWidgets, TWidgetId } from '@/providers/WidgetsProvider'
import { usePageTheme } from '@/providers/PageThemeProvider'
import TrendingNotesWidget from '@/components/TrendingNotes/TrendingNotesWidget'
import BitcoinTickerWidget from '@/components/BitcoinTicker/BitcoinTickerWidget'
import PinnedNoteWidget from '@/components/PinnedNoteWidget'
import AIPromptWidget from '@/components/AIPromptWidget'
import TourWidget from '@/components/TourWidget'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  'bitcoin-ticker': BitcoinTickerWidget,
  'trending-notes': TrendingNotesWidget
}

// Widgets that should be rendered as portals (fullscreen/modal)
const PORTAL_WIDGETS = ['tour']

export default function Widgets() {
  const { enabledWidgets, pinnedNoteWidgets, aiPromptWidgets } = useWidgets()
  const { pageTheme } = usePageTheme()

  // Use border for pure-black theme, shadow for others
  const widgetClassName = cn(
    "rounded-xl bg-card overflow-hidden",
    pageTheme === 'pure-black' ? "border border-neutral-900" : "shadow-lg"
  )

  // Filter out AI prompt widgets and portal widgets from the regular widget list
  const regularWidgets = enabledWidgets.filter((widgetId) => {
    return !aiPromptWidgets.find((w) => w.id === widgetId) && !PORTAL_WIDGETS.includes(widgetId)
  })

  return (
    <>
      {/* Regular widgets in the sidebar */}
      {regularWidgets.length > 0 && (
        <div className="space-y-4">
          {regularWidgets.map((widgetId) => {
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
      )}

      {/* AI prompt widgets as floating windows (rendered via portal) */}
      {aiPromptWidgets.map((aiPrompt) => {
        if (!enabledWidgets.includes(aiPrompt.id)) return null

        return createPortal(
          <AIPromptWidget key={aiPrompt.id} widgetId={aiPrompt.id} eventId={aiPrompt.eventId} />,
          document.body
        )
      })}

      {/* Tour widget as modal (rendered via portal) */}
      {enabledWidgets.includes('tour') && createPortal(
        <TourWidget key="tour" />,
        document.body
      )}
    </>
  )
}
