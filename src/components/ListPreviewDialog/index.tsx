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
import { Progress } from '@/components/ui/progress'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useNostr } from '@/providers/NostrProvider'
import { useFollowList } from '@/providers/FollowListProvider'
import { UserPlus } from 'lucide-react'
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
  isStandalone?: boolean // When true, this is shown from a shared link (no view list button)
}

export default function ListPreviewDialog({
  open,
  onOpenChange,
  listId,
  ownerPubkey,
  title,
  description,
  image,
  pubkeys,
  isStandalone = false
}: ListPreviewDialogProps) {
  const { t } = useTranslation()
  const { isSmallScreen } = useScreenSize()
  const { pubkey: myPubkey } = useNostr()
  const { followings, follow } = useFollowList()
  const [isFollowingAll, setIsFollowingAll] = useState(false)
  const [followProgress, setFollowProgress] = useState(0)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [pendingFollow, setPendingFollow] = useState(false)

  // Calculate unfollowed users
  const unfollowedUsers = useMemo(() => {
    if (!myPubkey) return pubkeys
    return pubkeys.filter((pubkey) => pubkey !== myPubkey && !followings.includes(pubkey))
  }, [pubkeys, followings, myPubkey])

  // Store list info in sessionStorage for auto-follow after login/signup
  useEffect(() => {
    if (isStandalone && !myPubkey) {
      // Store the list data so we can auto-follow after authentication
      sessionStorage.setItem('pendingListFollow', JSON.stringify({
        listId,
        ownerPubkey,
        title,
        pubkeys
      }))
    }
  }, [isStandalone, myPubkey, listId, ownerPubkey, title, pubkeys])

  const handleSignInAndFollow = () => {
    // Mark that we want to follow after login
    setPendingFollow(true)
    setLoginDialogOpen(true)
  }

  const handleCreateProfileAndFollow = () => {
    // Mark that we want to follow after signup
    setPendingFollow(true)
    setLoginDialogOpen(true)
  }

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
    setFollowProgress(0)

    try {
      let successCount = 0
      const total = unfollowedUsers.length

      for (let i = 0; i < unfollowedUsers.length; i++) {
        const pubkey = unfollowedUsers[i]
        try {
          await follow(pubkey)
          successCount++
          setFollowProgress(successCount)
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
      setFollowProgress(0)
    }
  }

  // Auto-follow all users after login
  useEffect(() => {
    if (pendingFollow && myPubkey && unfollowedUsers.length > 0) {
      setPendingFollow(false)
      handleFollowAll()
    }
  }, [pendingFollow, myPubkey, unfollowedUsers.length])

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
          <UserAvatar pubkey={ownerPubkey} size="small" noLink />
          <Username userId={ownerPubkey} className="text-sm font-medium" noLink />
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
        {!myPubkey ? (
          <>
            <Button onClick={handleSignInAndFollow} className="w-full" size="lg">
              <UserPlus className="w-5 h-5 mr-2" />
              {t('Sign in and follow all')}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {t("Don't have a profile?")}{' '}
              <button
                onClick={handleCreateProfileAndFollow}
                className="text-primary hover:underline font-medium"
              >
                {t('Create one')}
              </button>
            </div>
          </>
        ) : (
          <>
            {isFollowingAll ? (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {t('Following {{current}}/{{total}}', {
                      current: followProgress,
                      total: unfollowedUsers.length
                    })}
                  </div>
                </div>
                <Progress
                  value={(followProgress / unfollowedUsers.length) * 100}
                  className="h-2"
                />
              </div>
            ) : (
              <Button
                onClick={handleFollowAll}
                disabled={unfollowedUsers.length === 0}
                className="w-full"
                size="lg"
              >
                {unfollowedUsers.length === 0 ? (
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
            )}
          </>
        )}
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
