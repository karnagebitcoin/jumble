import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import privateNotesService, { PrivateNote } from '@/services/private-notes.service'
import { StickyNote } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface PrivateNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pubkey: string
  noteEventId?: string
  onSave?: (note: PrivateNote) => void
}

export default function PrivateNoteDialog({
  open,
  onOpenChange,
  pubkey,
  noteEventId,
  onSave
}: PrivateNoteDialogProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')

  useEffect(() => {
    if (open) {
      const existingNote = privateNotesService.getNote(pubkey)
      setText(existingNote?.text ?? '')
    }
  }, [open, pubkey])

  const handleSave = () => {
    const existingNote = privateNotesService.getNote(pubkey)
    const note: PrivateNote = {
      text: text.trim(),
      // Preserve existing noteEventId if not providing a new one
      noteEventId: noteEventId || existingNote?.noteEventId
    }

    if (note.text || note.noteEventId) {
      privateNotesService.setNote(pubkey, note)
      onSave?.(note)
    } else {
      privateNotesService.deleteNote(pubkey)
    }

    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="size-5 text-yellow-600" />
            {t('Private Note')}
          </DialogTitle>
          <DialogDescription>
            {noteEventId
              ? t('Add a private note about this user and pin their note to their profile.')
              : t('Add a private note about this user. Only you can see this.')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('Write your private note here...')}
            className="min-h-[150px] resize-none"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleSave}>
            {noteEventId ? t('Pin to profile') : t('Save note')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
