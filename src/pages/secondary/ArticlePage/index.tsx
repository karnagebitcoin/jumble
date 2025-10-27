import { useSecondaryPage } from '@/PageManager'
import Username from '@/components/Username'
import UserAvatar from '@/components/UserAvatar'
import { FormattedTimestamp } from '@/components/FormattedTimestamp'
import NoteInteractions from '@/components/NoteInteractions'
import NoteStats from '@/components/NoteStats'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetchEvent } from '@/hooks'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { forwardRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const ArticlePage = forwardRef(({ id, index }: { id?: string; index?: number }, ref) => {
  const { t } = useTranslation()
  const { event, isFetching } = useFetchEvent(id)

  const articleData = useMemo(() => {
    if (!event) return null

    const titleTag = event.tags.find((tag) => tag[0] === 'title')
    const summaryTag = event.tags.find((tag) => tag[0] === 'summary')
    const imageTag = event.tags.find((tag) => tag[0] === 'image')
    const publishedAtTag = event.tags.find((tag) => tag[0] === 'published_at')

    return {
      title: titleTag?.[1] || 'Untitled',
      summary: summaryTag?.[1],
      image: imageTag?.[1],
      publishedAt: publishedAtTag?.[1] ? parseInt(publishedAtTag[1]) : event.created_at,
      content: event.content
    }
  }, [event])

  if (!event && isFetching) {
    return (
      <SecondaryPageLayout ref={ref} index={index} title={t('Article')}>
        <div className="px-4 pt-3 max-w-3xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="w-full h-64 mb-6" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-2/3 h-4 mb-2" />
        </div>
      </SecondaryPageLayout>
    )
  }

  if (!event || !articleData) {
    return (
      <SecondaryPageLayout ref={ref} index={index} title={t('Article')} displayScrollToTopButton>
        <div className="text-center text-muted-foreground py-12">
          {t('Article not found')}
        </div>
      </SecondaryPageLayout>
    )
  }

  return (
    <SecondaryPageLayout ref={ref} index={index} title={articleData.title} displayScrollToTopButton>
      <article className="px-4 pt-3 pb-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 select-text">{articleData.title}</h1>

        <div className="flex items-center gap-3 mb-6">
          <UserAvatar userId={event.pubkey} className="w-10 h-10" />
          <div className="flex-1">
            <Username userId={event.pubkey} className="font-semibold" />
            <div className="text-sm text-muted-foreground">
              <FormattedTimestamp timestamp={articleData.publishedAt} />
            </div>
          </div>
        </div>

        {articleData.summary && (
          <p className="text-lg text-muted-foreground mb-6 italic select-text">
            {articleData.summary}
          </p>
        )}

        {articleData.image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={articleData.image}
              alt={articleData.title}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none select-text">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
              ),
              img: ({ node, ...props }) => (
                <img {...props} className="rounded-lg max-w-full h-auto" loading="lazy" />
              ),
              code: ({ node, inline, ...props }: any) => (
                inline ? (
                  <code {...props} className="bg-muted px-1.5 py-0.5 rounded text-sm" />
                ) : (
                  <code {...props} className="block bg-muted p-4 rounded-lg overflow-x-auto" />
                )
              )
            }}
          >
            {articleData.content}
          </ReactMarkdown>
        </div>

        <div className="mt-8 pt-8 border-t">
          <NoteStats event={event} fetchIfNotExisting displayTopZapsAndLikes />
          <NoteInteractions className="mt-4" event={event} />
        </div>
      </article>
    </SecondaryPageLayout>
  )
})

ArticlePage.displayName = 'ArticlePage'

export default ArticlePage
