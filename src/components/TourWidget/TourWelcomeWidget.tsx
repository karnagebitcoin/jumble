import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Compass } from 'lucide-react'
import { useWidgets } from '@/providers/WidgetsProvider'
import WidgetContainer from '@/components/WidgetContainer'
import TourWidget from './TourWidget'

export default function TourWelcomeWidget() {
  const { t } = useTranslation()
  const { toggleWidget } = useWidgets()
  const [isTourOpen, setIsTourOpen] = useState(false)

  const handleStartTour = () => {
    setIsTourOpen(true)
  }

  const handleCloseTour = () => {
    setIsTourOpen(false)
    // Disable the widget when user closes the tour
    toggleWidget('tour')
  }

  return (
    <>
      <WidgetContainer
        title={t('Welcome to Nostr')}
        dismissible
        onDismiss={() => toggleWidget('tour')}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Compass className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">{t('New to Nostr?')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('Take a quick tour to learn about decentralized social networking, relays, and how Nostr works.')}
            </p>
          </div>
          <Button 
            onClick={handleStartTour}
            className="w-full"
            size="lg"
          >
            <Compass className="h-4 w-4 mr-2" />
            {t('Start Tour')}
          </Button>
        </div>
      </WidgetContainer>

      {isTourOpen && (
        <TourWidget isOpen={isTourOpen} onClose={handleCloseTour} />
      )}
    </>
  )
}
