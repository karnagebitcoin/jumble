/**
 * NIP-78: Application Data Storage Service
 * 
 * Stores user preferences on Nostr relays using kind 30078.
 * This allows settings to sync across devices.
 * 
 * IMPORTANT: Never store private keys, API keys, or sensitive credentials!
 */

import { Event, kinds } from 'nostr-tools'
import storage from './local-storage.service'
import { TDraftEvent } from '@/types'

const NIP78_KIND = 30078
const APP_IDENTIFIER = 'social.jumble.preferences'

/**
 * Preferences that are safe to sync across devices via NIP-78
 * 
 * EXCLUDED (for security/privacy):
 * - API keys (translation, AI, media upload configs with keys)
 * - Account/authentication data (nsec, ncryptsec, accounts)
 * - Private content (private notes)
 */
export type TSyncablePreferences = {
  // Appearance
  themeSetting?: 'light' | 'dark' | 'system'
  fontSize?: number
  fontFamily?: string
  primaryColor?: string
  buttonRadius?: number
  pageTheme?: 'default' | 'pure-black'
  compactSidebar?: boolean
  
  // Layout
  noteListMode?: 'posts' | 'postsAndReplies' | 'pictures'
  notificationListStyle?: 'compact' | 'detailed'
  distractionFreeMode?: string
  
  // Content Policy
  autoplay?: boolean
  hideUntrustedInteractions?: boolean
  hideUntrustedNotifications?: boolean
  hideUntrustedNotes?: boolean
  defaultShowNsfw?: boolean
  mediaAutoLoadPolicy?: string
  showKinds?: number[]
  hideContentMentioningMutedUsers?: boolean
  alwaysHideMutedNotes?: boolean
  hideNotificationsFromMutedUsers?: boolean
  
  // Relay Sets
  relaySets?: Array<{
    id: string
    name: string
    relayUrls: string[]
  }>
  
  // Zap Settings
  defaultZapSats?: number
  defaultZapComment?: string
  quickZap?: boolean
  zapSound?: string
  chargeZapEnabled?: boolean
  chargeZapLimit?: number
  zapOnReactions?: boolean
  onlyZapsMode?: boolean
  
  // Widgets
  enabledWidgets?: string[]
  trendingNotesHeight?: 'short' | 'medium' | 'tall' | 'remaining'
  bitcoinTickerAlignment?: 'left' | 'center'
  bitcoinTickerTextSize?: 'large' | 'small'
  
  // Custom Feeds
  customFeeds?: Array<{
    id: string
    name: string
    filters: any
  }>
  
  // Misc
  dismissedTooManyRelaysAlert?: boolean
  trendingNotesDismissed?: boolean
}

class Nip78PreferencesService {
  private static instance: Nip78PreferencesService
  private lastSyncedAt: number = 0
  private isSyncing: boolean = false

  constructor() {
    if (!Nip78PreferencesService.instance) {
      Nip78PreferencesService.instance = this
    }
    return Nip78PreferencesService.instance
  }

  /**
   * Get current syncable preferences from local storage
   */
  getSyncablePreferences(): TSyncablePreferences {
    return {
      // Appearance
      themeSetting: storage.getThemeSetting(),
      fontSize: storage.getFontSize(),
      fontFamily: storage.getFontFamily(),
      primaryColor: storage.getPrimaryColor(),
      buttonRadius: storage.getButtonRadius(),
      pageTheme: storage.getPageTheme(),
      compactSidebar: storage.getCompactSidebar(),
      
      // Layout
      noteListMode: storage.getNoteListMode(),
      notificationListStyle: storage.getNotificationListStyle(),
      distractionFreeMode: storage.getDistractionFreeMode(),
      
      // Content Policy
      autoplay: storage.getAutoplay(),
      hideUntrustedInteractions: storage.getHideUntrustedInteractions(),
      hideUntrustedNotifications: storage.getHideUntrustedNotifications(),
      hideUntrustedNotes: storage.getHideUntrustedNotes(),
      defaultShowNsfw: storage.getDefaultShowNsfw(),
      mediaAutoLoadPolicy: storage.getMediaAutoLoadPolicy(),
      showKinds: storage.getShowKinds(),
      hideContentMentioningMutedUsers: storage.getHideContentMentioningMutedUsers(),
      alwaysHideMutedNotes: storage.getAlwaysHideMutedNotes(),
      hideNotificationsFromMutedUsers: storage.getHideNotificationsFromMutedUsers(),
      
      // Relay Sets
      relaySets: storage.getRelaySets(),
      
      // Zap Settings
      defaultZapSats: storage.getDefaultZapSats(),
      defaultZapComment: storage.getDefaultZapComment(),
      quickZap: storage.getQuickZap(),
      zapSound: storage.getZapSound(),
      chargeZapEnabled: storage.getChargeZapEnabled(),
      chargeZapLimit: storage.getChargeZapLimit(),
      zapOnReactions: storage.getZapOnReactions(),
      onlyZapsMode: storage.getOnlyZapsMode(),
      
      // Widgets
      enabledWidgets: storage.getEnabledWidgets(),
      trendingNotesHeight: storage.getTrendingNotesHeight(),
      bitcoinTickerAlignment: storage.getBitcoinTickerAlignment(),
      bitcoinTickerTextSize: storage.getBitcoinTickerTextSize(),
      
      // Custom Feeds
      customFeeds: storage.getCustomFeeds(),
      
      // Misc
      dismissedTooManyRelaysAlert: storage.getDismissedTooManyRelaysAlert(),
      trendingNotesDismissed: storage.getTrendingNotesDismissed(),
    }
  }

