import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useNostr } from '@/providers/NostrProvider'
import { useFollowList } from '@/providers/FollowListProvider'
import { UserPlus, Loader } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import UserAvatar from '../UserAvatar'
import Username from '../Username'
import LoginDialog from '../LoginDialog'

interface ListPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listId: string
  ownerPubkey: string
  title: string
  description?: string
  image?: string
  pubkeys: string[]
}

export default function ListPreviewDialog({
  open,
  onOpenChange,
  listId,
  ownerPubkey,
  title,
  description,
  image,
  pubkeys
}: ListPreviewDialogProps) {
  const { t } = useTranslation()
  const { isSmallScreen } = useScreenSize()
  const { pubkey: myPubkey } = useNostr()
  const { followings, follow } = useFollowList()
  const [isFollowingAll, setIsFollowingAll] = useState(false)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [pendingFollow, setPendingFollow] = useState(false)

  // Calculate unfollowed users
  const unfollowedUsers = useMemo(() => {
    if (!myPubkey) return pubkeys
    return pubkeys.filter((pubkey) => pubkey !== myPubkey && !followings.includes(pubkey))
  }, [pubkeys, followings, myPubkey])

  const handleFollowAll = async () => {
    if (!myPubkey) {
      // User not logged in, open login dialog
      setPendingFollow(true)
      setLoginDialogOpen(true)
      return
    }

    if (unfollowedUsers.length === 0) {
      toast.info(t('You are already following everyone in this list'))
      return
    }

    setIsFollowingAll(true)
    try {
      let successCount = 0
      for (const pubkey of unfollowedUsers) {
        try {
          await follow(pubkey)
          successCount++
        } catch (error) {
          console.error(`Failed to follow ${pubkey}:`, error)
        }
      }
      const word = successCount === 1 ? t('user') : t('users')
      toast.success(t('Followed {{count}} {{word}}', { count: successCount, word }))
    } catch (error) {
      console.error('Failed to follow all:', error)
      toast.error(t('Failed to follow all users'))
    } finally {
      setIsFollowingAll(false)
    }
  }

  // Auto-follow all users after login
  useEffect(() => {
    if (pendingFollow && myPubkey && unfollowedUsers.length > 0) {
      setPendingFollow(false)
      handleFollowAll()
    }
  }, [pendingFollow, myPubkey, unfollowedUsers.length])

  const handleViewList = () => {
    onOpenChange(false)
    // The URL will already have changed to the list page, so just close the dialog
  }

  const content = (
    <div className="flex flex-col gap-4">
      {/* List Preview */}
      {image && (
        <div className="w-full h-48 rounded-lg overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-xl">{title}</h3>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('By')}</span>
          <UserAvatar pubkey={ownerPubkey} size="small" />
          <Username pubkey={ownerPubkey} className="text-sm font-medium" />
        </div>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        <div className="text-sm text-muted-foreground">
          {pubkeys.length} {pubkeys.length === 1 ? t('member') : t('members')}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={handleFollowAll}
          disabled={isFollowingAll || (myPubkey && unfollowedUsers.length === 0)}
          className="w-full"
          size="lg"
        >
          {isFollowingAll ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              {t('Following...')}
            </>
          ) : !myPubkey ? (
            <>
              <UserPlus className="w-5 h-5 mr-2" />
              {t('Create Account to Follow')}
            </>
          ) : unfollowedUsers.length === 0 ? (
            <>
              <UserPlus className="w-5 h-5 mr-2" />
              {t('Already Following All')}
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5 mr-2" />
              {t('Follow All ({{count}})', { count: unfollowedUsers.length })}
            </>
          )}
        </Button>

        <Button onClick={handleViewList} variant="outline" className="w-full">
          {t('View List')}
        </Button>
      </div>
    </div>
  )

  if (isSmallScreen) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="px-4 pb-4">
            <DrawerHeader>
              <DrawerTitle>{t('Join List')}</DrawerTitle>
            </DrawerHeader>
            {content}
          </DrawerContent>
        </Drawer>
        <LoginDialog open={loginDialogOpen} setOpen={setLoginDialogOpen} />
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('Join List')}</DialogTitle>
            <DialogDescription>
              {t('Follow all members from this curated list')}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
      <LoginDialog open={loginDialogOpen} setOpen={setLoginDialogOpen} />
    </>
  )
}
