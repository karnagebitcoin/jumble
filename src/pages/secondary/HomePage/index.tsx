import CompactTrendingNotes from '@/components/TrendingNotes/CompactTrendingNotes'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useTrendingNotesDismissed } from '@/providers/TrendingNotesDismissedProvider'
import { TrendingUp } from 'lucide-react'
import { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const HomePage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { trendingNotesDismissed, setTrendingNotesDismissed } = useTrendingNotesDismissed()

  // Reset the dismissed state when the HomePage is shown (on page refresh or navigation back to home)
  useEffect(() => {
    // Only reset if it was dismissed before
    if (trendingNotesDismissed) {
      setTrendingNotesDismissed(false)
    }
  }, [])

  const handleClose = () => {
    setTrendingNotesDismissed(true)
  }

  return (
    <SecondaryPageLayout
      ref={ref}
      index={index}
      title={
        <>
          <TrendingUp />
          <div>{t('Trending Notes')}</div>
        </>
      }
      hideBackButton
      hideTitlebarBottomBorder
      showCloseButton
      onClose={handleClose}
    >
      {!trendingNotesDismissed ? (
        <div className="px-4 pt-4">
          <CompactTrendingNotes />
        </div>
      ) : (
        <div className="h-full" />
      )}
    </SecondaryPageLayout>
  )
})
HomePage.displayName = 'HomePage'
export default HomePage