  /**
   * Apply synced preferences to local storage
   */
  applySyncedPreferences(preferences: TSyncablePreferences) {
    // Appearance
    if (preferences.themeSetting !== undefined) {
      storage.setThemeSetting(preferences.themeSetting)
    }
    if (preferences.fontSize !== undefined) {
      storage.setFontSize(preferences.fontSize)
    }
    if (preferences.fontFamily !== undefined) {
      storage.setFontFamily(preferences.fontFamily as any)
    }
    if (preferences.primaryColor !== undefined) {
      storage.setPrimaryColor(preferences.primaryColor as any)
    }
    if (preferences.buttonRadius !== undefined) {
      storage.setButtonRadius(preferences.buttonRadius)
    }
    if (preferences.pageTheme !== undefined) {
      storage.setPageTheme(preferences.pageTheme)
    }
    if (preferences.compactSidebar !== undefined) {
      storage.setCompactSidebar(preferences.compactSidebar)
    }
    
    // Layout
    if (preferences.noteListMode !== undefined) {
      storage.setNoteListMode(preferences.noteListMode)
    }
    if (preferences.notificationListStyle !== undefined) {
      storage.setNotificationListStyle(preferences.notificationListStyle as any)
    }
    if (preferences.distractionFreeMode !== undefined) {
      storage.setDistractionFreeMode(preferences.distractionFreeMode as any)
    }
    
    // Content Policy
    if (preferences.autoplay !== undefined) {
      storage.setAutoplay(preferences.autoplay)
    }
    if (preferences.hideUntrustedInteractions !== undefined) {
      storage.setHideUntrustedInteractions(preferences.hideUntrustedInteractions)
    }
    if (preferences.hideUntrustedNotifications !== undefined) {
      storage.setHideUntrustedNotifications(preferences.hideUntrustedNotifications)
    }
    if (preferences.hideUntrustedNotes !== undefined) {
      storage.setHideUntrustedNotes(preferences.hideUntrustedNotes)
    }
    if (preferences.defaultShowNsfw !== undefined) {
      storage.setDefaultShowNsfw(preferences.defaultShowNsfw)
    }
    if (preferences.mediaAutoLoadPolicy !== undefined) {
      storage.setMediaAutoLoadPolicy(preferences.mediaAutoLoadPolicy as any)
    }
    if (preferences.showKinds !== undefined && Array.isArray(preferences.showKinds)) {
      storage.setShowKinds(preferences.showKinds)
    }
    if (preferences.hideContentMentioningMutedUsers !== undefined) {
      storage.setHideContentMentioningMutedUsers(preferences.hideContentMentioningMutedUsers)
    }
    if (preferences.alwaysHideMutedNotes !== undefined) {
      storage.setAlwaysHideMutedNotes(preferences.alwaysHideMutedNotes)
    }
    if (preferences.hideNotificationsFromMutedUsers !== undefined) {
      storage.setHideNotificationsFromMutedUsers(preferences.hideNotificationsFromMutedUsers)
    }
    
    // Relay Sets
    if (preferences.relaySets !== undefined && Array.isArray(preferences.relaySets)) {
      storage.setRelaySets(preferences.relaySets)
    }
    
    // Zap Settings
    if (preferences.defaultZapSats !== undefined) {
      storage.setDefaultZapSats(preferences.defaultZapSats)
    }
    if (preferences.defaultZapComment !== undefined) {
      storage.setDefaultZapComment(preferences.defaultZapComment)
    }
    if (preferences.quickZap !== undefined) {
      storage.setQuickZap(preferences.quickZap)
    }
    if (preferences.zapSound !== undefined) {
      storage.setZapSound(preferences.zapSound as any)
    }
    if (preferences.chargeZapEnabled !== undefined) {
      storage.setChargeZapEnabled(preferences.chargeZapEnabled)
    }
    if (preferences.chargeZapLimit !== undefined) {
      storage.setChargeZapLimit(preferences.chargeZapLimit)
    }
    if (preferences.zapOnReactions !== undefined) {
      storage.setZapOnReactions(preferences.zapOnReactions)
    }
    if (preferences.onlyZapsMode !== undefined) {
      storage.setOnlyZapsMode(preferences.onlyZapsMode)
    }
    
    // Widgets
    if (preferences.enabledWidgets !== undefined && Array.isArray(preferences.enabledWidgets)) {
      storage.setEnabledWidgets(preferences.enabledWidgets)
    }
    if (preferences.trendingNotesHeight !== undefined) {
      storage.setTrendingNotesHeight(preferences.trendingNotesHeight)
    }
    if (preferences.bitcoinTickerAlignment !== undefined) {
      storage.setBitcoinTickerAlignment(preferences.bitcoinTickerAlignment)
    }
    if (preferences.bitcoinTickerTextSize !== undefined) {
      storage.setBitcoinTickerTextSize(preferences.bitcoinTickerTextSize)
    }
    
    // Custom Feeds - be careful with validation
    if (preferences.customFeeds !== undefined && Array.isArray(preferences.customFeeds)) {
      // Clear existing custom feeds first
      const existingFeeds = storage.getCustomFeeds()
      existingFeeds.forEach(feed => storage.removeCustomFeed(feed.id))
      
      // Add synced custom feeds
      preferences.customFeeds.forEach(feed => {
        if (feed.id && feed.name) {
          storage.addCustomFeed(feed as any)
        }
      })
    }
    
    // Misc
    if (preferences.dismissedTooManyRelaysAlert !== undefined) {
      storage.setDismissedTooManyRelaysAlert(preferences.dismissedTooManyRelaysAlert)
    }
    if (preferences.trendingNotesDismissed !== undefined) {
      storage.setTrendingNotesDismissed(preferences.trendingNotesDismissed)
    }
  }

