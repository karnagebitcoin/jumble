import { useSecondaryPage } from '@/PageManager'
import Username from '@/components/Username'
import UserAvatar from '@/components/UserAvatar'
import { FormattedTimestamp } from '@/components/FormattedTimestamp'
import NoteInteractions from '@/components/NoteInteractions'
import NoteStats from '@/components/NoteStats'
import ReplyNoteList from '@/components/ReplyNoteList'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetchEvent } from '@/hooks'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { forwardRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { remarkNostrLinks, nostrSanitizeSchema } from '@/lib/markdown'

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
    <SecondaryPageLayout ref={ref} index={index} title={t('Article')} displayScrollToTopButton>
      <article className="px-4 pt-3 pb-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 select-text">{articleData.title}</h1>

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
            remarkPlugins={[remarkGfm, remarkNostrLinks]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, nostrSanitizeSchema]]}
            components={{
              a: ({ node, ...props }) => {
                const isExternal = props.href?.startsWith('http')
                const isNostr = props.href?.startsWith('nostr:') || props.href?.startsWith('#/')
                return (
                  <a
                    {...props}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="text-primary hover:underline break-words"
                  />
                )
              },
              img: ({ node, ...props }) => (
                <img
                  {...props}
                  className="rounded-lg max-w-full h-auto my-4"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ),
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '')
                return inline ? (
                  <code {...props} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <div className="my-4">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                )
              },
              pre: ({ node, ...props }) => (
                <div {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  {...props}
                  className="border-l-4 border-primary/50 pl-4 italic my-4 text-muted-foreground"
                />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4">
                  <table {...props} className="min-w-full divide-y divide-border" />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th {...props} className="px-4 py-2 text-left font-semibold bg-muted" />
              ),
              td: ({ node, ...props }) => (
                <td {...props} className="px-4 py-2 border-t border-border" />
              ),
              h1: ({ node, ...props }) => (
                <h1 {...props} className="text-2xl font-bold mt-8 mb-4" />
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="text-xl font-bold mt-6 mb-3" />
              ),
              h3: ({ node, ...props }) => (
                <h3 {...props} className="text-lg font-bold mt-5 mb-2" />
              ),
              h4: ({ node, ...props }) => (
                <h4 {...props} className="text-base font-bold mt-4 mb-2" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc list-outside ml-6 my-4 space-y-2" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="list-decimal list-outside ml-6 my-4 space-y-2" />
              ),
              li: ({ node, ...props }) => (
                <li {...props} />
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="my-4 leading-relaxed" />
              ),
              hr: ({ node, ...props }) => (
                <hr {...props} className="my-8 border-border" />
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

        <div className="mt-8 pt-8 border-t">
          <h2 className="text-xl font-bold mb-4">{t('Comments')}</h2>
          <ReplyNoteList index={index} event={event} />
        </div>
      </article>
    </SecondaryPageLayout>
  )
})

ArticlePage.displayName = 'ArticlePage'

export default ArticlePage
