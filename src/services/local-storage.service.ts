import {
  BUTTON_RADIUS_VALUES,
  DEFAULT_BUTTON_RADIUS,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_NIP_96_SERVICE,
  DEFAULT_PAGE_THEME,
  DEFAULT_PRIMARY_COLOR,
  ExtendedKind,
  FONT_FAMILIES,
  FONT_SIZES,
  MEDIA_AUTO_LOAD_POLICY,
  NOTIFICATION_LIST_STYLE,
  PRIMARY_COLORS,
  SUPPORTED_KINDS,
  StorageKey,
  TZapSound,
  ZAP_SOUNDS
} from '@/constants'
import { isSameAccount } from '@/lib/account'
import { randomString } from '@/lib/random'
import {
  TAccount,
  TAccountPointer,
  TCustomFeed,
  TFeedInfo,
  TFontFamily,
  TMediaAutoLoadPolicy,
  TMediaUploadServiceConfig,
  TNoteListMode,
  TNotificationStyle,
  TPageTheme,
  TPrimaryColor,
  TRelaySet,
  TThemeSetting,
  TTranslationServiceConfig
} from '@/types'

class LocalStorageService {
  static instance: LocalStorageService

  private relaySets: TRelaySet[] = []
  private themeSetting: TThemeSetting = 'system'
  private accounts: TAccount[] = []
  private currentAccount: TAccount | null = null
  private noteListMode: TNoteListMode = 'posts'
  private lastReadNotificationTimeMap: Record<string, number> = {}
  private defaultZapSats: number = 21
  private defaultZapComment: string = 'Zap!'
  private quickZap: boolean = false
  private accountFeedInfoMap: Record<string, TFeedInfo | undefined> = {}
  private mediaUploadService: string = DEFAULT_NIP_96_SERVICE
  private autoplay: boolean = true
  private hideUntrustedInteractions: boolean = false
  private hideUntrustedNotifications: boolean = false
  private hideUntrustedNotes: boolean = false
  private translationServiceConfigMap: Record<string, TTranslationServiceConfig> = {}
  private mediaUploadServiceConfigMap: Record<string, TMediaUploadServiceConfig> = {}
  private defaultShowNsfw: boolean = false
  private dismissedTooManyRelaysAlert: boolean = false
  private showKinds: number[] = []
  private hideContentMentioningMutedUsers: boolean = false
  private alwaysHideMutedNotes: boolean = false
  private hideNotificationsFromMutedUsers: boolean = false
  private notificationListStyle: TNotificationStyle = NOTIFICATION_LIST_STYLE.DETAILED
  private mediaAutoLoadPolicy: TMediaAutoLoadPolicy = MEDIA_AUTO_LOAD_POLICY.ALWAYS
  private shownCreateWalletGuideToastPubkeys: Set<string> = new Set()
  private sidebarCollapse: boolean = false

  constructor() {
    if (!LocalStorageService.instance) {
      this.init()
      LocalStorageService.instance = this
    }
    return LocalStorageService.instance
  }