  /**
   * Create a NIP-78 draft event for syncing preferences
   */
  createPreferencesDraftEvent(preferences: TSyncablePreferences): TDraftEvent {
    return {
      kind: NIP78_KIND,
      content: JSON.stringify(preferences),
      tags: [['d', APP_IDENTIFIER]],
      created_at: Math.floor(Date.now() / 1000)
    }
  }

  /**
   * Parse preferences from a NIP-78 event
   */
  parsePreferencesEvent(event: Event): TSyncablePreferences | null {
    try {
      // Verify it's the correct kind and has the right d tag
      if (event.kind !== NIP78_KIND) {
        return null
      }
      
      const dTag = event.tags.find(tag => tag[0] === 'd')
      if (!dTag || dTag[1] !== APP_IDENTIFIER) {
        return null
      }
      
      const preferences = JSON.parse(event.content)
      return preferences as TSyncablePreferences
    } catch (error) {
      console.error('Failed to parse NIP-78 preferences event:', error)
      return null
    }
  }

  /**
   * Check if we should sync (to avoid too frequent syncs)
   */
  shouldSync(): boolean {
    const now = Date.now()
    const minSyncInterval = 60000 // 1 minute
    
    if (this.isSyncing) {
      return false
    }
    
    if (now - this.lastSyncedAt < minSyncInterval) {
      return false
    }
    
    return true
  }

  /**
   * Mark sync as started
   */
  startSync() {
    this.isSyncing = true
  }

  /**
   * Mark sync as completed
   */
  completeSync() {
    this.isSyncing = false
    this.lastSyncedAt = Date.now()
  }

  /**
   * Get the app identifier for this NIP-78 implementation
   */
  getAppIdentifier(): string {
    return APP_IDENTIFIER
  }

  /**
   * Get the kind number for NIP-78
   */
  getKind(): number {
    return NIP78_KIND
  }
}

const instance = new Nip78PreferencesService()
export default instance
