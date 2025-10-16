import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { TZapSound, ZAP_SOUNDS } from '@/constants'
import { useZap } from '@/providers/ZapProvider'
import { useTranslation } from 'react-i18next'

export default function ZapSoundSelect() {
  const { t } = useTranslation()
  const { zapSound, updateZapSound } = useZap()

  const handleChange = (value: TZapSound) => {
    updateZapSound(value)

    // Play the selected sound as a preview
    if (value !== ZAP_SOUNDS.NONE) {
      const audio = new Audio(`/sounds/${value}.mp3`)
      audio.volume = 0.5
      audio.play().catch(() => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
      })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="zap-sound">{t('Zap Sound')}</Label>
      <Select value={zapSound} onValueChange={handleChange}>
        <SelectTrigger id="zap-sound">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ZAP_SOUNDS.NONE}>{t('None')}</SelectItem>
          <SelectItem value={ZAP_SOUNDS.ZAP1}>{t('Zap Sound 1')}</SelectItem>
          <SelectItem value={ZAP_SOUNDS.ELECTRIC_ZAP}>{t('Electric Zap')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
