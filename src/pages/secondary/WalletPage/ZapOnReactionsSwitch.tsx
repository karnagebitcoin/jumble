import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useZap } from '@/providers/ZapProvider'
import { useTranslation } from 'react-i18next'

export default function ZapOnReactionsSwitch() {
  const { t } = useTranslation()
  const { zapOnReactions, updateZapOnReactions } = useZap()

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="zap-on-reactions"
        checked={zapOnReactions}
        onCheckedChange={updateZapOnReactions}
      />
      <Label htmlFor="zap-on-reactions" className="cursor-pointer">
        {t('Zap on reactions')}
      </Label>
    </div>
  )
}