  init() {
    this.themeSetting =
      (window.localStorage.getItem(StorageKey.THEME_SETTING) as TThemeSetting) ?? 'system'
    const accountsStr = window.localStorage.getItem(StorageKey.ACCOUNTS)
    this.accounts = accountsStr ? JSON.parse(accountsStr) : []
    const currentAccountStr = window.localStorage.getItem(StorageKey.CURRENT_ACCOUNT)
    this.currentAccount = currentAccountStr ? JSON.parse(currentAccountStr) : null
    const noteListModeStr = window.localStorage.getItem(StorageKey.NOTE_LIST_MODE)
    this.noteListMode =
      noteListModeStr && ['posts', 'postsAndReplies', 'pictures'].includes(noteListModeStr)
        ? (noteListModeStr as TNoteListMode)
        : 'posts'
    const lastReadNotificationTimeMapStr =
      window.localStorage.getItem(StorageKey.LAST_READ_NOTIFICATION_TIME_MAP) ?? '{}'
    this.lastReadNotificationTimeMap = JSON.parse(lastReadNotificationTimeMapStr)

    const relaySetsStr = window.localStorage.getItem(StorageKey.RELAY_SETS)
    if (!relaySetsStr) {
      let relaySets: TRelaySet[] = []
      const legacyRelayGroupsStr = window.localStorage.getItem('relayGroups')
      if (legacyRelayGroupsStr) {
        const legacyRelayGroups = JSON.parse(legacyRelayGroupsStr)
        relaySets = legacyRelayGroups.map((group: any) => {
          return {
            id: randomString(),
            name: group.groupName,
            relayUrls: group.relayUrls
          }
        })
      }
      if (!relaySets.length) {
        relaySets = []
      }
      window.localStorage.setItem(StorageKey.RELAY_SETS, JSON.stringify(relaySets))
      this.relaySets = relaySets
    } else {
      this.relaySets = JSON.parse(relaySetsStr)
    }

    const defaultZapSatsStr = window.localStorage.getItem(StorageKey.DEFAULT_ZAP_SATS)
    if (defaultZapSatsStr) {
      const num = parseInt(defaultZapSatsStr)
      if (!isNaN(num)) {
        this.defaultZapSats = num
      }
    }
    this.defaultZapComment = window.localStorage.getItem(StorageKey.DEFAULT_ZAP_COMMENT) ?? 'Zap!'
    this.quickZap = window.localStorage.getItem(StorageKey.QUICK_ZAP) === 'true'

    const accountFeedInfoMapStr =
      window.localStorage.getItem(StorageKey.ACCOUNT_FEED_INFO_MAP) ?? '{}'
    this.accountFeedInfoMap = JSON.parse(accountFeedInfoMapStr)

    // deprecated
    this.mediaUploadService =
      window.localStorage.getItem(StorageKey.MEDIA_UPLOAD_SERVICE) ?? DEFAULT_NIP_96_SERVICE

    this.autoplay = window.localStorage.getItem(StorageKey.AUTOPLAY) !== 'false'

    const hideUntrustedEvents =
      window.localStorage.getItem(StorageKey.HIDE_UNTRUSTED_EVENTS) === 'true'
    const storedHideUntrustedInteractions = window.localStorage.getItem(
      StorageKey.HIDE_UNTRUSTED_INTERACTIONS
    )
    const storedHideUntrustedNotifications = window.localStorage.getItem(
      StorageKey.HIDE_UNTRUSTED_NOTIFICATIONS
    )
    const storedHideUntrustedNotes = window.localStorage.getItem(StorageKey.HIDE_UNTRUSTED_NOTES)
    this.hideUntrustedInteractions = storedHideUntrustedInteractions
      ? storedHideUntrustedInteractions === 'true'
      : hideUntrustedEvents
    this.hideUntrustedNotifications = storedHideUntrustedNotifications
      ? storedHideUntrustedNotifications === 'true'
      : hideUntrustedEvents
    this.hideUntrustedNotes = storedHideUntrustedNotes
      ? storedHideUntrustedNotes === 'true'
      : hideUntrustedEvents

    const translationServiceConfigMapStr = window.localStorage.getItem(
      StorageKey.TRANSLATION_SERVICE_CONFIG_MAP
    )
    if (translationServiceConfigMapStr) {
      this.translationServiceConfigMap = JSON.parse(translationServiceConfigMapStr)
    }

    const mediaUploadServiceConfigMapStr = window.localStorage.getItem(
      StorageKey.MEDIA_UPLOAD_SERVICE_CONFIG_MAP
    )
    if (mediaUploadServiceConfigMapStr) {
      this.mediaUploadServiceConfigMap = JSON.parse(mediaUploadServiceConfigMapStr)
    }

    this.defaultShowNsfw = window.localStorage.getItem(StorageKey.DEFAULT_SHOW_NSFW) === 'true'

    this.dismissedTooManyRelaysAlert =
      window.localStorage.getItem(StorageKey.DISMISSED_TOO_MANY_RELAYS_ALERT) === 'true'

    const showKindsStr = window.localStorage.getItem(StorageKey.SHOW_KINDS)
    if (!showKindsStr) {
      this.showKinds = SUPPORTED_KINDS
    } else {
      const showKindsVersionStr = window.localStorage.getItem(StorageKey.SHOW_KINDS_VERSION)
      const showKindsVersion = showKindsVersionStr ? parseInt(showKindsVersionStr) : 0
      const showKinds = JSON.parse(showKindsStr) as number[]
      if (showKindsVersion < 1) {
        showKinds.push(ExtendedKind.VIDEO, ExtendedKind.SHORT_VIDEO)
      }
      this.showKinds = showKinds
    }
    window.localStorage.setItem(StorageKey.SHOW_KINDS, JSON.stringify(this.showKinds))
    window.localStorage.setItem(StorageKey.SHOW_KINDS_VERSION, '1')

    this.hideContentMentioningMutedUsers =
      window.localStorage.getItem(StorageKey.HIDE_CONTENT_MENTIONING_MUTED_USERS) === 'true'

    this.alwaysHideMutedNotes =
      window.localStorage.getItem(StorageKey.ALWAYS_HIDE_MUTED_NOTES) === 'true'

    this.hideNotificationsFromMutedUsers =
      window.localStorage.getItem(StorageKey.HIDE_NOTIFICATIONS_FROM_MUTED_USERS) === 'true'

    this.notificationListStyle =
      window.localStorage.getItem(StorageKey.NOTIFICATION_LIST_STYLE) ===
      NOTIFICATION_LIST_STYLE.COMPACT
        ? NOTIFICATION_LIST_STYLE.COMPACT
        : NOTIFICATION_LIST_STYLE.DETAILED

    const mediaAutoLoadPolicy = window.localStorage.getItem(StorageKey.MEDIA_AUTO_LOAD_POLICY)
    if (
      mediaAutoLoadPolicy &&
      Object.values(MEDIA_AUTO_LOAD_POLICY).includes(mediaAutoLoadPolicy as TMediaAutoLoadPolicy)
    ) {
      this.mediaAutoLoadPolicy = mediaAutoLoadPolicy as TMediaAutoLoadPolicy
    }

    const shownCreateWalletGuideToastPubkeysStr = window.localStorage.getItem(
      StorageKey.SHOWN_CREATE_WALLET_GUIDE_TOAST_PUBKEYS
    )
    this.shownCreateWalletGuideToastPubkeys = shownCreateWalletGuideToastPubkeysStr
      ? new Set(JSON.parse(shownCreateWalletGuideToastPubkeysStr))
      : new Set()

    this.sidebarCollapse = window.localStorage.getItem(StorageKey.SIDEBAR_COLLAPSE) === 'true'

    // Clean up deprecated data
    window.localStorage.removeItem(StorageKey.ACCOUNT_PROFILE_EVENT_MAP)
    window.localStorage.removeItem(StorageKey.ACCOUNT_FOLLOW_LIST_EVENT_MAP)
    window.localStorage.removeItem(StorageKey.ACCOUNT_RELAY_LIST_EVENT_MAP)
    window.localStorage.removeItem(StorageKey.ACCOUNT_MUTE_LIST_EVENT_MAP)
    window.localStorage.removeItem(StorageKey.ACCOUNT_MUTE_DECRYPTED_TAGS_MAP)
    window.localStorage.removeItem(StorageKey.ACTIVE_RELAY_SET_ID)
    window.localStorage.removeItem(StorageKey.FEED_TYPE)
  }

