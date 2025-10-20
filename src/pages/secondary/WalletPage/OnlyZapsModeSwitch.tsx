import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useZap } from '@/providers/ZapProvider'
import { useTranslation } from 'react-i18next'

export default function OnlyZapsModeSwitch() {
  const { t } = useTranslation()
  const { onlyZapsMode, updateOnlyZapsMode } = useZap()

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Label htmlFor="only-zaps-mode" className="cursor-pointer">
          {t('OnlyZaps mode')}
        </Label>
        <div className="text-sm text-muted-foreground mt-1">
          {t('This will hide the reaction button on notes')}
        </div>
      </div>
      <Switch
        id="only-zaps-mode"
        checked={onlyZapsMode}
        onCheckedChange={updateOnlyZapsMode}
      />
    </div>
  )
}
