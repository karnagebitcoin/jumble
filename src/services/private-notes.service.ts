import { StorageKey } from '@/constants'

export interface PrivateNote {
  text: string
  noteEventId?: string // optional: reference to a pinned note event
}

class PrivateNotesService {
  static instance: PrivateNotesService
  private notes: Record<string, PrivateNote> = {}

  constructor() {
    if (!PrivateNotesService.instance) {
      this.init()
      PrivateNotesService.instance = this
    }
    return PrivateNotesService.instance
  }

  init() {
    const notesStr = window.localStorage.getItem(StorageKey.PRIVATE_NOTES)
    this.notes = notesStr ? JSON.parse(notesStr) : {}
  }

  getNote(pubkey: string): PrivateNote | null {
    return this.notes[pubkey] ?? null
  }

  setNote(pubkey: string, note: PrivateNote) {
    this.notes[pubkey] = note
    this.save()
  }

  deleteNote(pubkey: string) {
    delete this.notes[pubkey]
    this.save()
  }

  private save() {
    window.localStorage.setItem(StorageKey.PRIVATE_NOTES, JSON.stringify(this.notes))
  }
}

const instance = new PrivateNotesService()
export default instance
