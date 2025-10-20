import { DEFAULT_DECK_VIEW_MODE, DECK_VIEW_MODE, StorageKey } from '@/constants'
import { TDeckViewMode, TPinnedColumn } from '@/types'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface IDeckViewContext {
  deckViewMode: TDeckViewMode
  setDeckViewMode: (mode: TDeckViewMode) => void
  pinnedColumns: TPinnedColumn[]
  pinColumn: (column: Omit<TPinnedColumn, 'id'>) => void
  unpinColumn: (id: string) => void
}

const DeckViewContext = createContext<IDeckViewContext | undefined>(undefined)

export function DeckViewProvider({ children }: { children: ReactNode }) {
  const [deckViewMode, _setDeckViewMode] = useState<TDeckViewMode>(() => {
    const stored = window.localStorage.getItem(StorageKey.DECK_VIEW_MODE)
    return (stored as TDeckViewMode) || DEFAULT_DECK_VIEW_MODE
  })

  const [pinnedColumns, _setPinnedColumns] = useState<TPinnedColumn[]>(() => {
    const stored = window.localStorage.getItem(StorageKey.PINNED_COLUMNS)
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    window.localStorage.setItem(StorageKey.DECK_VIEW_MODE, deckViewMode)
  }, [deckViewMode])

  useEffect(() => {
    window.localStorage.setItem(StorageKey.PINNED_COLUMNS, JSON.stringify(pinnedColumns))
  }, [pinnedColumns])

  const setDeckViewMode = (mode: TDeckViewMode) => {
    if (mode === DECK_VIEW_MODE.STANDARD || mode === DECK_VIEW_MODE.MULTI_COLUMN) {
      _setDeckViewMode(mode)
    }
  }

  const pinColumn = (column: Omit<TPinnedColumn, 'id'>) => {
    const id = `${column.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    _setPinnedColumns((prev) => [...prev, { ...column, id }])
  }

  const unpinColumn = (id: string) => {
    _setPinnedColumns((prev) => prev.filter((col) => col.id !== id))
  }

  return (
    <DeckViewContext.Provider
      value={{ deckViewMode, setDeckViewMode, pinnedColumns, pinColumn, unpinColumn }}
    >
      {children}
    </DeckViewContext.Provider>
  )
}

export function useDeckView() {
  const context = useContext(DeckViewContext)
  if (!context) {
    throw new Error('useDeckView must be used within a DeckViewProvider')
  }
  return context
}
