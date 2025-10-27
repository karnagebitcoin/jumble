import { StorageKey } from '@/constants'
import localStorageService from '@/services/local-storage.service'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface IListsVisibilityContext {
  hideListsInNavigation: boolean
  setHideListsInNavigation: (hide: boolean) => void
}

const ListsVisibilityContext = createContext<IListsVisibilityContext | undefined>(undefined)

export function ListsVisibilityProvider({ children }: { children: ReactNode }) {
  const [hideListsInNavigation, _setHideListsInNavigation] = useState<boolean>(() => {
    return localStorageService.get<boolean>(StorageKey.HIDE_LISTS_IN_NAVIGATION) ?? false
  })

  useEffect(() => {
    localStorageService.set(StorageKey.HIDE_LISTS_IN_NAVIGATION, hideListsInNavigation)
  }, [hideListsInNavigation])

  const setHideListsInNavigation = (hide: boolean) => {
    _setHideListsInNavigation(hide)
  }

  return (
    <ListsVisibilityContext.Provider
      value={{ hideListsInNavigation, setHideListsInNavigation }}
    >
      {children}
    </ListsVisibilityContext.Provider>
  )
}

export function useListsVisibility() {
  const context = useContext(ListsVisibilityContext)
  if (!context) {
    throw new Error('useListsVisibility must be used within a ListsVisibilityProvider')
  }
  return context
}
