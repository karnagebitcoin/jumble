import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useZap } from '@/providers/ZapProvider'
import { useTranslation } from 'react-i18next'

export default function ChargeZapSwitch() {
  const { t } = useTranslation()
  const { chargeZapEnabled, updateChargeZapEnabled, quickZap } = useZap()

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Label htmlFor="charge-zap" className="cursor-pointer">
          {t('Enable Charge Zaps')}
        </Label>
        <div className="text-sm text-muted-foreground mt-1">
          {t('Press and hold to charge zap amount')}
        </div>
        {!quickZap && (
          <div className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
            ⚠️ {t('Quick zaps must be enabled for charge zaps')}
          </div>
        )}
      </div>
      <Switch
        id="charge-zap"
        checked={chargeZapEnabled}
        onCheckedChange={updateChargeZapEnabled}
        disabled={!quickZap}
      />
    </div>
  )
}
