import { usePrimaryPage } from '@/PageManager'
import { List } from 'lucide-react'
import SidebarItem from './SidebarItem'

export default function ListsButton() {
  const { navigate, current } = usePrimaryPage()

  return (
    <SidebarItem title="Lists" onClick={() => navigate('lists')} active={current === 'lists'}>
      <List strokeWidth={1.3} />
    </SidebarItem>
  )
}
