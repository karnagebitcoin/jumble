import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import ArticleList, { TArticleListRef } from '@/components/ArticleList'
import { RefreshButton } from '@/components/RefreshButton'
import PinButton from '@/components/PinButton'
import { Button } from '@/components/ui/button'
import { useNostr } from '@/providers/NostrProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { TPageRef } from '@/types'
import { isTouchDevice } from '@/lib/utils'
import { useMemo } from 'react'
import client from '@/services/client.service'
import { BIG_RELAY_URLS } from '@/constants'
import { TFeedSubRequest } from '@/types'
import { useState } from 'react'
import { useFetchFollowings } from '@/hooks'

const ReadsPage = forwardRef((_, ref) => {
  const { t } = useTranslation()
  const layoutRef = useRef<TPageRef>(null)
  const articleListRef = useRef<TArticleListRef>(null)
  const { pubkey, checkLogin } = useNostr()
  const { followings } = useFetchFollowings(pubkey)
  const [subRequests, setSubRequests] = useState<TFeedSubRequest[]>([])
  const supportTouch = useMemo(() => isTouchDevice(), [])

  useImperativeHandle(ref, () => layoutRef.current)

  useEffect(() => {
    if (!pubkey || !followings.length) {
      setSubRequests([])
      return
    }

    const init = async () => {
      const relayList = await client.fetchRelayList(pubkey)
      setSubRequests([
        {
          urls: relayList.read.concat(BIG_RELAY_URLS).slice(0, 8),
          filter: {
            authors: followings
          }
        }
      ])
    }

    init()
  }, [pubkey, followings])

  let content: React.ReactNode = null

  if (!pubkey) {
    content = (
      <div className="flex justify-center w-full pt-8">
        <Button size="lg" onClick={() => checkLogin()}>
          {t('Please login to view reads from people you follow')}
        </Button>
      </div>
    )
  } else if (!followings.length) {
    content = (
      <div className="text-center text-sm text-muted-foreground pt-8">
        {t('Follow some people to see their long-form articles here')}
      </div>
    )
  } else {
    content = <ArticleList ref={articleListRef} subRequests={subRequests} />
  }

  return (
    <PrimaryPageLayout
      pageName="reads"
      ref={layoutRef}
      titlebar={<ReadsPageTitlebar articleListRef={articleListRef} supportTouch={supportTouch} />}
      displayScrollToTopButton
    >
      {content}
    </PrimaryPageLayout>
  )
})

ReadsPage.displayName = 'ReadsPage'
export default ReadsPage

function ReadsPageTitlebar({
  articleListRef,
  supportTouch
}: {
  articleListRef: React.RefObject<TArticleListRef>
  supportTouch: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-1 items-center h-full justify-between">
      <div className="font-semibold text-lg flex-1 pl-4">{t('Reads')}</div>
      <div className="shrink-0 flex gap-1 items-center">
        <PinButton column={{ type: 'reads' }} />
        {!supportTouch && <RefreshButton onClick={() => articleListRef.current?.refresh()} />}
      </div>
    </div>
  )
}
