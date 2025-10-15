import CompactTrendingNotes from '@/components/TrendingNotes/CompactTrendingNotes'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { TrendingUp } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

const HomePage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()

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
    >
      <div className="px-4 pt-4">
        <CompactTrendingNotes />
      </div>
    </SecondaryPageLayout>
  )
})
HomePage.displayName = 'HomePage'
export default HomePage
