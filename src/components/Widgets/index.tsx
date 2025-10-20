import { useWidgets, TWidgetId } from '@/providers/WidgetsProvider'
import TrendingNotesWidget from '@/components/TrendingNotes/TrendingNotesWidget'
import BitcoinTickerWidget from '@/components/BitcoinTicker/BitcoinTickerWidget'

const WIDGET_COMPONENTS: Record<TWidgetId, React.ComponentType> = {
  'bitcoin-ticker': BitcoinTickerWidget,
  'trending-notes': TrendingNotesWidget
}

export default function Widgets() {
  const { enabledWidgets } = useWidgets()

  if (enabledWidgets.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {enabledWidgets.map((widgetId) => {
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
