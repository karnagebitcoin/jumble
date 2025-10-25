import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import Nip78PreferencesSettings from '@/components/Nip78PreferencesSettings'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

const SyncSettingsPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('Sync')}>
      <div className="space-y-4 mt-3">
        <Nip78PreferencesSettings />
      </div>
    </SecondaryPageLayout>
  )
})
SyncSettingsPage.displayName = 'SyncSettingsPage'
export default SyncSettingsPage
