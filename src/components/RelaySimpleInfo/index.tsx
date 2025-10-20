import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TRelayInfo } from '@/types'
import { HTMLProps } from 'react'
import { useTranslation } from 'react-i18next'
import RelayIcon from '../RelayIcon'
import SaveRelayDropdownMenu from '../SaveRelayDropdownMenu'
import { SimpleUserAvatar } from '../UserAvatar'
import PinButton from '../PinButton'

export default function RelaySimpleInfo({
  relayInfo,
  users,
  className,
  compact = false,
  showPinButton = false,
  ...props
}: HTMLProps<HTMLDivElement> & {
  relayInfo?: TRelayInfo
  users?: string[]
  compact?: boolean
  showPinButton?: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className={cn(compact ? 'space-y-0' : 'space-y-1', className)} {...props}>
      <div className="flex items-start justify-between gap-2 w-full">
        <div className="flex flex-1 w-0 items-center gap-2">
          <RelayIcon url={relayInfo?.url} className={compact ? 'h-7 w-7' : 'h-9 w-9'} />
          <div className="flex-1 w-0">
            <div className={cn('truncate font-semibold', compact && 'text-sm')}>
              {relayInfo?.name || relayInfo?.shortUrl}
            </div>
            {relayInfo?.name && (
              <div className="text-xs text-muted-foreground truncate">{relayInfo?.shortUrl}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {relayInfo && showPinButton && (
            <PinButton
              column={{ type: 'relay', props: { url: relayInfo.url } }}
              size="titlebar-icon"
            />
          )}
          {relayInfo && <SaveRelayDropdownMenu urls={[relayInfo.url]} />}
        </div>
      </div>
      {!compact && !!relayInfo?.description && (
        <div className="line-clamp-3">{relayInfo.description}</div>
      )}
      {!compact && !!users?.length && (
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">{t('Favorited by')} </div>
          <div className="flex items-center gap-1">
            {users.slice(0, 10).map((user) => (
              <SimpleUserAvatar key={user} userId={user} size="xSmall" />
            ))}
            {users.length > 10 && (
              <div className="text-muted-foreground text-xs rounded-full bg-muted w-5 h-5 flex items-center justify-center">
                +{users.length - 10}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function RelaySimpleInfoSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-2 w-full">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 w-0 space-y-1">
          <Skeleton className="w-40 h-5" />
          <Skeleton className="w-20 h-4" />
        </div>
      </div>
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-2/3 h-4" />
    </div>
  )
}
