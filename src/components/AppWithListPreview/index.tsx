import { useEffect, useState, useRef } from 'react'
import { PageManager } from '@/PageManager'
import ListPreviewDialog from '@/components/ListPreviewDialog'
import { useLists, TStarterPack } from '@/providers/ListsProvider'
import { useNostr } from '@/providers/NostrProvider'
import { useFollowList } from '@/providers/FollowListProvider'
import client from '@/services/client.service'
import { Event } from 'nostr-tools'
import { BIG_RELAY_URLS, ExtendedKind } from '@/constants'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

/**
 * AppWithListPreview
 *
 * This component wraps the PageManager and intercepts shared list URLs
 * to show the ListPreviewDialog BEFORE loading the full list page.
 *
 * When a user clicks a shared list link (e.g., from Twitter/social media),
 * the URL will be: /lists/{pubkey}:{d-tag}?preview=1
 *
 * This component:
 * 1. Detects the preview parameter on mount
 * 2. Fetches the list data
 * 3. Shows the dialog WITHOUT loading the ListPage
 * 4. Only navigates to the list if user closes dialog or clicks "View List"
 */
export function AppWithListPreview() {
  const { t } = useTranslation()
  const { pubkey: myPubkey } = useNostr()
  const { lists } = useLists()
  const { follow, followings } = useFollowList()
  const [listPreview, setListPreview] = useState<{
    isOpen: boolean
    listData: TStarterPack | null
    ownerPubkey: string | null
    dTag: string | null
  }>({
    isOpen: false,
    listData: null,
    ownerPubkey: null,
    dTag: null
  })
  const originalUrlRef = useRef<string | null>(null)
  const hasAutoFollowedRef = useRef(false)

  // Check URL on mount for shared list preview
  useEffect(() => {
    const checkForListPreview = async () => {
      const params = new URLSearchParams(window.location.search)
      const hasPreview = params.get('preview') === '1'

      if (!hasPreview) return

      // Parse the URL to extract list info
      // Expected format: /lists/{pubkey}:{d-tag}?preview=1
      const pathname = window.location.pathname
      const listMatch = pathname.match(/\/lists\/([^:]+):(.+)/)

      if (!listMatch) return

      const [, ownerPubkey, dTag] = listMatch

      // Check if this is the user's own list first
      const ownList = lists.find((l) => l.id === dTag)
      if (ownList && ownerPubkey === myPubkey) {
        // Don't show preview for own lists
        return
      }

      // Save the original URL
      originalUrlRef.current = window.location.href

      // Temporarily change URL to root to prevent PageManager from loading the list
      window.history.replaceState(null, '', '/')

      // Fetch the external list
      try {
        const events = await client.fetchEvents(BIG_RELAY_URLS.slice(0, 5), {
          kinds: [ExtendedKind.STARTER_PACK],
          authors: [ownerPubkey],
          '#d': [dTag],
          limit: 1
        })

        if (events.length > 0) {
          const event = events[0]
          const parsedList = parseStarterPackEvent(event)

          setListPreview({
            isOpen: true,
            listData: parsedList,
            ownerPubkey,
            dTag
          })
        }
      } catch (error) {
        console.error('Failed to fetch list for preview:', error)
        // Restore URL if fetch fails
        if (originalUrlRef.current) {
          window.history.replaceState(null, '', originalUrlRef.current)
        }
      }
    }

    checkForListPreview()
  }, [lists, myPubkey])

  // Auto-follow users after login/signup
  useEffect(() => {
    const autoFollowFromPending = async () => {
      // Only run once and only if user just logged in
      if (!myPubkey || hasAutoFollowedRef.current) return

      // Check for pending list follow in sessionStorage
      const pendingData = sessionStorage.getItem('pendingListFollow')
      if (!pendingData) return

      try {
        const { pubkeys } = JSON.parse(pendingData)

        // Filter out already followed users
        const unfollowedUsers = pubkeys.filter(
          (pubkey: string) => pubkey !== myPubkey && !followings.includes(pubkey)
        )

        if (unfollowedUsers.length === 0) {
          toast.info(t('You are already following everyone in this list'))
          sessionStorage.removeItem('pendingListFollow')
          hasAutoFollowedRef.current = true
          return
        }

        // Follow all users
        let successCount = 0
        for (const pubkey of unfollowedUsers) {
          try {
            await follow(pubkey)
            successCount++
          } catch (error) {
            console.error(`Failed to follow ${pubkey}:`, error)
          }
        }

        const word = successCount === 1 ? t('user') : t('users')
        toast.success(t('Followed {{count}} {{word}}', { count: successCount, word }))

        // Clear the pending follow
        sessionStorage.removeItem('pendingListFollow')
        hasAutoFollowedRef.current = true
      } catch (error) {
        console.error('Failed to auto-follow from pending list:', error)
        sessionStorage.removeItem('pendingListFollow')
      }
    }

    autoFollowFromPending()
  }, [myPubkey, followings, follow, t])

  const parseStarterPackEvent = (event: Event): TStarterPack => {
    const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1] || ''
    const title = event.tags.find((tag) => tag[0] === 'title')?.[1] || 'Untitled List'
    const description = event.tags.find((tag) => tag[0] === 'description')?.[1]
    const image = event.tags.find((tag) => tag[0] === 'image')?.[1]
    const pubkeys = event.tags.filter((tag) => tag[0] === 'p').map((tag) => tag[1])

    return {
      id: dTag,
      title,
      description,
      image,
      pubkeys,
      event
    }
  }

  const handleClosePreview = () => {
    // Navigate to home instead of showing the list
    window.location.href = '/'
  }

  // If preview mode is active, DON'T render PageManager at all
  // Just show the dialog
  if (listPreview.isOpen && listPreview.listData && listPreview.ownerPubkey && listPreview.dTag) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        {/* List Preview Dialog - standalone, no PageManager */}
        <ListPreviewDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              handleClosePreview()
            }
          }}
          listId={listPreview.dTag}
          ownerPubkey={listPreview.ownerPubkey}
          title={listPreview.listData.title}
          description={listPreview.listData.description}
          image={listPreview.listData.image}
          pubkeys={listPreview.listData.pubkeys}
          isStandalone={true}
        />
      </div>
    )
  }

  // Normal mode - render the full app
  return <PageManager />
}
