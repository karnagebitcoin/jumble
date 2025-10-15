import { usePrimaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { UserRound } from 'lucide-react'
import SidebarItem from './SidebarItem'

export default function ProfileButton() {
  const { navigate, current } = usePrimaryPage()
  const { checkLogin } = useNostr()

  return (
    <SidebarItem
      title="Profile"
      onClick={() => checkLogin(() => navigate('profile'))}
      active={current === 'profile'}
    >
      <UserRound strokeWidth={1.3} />
    </SidebarItem>
  )
}