  getRelaySets() {
    return this.relaySets
  }

  setRelaySets(relaySets: TRelaySet[]) {
    this.relaySets = relaySets
    window.localStorage.setItem(StorageKey.RELAY_SETS, JSON.stringify(this.relaySets))
  }

  getThemeSetting() {
    return this.themeSetting
  }

  setThemeSetting(themeSetting: TThemeSetting) {
    window.localStorage.setItem(StorageKey.THEME_SETTING, themeSetting)
    this.themeSetting = themeSetting
  }

  getNoteListMode() {
    return this.noteListMode
  }

  setNoteListMode(mode: TNoteListMode) {
    window.localStorage.setItem(StorageKey.NOTE_LIST_MODE, mode)
    this.noteListMode = mode
  }

  getAccounts() {
    return this.accounts
  }

  findAccount(account: TAccountPointer) {
    return this.accounts.find((act) => isSameAccount(act, account))
  }

  getCurrentAccount() {
    return this.currentAccount
  }

  getAccountNsec(pubkey: string) {
    const account = this.accounts.find((act) => act.pubkey === pubkey && act.signerType === 'nsec')
    return account?.nsec
  }

  getAccountNcryptsec(pubkey: string) {
    const account = this.accounts.find(
      (act) => act.pubkey === pubkey && act.signerType === 'ncryptsec'
    )
    return account?.ncryptsec
  }

  addAccount(account: TAccount) {
    const index = this.accounts.findIndex((act) => isSameAccount(act, account))
    if (index !== -1) {
      this.accounts[index] = account
    } else {
      this.accounts.push(account)
    }
    window.localStorage.setItem(StorageKey.ACCOUNTS, JSON.stringify(this.accounts))
    return this.accounts
  }

  removeAccount(account: TAccount) {
    this.accounts = this.accounts.filter((act) => !isSameAccount(act, account))
    window.localStorage.setItem(StorageKey.ACCOUNTS, JSON.stringify(this.accounts))
    return this.accounts
  }

