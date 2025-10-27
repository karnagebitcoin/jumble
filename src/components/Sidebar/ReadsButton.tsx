import { BookOpen } from 'lucide-react'
import { usePrimaryPage } from '@/PageManager'
import SidebarItem from './SidebarItem'

export default function ReadsButton() {
  const { navigate, current } = usePrimaryPage()

  return (
    <SidebarItem title="Reads" onClick={() => navigate('reads')} active={current === 'reads'}>
      <BookOpen strokeWidth={1.3} />
    </SidebarItem>
  )
}
