import { usePrimaryPage } from '@/PageManager'
import { Search } from 'lucide-react'
import SidebarItem from './SidebarItem'

export default function SearchButton() {
  const { navigate, current, display } = usePrimaryPage()

  return (
    <SidebarItem
      title="Search"
      onClick={() => navigate('search')}
      active={current === 'search' && display}
    >
      <Search strokeWidth={1.3} />
    </SidebarItem>
  )
}
