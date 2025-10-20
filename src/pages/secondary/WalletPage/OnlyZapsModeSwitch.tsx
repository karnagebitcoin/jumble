import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useZap } from '@/providers/ZapProvider'
import { useTranslation } from 'react-i18next'

export default function OnlyZapsModeSwitch() {
  const { t } = useTranslation()
  const { onlyZapsMode, updateOnlyZapsMode } = useZap()

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="only-zaps-mode"
        checked={onlyZapsMode}
        onCheckedChange={updateOnlyZapsMode}
      />
      <Label htmlFor="only-zaps-mode" className="cursor-pointer">
        {t('OnlyZaps mode')}
      </Label>
    </div>
  )
}
