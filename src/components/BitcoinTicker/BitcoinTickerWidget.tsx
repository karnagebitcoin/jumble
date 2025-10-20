import WidgetContainer from '@/components/WidgetContainer'
import BitcoinTicker from './index'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useSecondaryPage } from '@/PageManager'
import { useTranslation } from 'react-i18next'
import { AVAILABLE_WIDGETS } from '@/providers/WidgetsProvider'

export default function BitcoinTickerWidget() {
  const { clear } = useSecondaryPage()
  const { t } = useTranslation()

  // Get the widget name from AVAILABLE_WIDGETS
  const widgetName = AVAILABLE_WIDGETS.find(w => w.id === 'bitcoin-ticker')?.name || 'Bitcoin Ticker'

  return (
    <WidgetContainer>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-lg font-semibold">{widgetName}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          title={t('close')}
          onClick={() => clear()}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <BitcoinTicker />
    </WidgetContainer>
  )
}
