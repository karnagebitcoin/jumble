import WidgetContainer from '@/components/WidgetContainer'
import NoteCard from '@/components/NoteCard'
import { useWidgets } from '@/providers/WidgetsProvider'
import { useFetchEvent } from '@/hooks/useFetchEvent'
import { Loader2, Pin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface PinnedNoteWidgetProps {
  widgetId: string
  eventId: string
}

export default function PinnedNoteWidget({ widgetId, eventId }: PinnedNoteWidgetProps) {
  const { t } = useTranslation()
  const { unpinNoteWidget } = useWidgets()
  const { event, isFetching } = useFetchEvent(eventId)

  const handleUnpin = () => {
    unpinNoteWidget(widgetId)
  }

  return (
    <WidgetContainer>
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Pin className="h-4 w-4" />
          {t('Pinned Note')}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleUnpin}
          title={t('Unpin from sidebar')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        {isFetching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isFetching && !event && (
          <div className="text-center text-sm text-muted-foreground py-8">
            {t('Note not found')}
          </div>
        )}
        {event && <NoteCard event={event} hideSeparator />}
      </div>
    </WidgetContainer>
  )
}
