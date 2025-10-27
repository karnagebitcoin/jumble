import { Button } from '@/components/ui/button'
import NoteList from '@/components/NoteList'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useLists } from '@/providers/ListsProvider'
import { useSecondaryPage } from '@/PageManager'
import { toEditList } from '@/lib/link'
import { Edit, Pin, Users } from 'lucide-react'
import { forwardRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeckView } from '@/providers/DeckViewProvider'
import { DECK_VIEW_MODE } from '@/constants'
import { useLayoutMode } from '@/providers/LayoutModeProvider'
import { toast } from 'sonner'

type ListPageProps = {
  index?: number
  listId: string
}

const ListPage = forwardRef<HTMLDivElement, ListPageProps>(({ index, listId }, ref) => {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const { lists, isLoading } = useLists()
  const { deckViewMode, pinColumn, pinnedColumns } = useDeckView()
  const { layoutMode } = useLayoutMode()

  const list = lists.find((l) => l.id === listId)

  const isMultiColumn = layoutMode === 'full-width' && deckViewMode === DECK_VIEW_MODE.MULTI_COLUMN
  const isPinned = useMemo(
    () => pinnedColumns.some((col) => col.type === 'list' && col.props?.listId === listId),
    [pinnedColumns, listId]
  )

  const handleEdit = () => {
    push(toEditList(listId))
  }

  const handlePin = () => {
    if (isPinned) {
      toast.info(t('This list is already pinned'))
      return
    }

    pinColumn({
      type: 'list',
      props: { listId, title: list?.title || 'List' }
    })
    toast.success(t('List pinned to deck view'))
  }

  if (isLoading) {
    return (
      <SecondaryPageLayout ref={ref} index={index} title={t('Loading...')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t('Loading list...')}</div>
        </div>
      </SecondaryPageLayout>
    )
  }

  if (!list) {
    return (
      <SecondaryPageLayout ref={ref} index={index} title={t('List Not Found')}>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Users className="w-16 h-16 text-muted-foreground opacity-50" />
          <div className="text-muted-foreground">{t('List not found')}</div>
        </div>
      </SecondaryPageLayout>
    )
  }

  return (
    <SecondaryPageLayout
      ref={ref}
      index={index}
      title={list.title}
      controls={
        <div className="flex gap-2">
          {isMultiColumn && !isPinned && (
            <Button variant="ghost" size="titlebar-icon" onClick={handlePin} title={t('Pin to deck')}>
              <Pin className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="titlebar-icon" onClick={handleEdit} title={t('Edit')}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      <div className="px-4 py-2">
        <div className="text-sm text-muted-foreground mb-4">
          {list.pubkeys.length} {list.pubkeys.length === 1 ? t('member') : t('members')}
        </div>
        {list.description && (
          <div className="text-sm text-muted-foreground mb-4 pb-4 border-b">
            {list.description}
          </div>
        )}
      </div>

      {list.pubkeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Users className="w-16 h-16 text-muted-foreground opacity-50" />
          <div className="text-muted-foreground">{t('No members in this list')}</div>
          <Button onClick={handleEdit} variant="outline">
            {t('Add Members')}
          </Button>
        </div>
      ) : (
        <NoteList
          filter={{
            authors: list.pubkeys,
            kinds: [1, 6]
          }}
        />
      )}
    </SecondaryPageLayout>
  )
})
ListPage.displayName = 'ListPage'
export default ListPage
