import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { JUMBLE_API_BASE_URL } from '@/constants'
import { useNostr } from '@/providers/NostrProvider'
import { useTranslationService } from '@/providers/TranslationServiceProvider'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useJumbleTranslateAccount } from './JumbleTranslateAccountProvider'
import RegenerateApiKeyButton from './RegenerateApiKeyButton'
import TopUp from './TopUp'

export function AccountInfo() {
  const { t } = useTranslation()
  const { pubkey, startLogin } = useNostr()
  const { account } = useJumbleTranslateAccount()
  const { config, updateConfig } = useTranslationService()
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const autoTranslate = config.service === 'jumble' ? (config.auto_translate ?? false) : false

  if (!pubkey) {
    return (
      <div className="w-full flex justify-center">
        <Button onClick={() => startLogin()}>{t('Login')}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Balance display in characters */}
      <div className="space-y-2">
        <p className="font-medium">{t('Balance')}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{account?.balance.toLocaleString() ?? '0'}</p>
          <p className="text-muted-foreground">{t('characters')}</p>
        </div>
      </div>

      {/* API Key section with visibility toggle and copy functionality */}
      <div className="space-y-2">
        <p className="font-medium">API key</p>
        <div className="flex items-center gap-2">
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={account?.api_key ?? ''}
            readOnly
            className="font-mono flex-1 max-w-fit"
          />
          <Button variant="outline" onClick={() => setShowApiKey(!showApiKey)}>
            {showApiKey ? <Eye /> : <EyeOff />}
          </Button>
          <Button
            variant="outline"
            disabled={!account?.api_key}
            onClick={() => {
              if (!account?.api_key) return
              navigator.clipboard.writeText(account.api_key)
              setCopied(true)
              setTimeout(() => setCopied(false), 4000)
            }}
          >
            {copied ? <Check /> : <Copy />}
          </Button>
          <RegenerateApiKeyButton />
        </div>
        <p className="text-sm text-muted-foreground select-text">
          {t('jumbleTranslateApiKeyDescription', {
            serviceUrl: new URL('/v1/translation', JUMBLE_API_BASE_URL).toString()
          })}
        </p>
      </div>
      <TopUp />

      {/* Auto-translate toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-translate" className="text-base font-medium">
            Auto-translate notes
          </Label>
          <Switch
            id="auto-translate"
            checked={autoTranslate}
            onCheckedChange={(checked) => {
              updateConfig({
                service: 'jumble',
                auto_translate: checked
              })
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Automatically translate notes in foreign languages to English
        </p>
      </div>

      <div className="h-40" />
    </div>
  )
}
