import { useWidgets, TWidgetId } from '@/providers/WidgetsProvider'
import TrendingNotesWidget from '@/components/TrendingNotes/TrendingNotesWidget'

const WIDGET_COMPONENTS: Record<TWidgetId, React.ComponentType> = {
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
        return <WidgetComponent key={widgetId} />
      })}
    </div>
  )
}
