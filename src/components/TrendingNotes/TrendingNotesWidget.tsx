import WidgetContainer from '@/components/WidgetContainer'
import { useWidgets } from '@/providers/WidgetsProvider'
import CompactTrendingNotes from './CompactTrendingNotes'
import { useTranslation } from 'react-i18next'

const HEIGHT_CLASSES = {
  short: 'max-h-[220px]',
  medium: 'max-h-[320px]',
  tall: 'max-h-[480px]'
}

export default function TrendingNotesWidget() {
  const { trendingNotesHeight, enabledWidgets } = useWidgets()
  const { t } = useTranslation()

  // Check if trending notes is the only enabled widget
  // (other widgets could be pinned notes or bitcoin ticker)
  const otherWidgets = enabledWidgets.filter(id => id !== 'trending-notes')
  const isOnlyWidget = otherWidgets.length === 0

  // Use full height if it's the only widget, otherwise use the configured height
  const heightClass = isOnlyWidget ? 'h-full' : HEIGHT_CLASSES[trendingNotesHeight]

  return (
    <WidgetContainer className={isOnlyWidget ? 'h-full' : ''}>
      {isOnlyWidget && (
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-lg font-semibold">{t('Trending Notes')}</h2>
        </div>
      )}
      <div className={`${heightClass} overflow-y-auto overflow-x-hidden scrollbar-hide ${isOnlyWidget ? 'px-4 pb-4' : 'p-4'}`}>
        <CompactTrendingNotes />
      </div>
    </WidgetContainer>
  )
}