  switchAccount(account: TAccount | null) {
    if (isSameAccount(this.currentAccount, account)) {
      return
    }
    const act = this.accounts.find((act) => isSameAccount(act, account))
    if (!act) {
      return
    }
    this.currentAccount = act
    window.localStorage.setItem(StorageKey.CURRENT_ACCOUNT, JSON.stringify(act))
  }

  getDefaultZapSats() {
    return this.defaultZapSats
  }

  setDefaultZapSats(sats: number) {
    this.defaultZapSats = sats
    window.localStorage.setItem(StorageKey.DEFAULT_ZAP_SATS, sats.toString())
  }

  getDefaultZapComment() {
    return this.defaultZapComment
  }

  setDefaultZapComment(comment: string) {
    this.defaultZapComment = comment
    window.localStorage.setItem(StorageKey.DEFAULT_ZAP_COMMENT, comment)
  }

  getQuickZap() {
    return this.quickZap
  }

  setQuickZap(quickZap: boolean) {
    this.quickZap = quickZap
    window.localStorage.setItem(StorageKey.QUICK_ZAP, quickZap.toString())
  }

  getChargeZapEnabled() {
    return this.chargeZapEnabled
  }

  setChargeZapEnabled(enabled: boolean) {
    this.chargeZapEnabled = enabled
    window.localStorage.setItem(StorageKey.CHARGE_ZAP_ENABLED, enabled.toString())
  }

  getChargeZapLimit() {
    return this.chargeZapLimit
  }

  setChargeZapLimit(limit: number) {
    this.chargeZapLimit = limit
    window.localStorage.setItem(StorageKey.CHARGE_ZAP_LIMIT, limit.toString())
  }

  getLastReadNotificationTime(pubkey: string) {
    return this.lastReadNotificationTimeMap[pubkey] ?? 0
  }

  setLastReadNotificationTime(pubkey: string, time: number) {
    this.lastReadNotificationTimeMap[pubkey] = time
    window.localStorage.setItem(
      StorageKey.LAST_READ_NOTIFICATION_TIME_MAP,
      JSON.stringify(this.lastReadNotificationTimeMap)
    )
  }

  getFeedInfo(pubkey: string) {
    return this.accountFeedInfoMap[pubkey]
  }

  setFeedInfo(info: TFeedInfo, pubkey?: string | null) {
    this.accountFeedInfoMap[pubkey ?? 'default'] = info
    window.localStorage.setItem(
      StorageKey.ACCOUNT_FEED_INFO_MAP,
      JSON.stringify(this.accountFeedInfoMap)
    )
  }

  getAutoplay() {
    return this.autoplay
  }

  setAutoplay(autoplay: boolean) {
    this.autoplay = autoplay
    window.localStorage.setItem(StorageKey.AUTOPLAY, autoplay.toString())
  }

  getHideUntrustedInteractions() {
    return this.hideUntrustedInteractions
  }

  setHideUntrustedInteractions(hideUntrustedInteractions: boolean) {
    this.hideUntrustedInteractions = hideUntrustedInteractions
    window.localStorage.setItem(
      StorageKey.HIDE_UNTRUSTED_INTERACTIONS,
      hideUntrustedInteractions.toString()
    )
  }

  getHideUntrustedNotifications() {
    return this.hideUntrustedNotifications
  }

  setHideUntrustedNotifications(hideUntrustedNotifications: boolean) {
    this.hideUntrustedNotifications = hideUntrustedNotifications
    window.localStorage.setItem(
      StorageKey.HIDE_UNTRUSTED_NOTIFICATIONS,
      hideUntrustedNotifications.toString()
    )
  }

  getHideUntrustedNotes() {
    return this.hideUntrustedNotes
  }

  setHideUntrustedNotes(hideUntrustedNotes: boolean) {
    this.hideUntrustedNotes = hideUntrustedNotes
    window.localStorage.setItem(StorageKey.HIDE_UNTRUSTED_NOTES, hideUntrustedNotes.toString())
  }

  getTranslationServiceConfig(pubkey?: string | null) {
    return this.translationServiceConfigMap[pubkey ?? '_'] ?? { service: 'jumble' }
  }

  setTranslationServiceConfig(config: TTranslationServiceConfig, pubkey?: string | null) {
    this.translationServiceConfigMap[pubkey ?? '_'] = config
    window.localStorage.setItem(
      StorageKey.TRANSLATION_SERVICE_CONFIG_MAP,
      JSON.stringify(this.translationServiceConfigMap)
    )
  }

