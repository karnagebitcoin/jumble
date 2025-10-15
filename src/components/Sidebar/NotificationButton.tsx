import { usePrimaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { useNotification } from '@/providers/NotificationProvider'
import { Bell } from 'lucide-react'
import SidebarItem from './SidebarItem'

export default function NotificationsButton() {
  const { checkLogin } = useNostr()
  const { navigate, current } = usePrimaryPage()
  const { hasNewNotification } = useNotification()

  return (
    <SidebarItem
      title="Notifications"
      onClick={() => checkLogin(() => navigate('notifications'))}
      active={current === 'notifications'}
    >
      <div className="relative">
        <Bell strokeWidth={1.3} />
        {hasNewNotification && (
          <div className="absolute -top-1 right-0 w-2 h-2 ring-2 ring-background bg-primary rounded-full" />
        )}
      </div>
    </SidebarItem>
  )
}
