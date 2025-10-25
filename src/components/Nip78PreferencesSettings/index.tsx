/**
 * NIP-78 Preferences Sync Settings Component
 * 
 * Allows users to manually push/pull their preferences to/from relays
 */

import { useNip78Preferences } from '@/providers/Nip78PreferencesProvider'
import { useNostr } from '@/providers/NostrProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import { CloudUpload, CloudDownload, RefreshCcw, Shield } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Nip78PreferencesSettings() {
  const { t } = useTranslation()
  const nostr = useNostr()
  const {
    isSyncing,
    lastSyncedAt,
    pushPreferences,
    pullPreferences,
    autoSyncEnabled,
    setAutoSyncEnabled
  } = useNip78Preferences()

  if (!nostr.pubkey) {
    return null
  }

  const formatLastSyncTime = () => {
    if (!lastSyncedAt) return t('Never')
    
    const date = new Date(lastSyncedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return t('Just now')
    if (diffMins < 60) return t('{{count}} minutes ago', { count: diffMins })
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return t('{{count}} hours ago', { count: diffHours })
    
    const diffDays = Math.floor(diffHours / 24)
    return t('{{count}} days ago', { count: diffDays })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCcw className="h-5 w-5" />
          {t('Sync Settings Across Devices')}
        </CardTitle>
        <CardDescription>
          {t('Store your preferences on Nostr relays using NIP-78')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {t('Your API keys and private information are never synced. Only appearance, relays, and general preferences are stored on relays.')}
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-sync">
              {t('Auto-sync on login')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('Automatically pull preferences when logging in')}
            </p>
          </div>
          <Switch
            id="auto-sync"
            checked={autoSyncEnabled}
            onCheckedChange={setAutoSyncEnabled}
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {t('Last synced')}: {formatLastSyncTime()}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={pushPreferences}
              disabled={isSyncing}
              variant="outline"
              className="flex-1"
            >
              <CloudUpload className="mr-2 h-4 w-4" />
              {isSyncing ? t('Syncing...') : t('Push to Relays')}
            </Button>
            
            <Button
              onClick={pullPreferences}
              disabled={isSyncing}
              variant="outline"
              className="flex-1"
            >
              <CloudDownload className="mr-2 h-4 w-4" />
              {isSyncing ? t('Syncing...') : t('Pull from Relays')}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {t('Push: Save current settings to relays')}
            <br />
            {t('Pull: Load settings from relays (will reload page)')}
          </p>
        </div>

        <Alert variant="default" className="bg-muted/50">
          <AlertDescription className="text-xs">
            <strong>{t('What gets synced?')}</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>{t('Appearance (theme, colors, fonts)')}</li>
              <li>{t('Relay sets')}</li>
              <li>{t('Content filters and policies')}</li>
              <li>{t('Zap settings (amounts, sounds)')}</li>
              <li>{t('Custom feeds')}</li>
              <li>{t('Widget preferences')}</li>
            </ul>
            <strong className="mt-2 block">{t('What doesn\'t get synced?')}</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>{t('API keys')}</li>
              <li>{t('Private keys (nsec, ncryptsec)')}</li>
              <li>{t('Account credentials')}</li>
              <li>{t('Private notes')}</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
