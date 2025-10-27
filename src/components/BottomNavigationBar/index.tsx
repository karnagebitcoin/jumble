import { cn } from '@/lib/utils'
import BackgroundAudio from '../BackgroundAudio'
import AccountButton from './AccountButton'
import ExploreButton from './ExploreButton'
import HomeButton from './HomeButton'
import NotificationsButton from './NotificationsButton'
import ReadsButton from './ReadsButton'

export default function BottomNavigationBar() {
  return (
    <div
      className={cn('fixed bottom-0 w-full z-40 bg-background/80 backdrop-blur-xl')}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <BackgroundAudio className="rounded-none border-x-0 border-t-0 border-b bg-transparent" />
      <div className="w-full flex justify-around items-center [&_svg]:size-4 [&_svg]:shrink-0">
        <HomeButton />
        <ReadsButton />
        <ExploreButton />
        <NotificationsButton />
        <AccountButton />
      </div>
    </div>
  )
}