  getMediaUploadServiceConfig(pubkey?: string | null): TMediaUploadServiceConfig {
    const defaultConfig = { type: 'nip96', service: this.mediaUploadService } as const
    if (!pubkey) {
      return defaultConfig
    }
    return this.mediaUploadServiceConfigMap[pubkey] ?? defaultConfig
  }

  setMediaUploadServiceConfig(
    pubkey: string,
    config: TMediaUploadServiceConfig
  ): TMediaUploadServiceConfig {
    this.mediaUploadServiceConfigMap[pubkey] = config
    window.localStorage.setItem(
      StorageKey.MEDIA_UPLOAD_SERVICE_CONFIG_MAP,
      JSON.stringify(this.mediaUploadServiceConfigMap)
    )
    return config
  }

  getDefaultShowNsfw() {
    return this.defaultShowNsfw
  }

  setDefaultShowNsfw(defaultShowNsfw: boolean) {
    this.defaultShowNsfw = defaultShowNsfw
    window.localStorage.setItem(StorageKey.DEFAULT_SHOW_NSFW, defaultShowNsfw.toString())
  }

  getDismissedTooManyRelaysAlert() {
    return this.dismissedTooManyRelaysAlert
  }

  setDismissedTooManyRelaysAlert(dismissed: boolean) {
    this.dismissedTooManyRelaysAlert = dismissed
    window.localStorage.setItem(StorageKey.DISMISSED_TOO_MANY_RELAYS_ALERT, dismissed.toString())
  }

  getShowKinds() {
    return this.showKinds
  }

  setShowKinds(kinds: number[]) {
    this.showKinds = kinds
    window.localStorage.setItem(StorageKey.SHOW_KINDS, JSON.stringify(kinds))
  }

  getHideContentMentioningMutedUsers() {
    return this.hideContentMentioningMutedUsers
  }

  setHideContentMentioningMutedUsers(hide: boolean) {
    this.hideContentMentioningMutedUsers = hide
    window.localStorage.setItem(StorageKey.HIDE_CONTENT_MENTIONING_MUTED_USERS, hide.toString())
  }

  getAlwaysHideMutedNotes() {
    return this.alwaysHideMutedNotes
  }

  setAlwaysHideMutedNotes(hide: boolean) {
    this.alwaysHideMutedNotes = hide
    window.localStorage.setItem(StorageKey.ALWAYS_HIDE_MUTED_NOTES, hide.toString())
  }

  getHideNotificationsFromMutedUsers() {
    return this.hideNotificationsFromMutedUsers
  }

  setHideNotificationsFromMutedUsers(hide: boolean) {
    this.hideNotificationsFromMutedUsers = hide
    window.localStorage.setItem(StorageKey.HIDE_NOTIFICATIONS_FROM_MUTED_USERS, hide.toString())
  }

  getNotificationListStyle() {
    return this.notificationListStyle
  }

  setNotificationListStyle(style: TNotificationStyle) {
    this.notificationListStyle = style
    window.localStorage.setItem(StorageKey.NOTIFICATION_LIST_STYLE, style)
  }

  getMediaAutoLoadPolicy() {
    return this.mediaAutoLoadPolicy
  }

  setMediaAutoLoadPolicy(policy: TMediaAutoLoadPolicy) {
    this.mediaAutoLoadPolicy = policy
    window.localStorage.setItem(StorageKey.MEDIA_AUTO_LOAD_POLICY, policy)
  }

  hasShownCreateWalletGuideToast(pubkey: string) {
    return this.shownCreateWalletGuideToastPubkeys.has(pubkey)
  }

  markCreateWalletGuideToastAsShown(pubkey: string) {
    if (this.shownCreateWalletGuideToastPubkeys.has(pubkey)) {
      return
    }
    this.shownCreateWalletGuideToastPubkeys.add(pubkey)
    window.localStorage.setItem(
      StorageKey.SHOWN_CREATE_WALLET_GUIDE_TOAST_PUBKEYS,
      JSON.stringify(Array.from(this.shownCreateWalletGuideToastPubkeys))
    )
  }

  getSidebarCollapse() {
    return this.sidebarCollapse
  }

  setSidebarCollapse(collapse: boolean) {
    this.sidebarCollapse = collapse
    window.localStorage.setItem(StorageKey.SIDEBAR_COLLAPSE, collapse.toString())
  }
}

const instance = new LocalStorageService()
export default instance
