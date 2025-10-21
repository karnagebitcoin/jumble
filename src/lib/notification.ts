import { kinds, NostrEvent } from 'nostr-tools'
import { isMentioningMutedUsers } from './event'
import { tagNameEquals } from './tag'

export function notificationFilter(
  event: NostrEvent,
  {
    pubkey,
    mutePubkeySet,
    hideContentMentioningMutedUsers,
    hideNotificationsFromMutedUsers,
    hideUntrustedNotifications,
    isUserTrusted
  }: {
    pubkey?: string | null
    mutePubkeySet: Set<string>
    hideContentMentioningMutedUsers?: boolean
    hideNotificationsFromMutedUsers?: boolean
    hideUntrustedNotifications?: boolean
    isUserTrusted: (pubkey: string) => boolean
  }
): boolean {
  // For zap events, the actual sender is in the 'P' tag, not event.pubkey
  let senderPubkey = event.pubkey
  if (event.kind === kinds.Zap) {
    const zapSenderTag = event.tags.find(tagNameEquals('P'))
    if (zapSenderTag) {
      senderPubkey = zapSenderTag[1]
    }
  }

  if (
    (hideNotificationsFromMutedUsers && mutePubkeySet.has(senderPubkey)) ||
    (hideContentMentioningMutedUsers && isMentioningMutedUsers(event, mutePubkeySet)) ||
    (hideUntrustedNotifications && !isUserTrusted(senderPubkey))
  ) {
    return false
  }

  if (pubkey && event.kind === kinds.Reaction) {
    const targetPubkey = event.tags.findLast(tagNameEquals('p'))?.[1]
    if (targetPubkey !== pubkey) return false
  }

  return true
}
