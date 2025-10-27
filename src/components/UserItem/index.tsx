import FollowButton from '@/components/FollowButton'
import Nip05 from '@/components/Nip05'
import UserAvatar from '@/components/UserAvatar'
import Username from '@/components/Username'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function UserItem({
  pubkey,
  hideFollowButton,
  className,
  compactFollowButton
}: {
  pubkey: string
  hideFollowButton?: boolean
  className?: string
  compactFollowButton?: boolean
}) {
  return (
    <div className={cn('flex gap-2 items-center h-14', className)}>
      <UserAvatar userId={pubkey} className="shrink-0" />
      <div className="w-full overflow-hidden">
        <Username
          userId={pubkey}
          className="font-semibold truncate max-w-full w-fit"
          skeletonClassName="h-4"
        />
        <Nip05 pubkey={pubkey} />
      </div>
      {!hideFollowButton && <FollowButton pubkey={pubkey} size={compactFollowButton ? 'sm' : 'default'} />}
    </div>
  )
}

export function UserItemSkeleton({ hideFollowButton }: { hideFollowButton?: boolean }) {
  return (
    <div className="flex gap-2 items-center h-14">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="w-full">
        <div className="py-1">
          <Skeleton className="w-16 h-4" />
        </div>
      </div>
      {!hideFollowButton && <Skeleton className="rounded-full min-w-28 h-9" />}
    </div>
  )
}
