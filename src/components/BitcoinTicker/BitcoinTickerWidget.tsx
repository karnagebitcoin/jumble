import WidgetContainer from '@/components/WidgetContainer'
import BitcoinTicker from './index'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { AVAILABLE_WIDGETS } from '@/providers/WidgetsProvider'

export default function BitcoinTickerWidget() {
  // Get the widget name from AVAILABLE_WIDGETS
  const widgetName = AVAILABLE_WIDGETS.find(w => w.id === 'bitcoin-ticker')?.name || 'Bitcoin Ticker'

  return (
    <WidgetContainer>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 border-b">
        <CardTitle className="font-semibold" style={{ fontSize: '14px' }}>{widgetName}</CardTitle>
      </CardHeader>
      <BitcoinTicker />
    </WidgetContainer>
  )
}
