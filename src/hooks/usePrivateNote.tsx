import privateNotesService, { PrivateNote } from '@/services/private-notes.service'
import { useEffect, useState } from 'react'

export function usePrivateNote(pubkey: string) {
  const [note, setNote] = useState<PrivateNote | null>(null)

  useEffect(() => {
    const savedNote = privateNotesService.getNote(pubkey)
    setNote(savedNote)
  }, [pubkey])

  const updateNote = (newNote: PrivateNote | null) => {
    if (newNote) {
      privateNotesService.setNote(pubkey, newNote)
    } else {
      privateNotesService.deleteNote(pubkey)
    }
    setNote(newNote)
  }

  return { note, updateNote }
}
