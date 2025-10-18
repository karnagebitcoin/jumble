import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useZap } from '@/providers/ZapProvider'
import { disconnect, launchModal } from '@getalby/bitcoin-connect-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import ChargeZapLimitInput from './ChargeZapLimitInput'
import ChargeZapSwitch from './ChargeZapSwitch'
import DefaultZapAmountInput from './DefaultZapAmountInput'
import DefaultZapCommentInput from './DefaultZapCommentInput'
import LightningAddressInput from './LightningAddressInput'
import QuickZapSwitch from './QuickZapSwitch'
import ZapSoundSelect from './ZapSoundSelect'

const WalletPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { isWalletConnected, walletInfo } = useZap()

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('Wallet')}>
      {isWalletConnected ? (
        <div className="px-4 pt-3 space-y-4">
          <div>
            {walletInfo?.node.alias && (
              <div className="mb-2">
                {t('Connected to')} <strong>{walletInfo.node.alias}</strong>
              </div>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">{t('Disconnect Wallet')}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('You will not be able to send zaps to others.')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => disconnect()}>
                    {t('Disconnect')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <DefaultZapAmountInput />
          <DefaultZapCommentInput />
          <QuickZapSwitch />
          <ChargeZapSwitch />
          <ChargeZapLimitInput />
          <ZapSoundSelect />
          <LightningAddressInput />
        </div>
      ) : (
        <div className="px-4 pt-3">
          <Button onClick={() => launchModal()}>
            {t('Connect a Wallet')}
          </Button>
        </div>
      )}
    </SecondaryPageLayout>
  )
})
WalletPage.displayName = 'WalletPage'
export default WalletPage
