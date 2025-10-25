/**
 * NIP-78 Preferences Provider
 *
 * Manages syncing user preferences to/from Nostr relays
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNostr } from './NostrProvider'
import nip78Service, { TSyncablePreferences } from '@/services/nip78-preferences.service'
import client from '@/services/client.service'
import { Event } from 'nostr-tools'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

type TNip78PreferencesContext = {
  isSyncing: boolean
  lastSyncedAt: number | null
  pushPreferences: () => Promise<void>
  pullPreferences: () => Promise<void>
  autoSyncEnabled: boolean
  setAutoSyncEnabled: (enabled: boolean) => void
}

const Nip78PreferencesContext = createContext<TNip78PreferencesContext | undefined>(undefined)

export const useNip78Preferences = () => {
  const context = useContext(Nip78PreferencesContext)
  if (!context) {
    throw new Error('useNip78Preferences must be used within a Nip78PreferencesProvider')
  }
  return context
}

type Nip78PreferencesProviderProps = {
  children: React.ReactNode
}

const AUTO_SYNC_ENABLED_KEY = 'nip78_auto_sync_enabled'
const LAST_SYNCED_AT_KEY = 'nip78_last_synced_at'

export function Nip78PreferencesProvider({ children }: Nip78PreferencesProviderProps) {
  const { t } = useTranslation()
  const nostr = useNostr()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(() => {
    const stored = localStorage.getItem(LAST_SYNCED_AT_KEY)
    return stored ? parseInt(stored) : null
  })
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState(() => {
    const stored = localStorage.getItem(AUTO_SYNC_ENABLED_KEY)
    return stored !== null ? stored === 'true' : true // Default to enabled
  })

  const setAutoSyncEnabled = useCallback((enabled: boolean) => {
    setAutoSyncEnabledState(enabled)
    localStorage.setItem(AUTO_SYNC_ENABLED_KEY, enabled.toString())
  }, [])

  /**
   * Push local preferences to relays
   */
  const pushPreferences = useCallback(async () => {
    if (!nostr.pubkey || !nostr.isInitialized) {
      console.warn('Cannot push preferences: user not logged in')
      return
    }

    if (isSyncing) {
      console.warn('Sync already in progress')
      return
    }

    try {
      setIsSyncing(true)
      nip78Service.startSync()

      // Get current preferences
      const preferences = nip78Service.getSyncablePreferences()

      // Create draft event
      const draftEvent = nip78Service.createPreferencesDraftEvent(preferences)

      // Publish to relays
      await nostr.publish(draftEvent, {
        skipDefaultRelays: false,
        additionalRelays: []
      })

      const now = Date.now()
      setLastSyncedAt(now)
      localStorage.setItem(LAST_SYNCED_AT_KEY, now.toString())

      console.log('Preferences pushed to relays successfully')
      toast.success(t('Preferences synced to relays'))
    } catch (error) {
      console.error('Failed to push preferences:', error)
      toast.error(t('Failed to sync preferences to relays'))
    } finally {
      setIsSyncing(false)
      nip78Service.completeSync()
    }
  }, [nostr, isSyncing, t])

  /**
   * Pull preferences from relays and apply them
   */
  const pullPreferences = useCallback(async () => {
    if (!nostr.pubkey || !nostr.isInitialized) {
      console.warn('Cannot pull preferences: user not logged in')
      return
    }

    if (isSyncing) {
      console.warn('Sync already in progress')
      return
    }

    try {
      setIsSyncing(true)
      nip78Service.startSync()

      // Query for the latest preferences event
      const events = await client.list({
        kinds: [nip78Service.getKind()],
        authors: [nostr.pubkey],
        '#d': [nip78Service.getAppIdentifier()],
        limit: 1
      })

      if (events.length === 0) {
        console.log('No synced preferences found on relays')
        return
      }

      const event = events[0]
      const preferences = nip78Service.parsePreferencesEvent(event)

      if (!preferences) {
        console.error('Failed to parse preferences event')
        return
      }

      // Apply the synced preferences
      nip78Service.applySyncedPreferences(preferences)

      const now = Date.now()
      setLastSyncedAt(now)
      localStorage.setItem(LAST_SYNCED_AT_KEY, now.toString())

      console.log('Preferences pulled from relays and applied successfully')
      toast.success(t('Preferences loaded from relays. Reloading...'))

      // Reload the page to apply all changes
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Failed to pull preferences:', error)
      toast.error(t('Failed to sync preferences from relays'))
    } finally {
      setIsSyncing(false)
      nip78Service.completeSync()
    }
  }, [nostr, isSyncing, t])

  /**
   * Auto-pull preferences when user logs in
   */
  useEffect(() => {
    if (!autoSyncEnabled || !nostr.isInitialized || !nostr.pubkey) {
      return
    }

    // Only auto-pull on first login (when lastSyncedAt is null)
    if (lastSyncedAt === null) {
      pullPreferences()
    }
  }, [autoSyncEnabled, nostr.isInitialized, nostr.pubkey, lastSyncedAt, pullPreferences])

  const value: TNip78PreferencesContext = {
    isSyncing,
    lastSyncedAt,
    pushPreferences,
    pullPreferences,
    autoSyncEnabled,
    setAutoSyncEnabled
  }

  return (
    <Nip78PreferencesContext.Provider value={value}>
      {children}
    </Nip78PreferencesContext.Provider>
  )
}
