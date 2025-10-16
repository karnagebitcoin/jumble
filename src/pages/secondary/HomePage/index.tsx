import Widgets from '@/components/Widgets'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useTrendingNotesDismissed } from '@/providers/TrendingNotesDismissedProvider'
import { useWidgets } from '@/providers/WidgetsProvider'
import { LayoutGrid } from 'lucide-react'
import { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const HomePage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { trendingNotesDismissed, setTrendingNotesDismissed } = useTrendingNotesDismissed()
  const { enabledWidgets } = useWidgets()

  // Reset the dismissed state when the HomePage is shown (on page refresh or navigation back to home)
  useEffect(() => {
    // Only reset if it was dismissed before
    if (trendingNotesDismissed) {
      setTrendingNotesDismissed(false)
    }
  }, [])

  // Dispatch event when dismissed state changes
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('trendingNotesDismissed', { detail: { dismissed: trendingNotesDismissed } })
    )
  }, [trendingNotesDismissed])

  const handleClose = () => {
    setTrendingNotesDismissed(true)
  }

  // If dismissed or no widgets enabled, render an invisible placeholder to maintain layout
  if (trendingNotesDismissed || enabledWidgets.length === 0) {
    return <div className="h-full w-full bg-transparent" ref={ref} />
  }

  return (
    <SecondaryPageLayout
      ref={ref}
      index={index}
      title={
        <>
          <LayoutGrid />
          <div>{t('Widgets')}</div>
        </>
      }
      hideBackButton
      hideTitlebarBottomBorder
      showCloseButton
      onClose={handleClose}
    >
      <div className="px-4 pt-4">
        <Widgets />
      </div>
    </SecondaryPageLayout>
  )
})
HomePage.displayName = 'HomePage'
export default HomePage
