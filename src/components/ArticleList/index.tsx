import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TFeedSubRequest } from '@/types'
import { Event } from 'nostr-tools'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import client from '@/services/client.service'
import ArticleCard from '../ArticleCard'
import { isTouchDevice } from '@/lib/utils'
import PullToRefresh from 'react-simple-pull-to-refresh'

const LIMIT = 50
const SHOW_COUNT = 10

export type TArticleListRef = {
  refresh: () => void
  scrollToTop: (behavior?: ScrollBehavior) => void
}

const ArticleList = forwardRef(
  (
    {
      subRequests
    }: {
      subRequests: TFeedSubRequest[]
    },
    ref
  ) => {
    const { t } = useTranslation()
    const [articles, setArticles] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [showCount, setShowCount] = useState(SHOW_COUNT)
    const supportTouch = useMemo(() => isTouchDevice(), [])
    const bottomRef = useRef<HTMLDivElement | null>(null)
    const topRef = useRef<HTMLDivElement | null>(null)
    const subRequestsRef = useRef<TFeedSubRequest[]>([])

    useImperativeHandle(ref, () => ({
      refresh: () => {
        loadArticles(true)
      },
      scrollToTop: (behavior: ScrollBehavior = 'smooth') => {
        topRef.current?.scrollIntoView({ behavior })
      }
    }))

    const loadArticles = useCallback(
      async (reset = false) => {
        if (!reset && !hasMore) return

        setLoading(true)

        try {
          const requests = subRequestsRef.current.map((req) => ({
            ...req,
            filter: {
              ...req.filter,
              kinds: [30023], // Long-form content
              limit: LIMIT
            }
          }))

          const events = await client.fetchEvents(requests)

          // Sort by published_at if available, otherwise by created_at
          const sortedEvents = events.sort((a, b) => {
            const aPublishedAt = parseInt(a.tags.find((tag) => tag[0] === 'published_at')?.[1] || '0') || a.created_at
            const bPublishedAt = parseInt(b.tags.find((tag) => tag[0] === 'published_at')?.[1] || '0') || b.created_at
            return bPublishedAt - aPublishedAt
          })

          // Remove duplicates by d-tag identifier
          const uniqueArticles = new Map<string, Event>()
          sortedEvents.forEach((event) => {
            const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
            const key = `${event.pubkey}:${dTag || event.id}`

            // Keep the most recent version
            const existing = uniqueArticles.get(key)
            if (!existing || event.created_at > existing.created_at) {
              uniqueArticles.set(key, event)
            }
          })

          const uniqueArticlesList = Array.from(uniqueArticles.values())
          setArticles(uniqueArticlesList)
          setHasMore(uniqueArticlesList.length >= LIMIT)
        } catch (error) {
          console.error('Failed to load articles:', error)
        } finally {
          setLoading(false)
        }
      },
      [hasMore]
    )

    useEffect(() => {
      subRequestsRef.current = subRequests
      if (subRequests.length > 0) {
        loadArticles(true)
      } else {
        setArticles([])
        setLoading(false)
      }
    }, [subRequests, loadArticles])

    useEffect(() => {
      if (!bottomRef.current) return

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loading && hasMore) {
            setShowCount((prev) => prev + SHOW_COUNT)
          }
        },
        {
          rootMargin: '400px'
        }
      )

      observer.observe(bottomRef.current)

      return () => {
        observer.disconnect()
      }
    }, [loading, hasMore])

    const displayedArticles = useMemo(() => {
      return articles.slice(0, showCount)
    }, [articles, showCount])

    const handleRefresh = async () => {
      await loadArticles(true)
    }

    const content = (
      <div className="pb-4">
        <div ref={topRef} />
        {loading && articles.length === 0 ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-32 h-24 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedArticles.length > 0 ? (
          <div className="space-y-3 p-4">
            {displayedArticles.map((article) => (
              <ArticleCard key={article.id} event={article} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            {t('No articles found')}
          </div>
        )}
        <div ref={bottomRef} className="h-1" />
        {!loading && hasMore && displayedArticles.length > 0 && (
          <div className="text-center py-4">
            <Button
              variant="outline"
              onClick={() => setShowCount((prev) => prev + SHOW_COUNT)}
            >
              {t('Load More')}
            </Button>
          </div>
        )}
      </div>
    )

    if (supportTouch) {
      return (
        <PullToRefresh onRefresh={handleRefresh} resistance={3}>
          {content}
        </PullToRefresh>
      )
    }

    return content
  }
)

ArticleList.displayName = 'ArticleList'

export default ArticleList
