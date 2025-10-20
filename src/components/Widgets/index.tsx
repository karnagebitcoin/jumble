import { useWidgets, TWidgetId } from '@/providers/WidgetsProvider'
import TrendingNotesWidget from '@/components/TrendingNotes/TrendingNotesWidget'
import BitcoinTickerWidget from '@/components/BitcoinTicker/BitcoinTickerWidget'

const WIDGET_COMPONENTS: Record<TWidgetId, React.ComponentType> = {
  'bitcoin-ticker': BitcoinTickerWidget,
  'trending-notes': TrendingNotesWidget
}

export default function Widgets() {
  const { enabledWidgets, getWidgetById } = useWidgets()

  if (enabledWidgets.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {enabledWidgets.map((widgetId) => {
        const WidgetComponent = WIDGET_COMPONENTS[widgetId]
        const widget = getWidgetById(widgetId)
        if (!WidgetComponent || !widget) return null

        return (
          <div key={widgetId} className="border rounded-lg bg-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 font-semibold text-sm flex items-center gap-2">
              {widget.icon}
              <span>{widget.name}</span>
            </div>
            <WidgetComponent />
          </div>
        )
      })}
    </div>
  )
}
