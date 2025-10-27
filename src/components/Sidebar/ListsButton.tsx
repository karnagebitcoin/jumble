import { useSecondaryPage } from '@/PageManager'
import { toListsIndex } from '@/lib/link'
import { List } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SidebarItem from './SidebarItem'

export default function ListsButton() {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()

  const handleClick = () => {
    push(toListsIndex())
  }

  return (
    <SidebarItem onClick={handleClick} icon={List} label={t('Lists')} />
  )
}
