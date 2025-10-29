import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toWallet } from '@/lib/link'
import { formatPubkey, generateImageByPubkey } from '@/lib/pubkey'
import { usePrimaryPage, useSecondaryPage } from '@/PageManager'
import { useCompactSidebar } from '@/providers/CompactSidebarProvider'
import { useNostr } from '@/providers/NostrProvider'
import { ArrowDownUp, LogIn, LogOut, UserRound, Wallet } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LoginDialog from '../LoginDialog'
import LogoutDialog from '../LogoutDialog'
import SidebarItem from './SidebarItem'

export default function AccountButton() {
  const { pubkey } = useNostr()

  if (pubkey) {
    return <ProfileButton />
  } else {
    return <LoginButton />
  }
}

const ProfileButtonContent = React.forwardRef<HTMLButtonElement, { username: string, avatar: string, defaultAvatar: string }>(
  ({ username, avatar, defaultAvatar, ...props }, ref) => {
    const { compactSidebar } = useCompactSidebar()

    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          "clickable shadow-none p-2 w-12 h-12 flex items-center bg-transparent text-foreground hover:text-accent-foreground rounded-lg justify-start gap-4 font-medium transition-all duration-300",
          compactSidebar ? "[&_img]:opacity-50 hover:[&_img]:opacity-100" : "xl:px-2 xl:py-2 xl:w-full xl:h-auto xl:opacity-80 xl:hover:opacity-100 xl:[&_img]:opacity-50 xl:hover:[&_img]:opacity-100"
        )}
        style={{ fontSize: 'var(--font-size, 14px)' }}
        {...props}
      >
        <div className="flex gap-2 items-center flex-1 w-0">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatar} />
            <AvatarFallback>
              <img src={defaultAvatar} />
            </AvatarFallback>
          </Avatar>
          <div className={cn("truncate font-medium", compactSidebar ? "hidden" : "max-xl:hidden")}>{username}</div>
        </div>
      </Button>
    )
  }
)

function ProfileButton() {
  const { t } = useTranslation()
  const { account, profile } = useNostr()
  const pubkey = account?.pubkey
  const { navigate } = usePrimaryPage()
  const { push } = useSecondaryPage()
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  if (!pubkey) return null

  const defaultAvatar = generateImageByPubkey(pubkey)
  const { username, avatar } = profile || { username: formatPubkey(pubkey), avatar: defaultAvatar }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ProfileButtonContent username={username} avatar={avatar} defaultAvatar={defaultAvatar} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuItem onClick={() => navigate('profile')}>
          <UserRound />
          {t('Profile')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => push(toWallet())}>
          <Wallet />
          {t('Wallet')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLoginDialogOpen(true)}>
          <ArrowDownUp />
          {t('Switch account')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => setLogoutDialogOpen(true)}
        >
          <LogOut />
          {t('Logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
      <LoginDialog open={loginDialogOpen} setOpen={setLoginDialogOpen} />
      <LogoutDialog open={logoutDialogOpen} setOpen={setLogoutDialogOpen} />
    </DropdownMenu>
  )
}

function LoginButton() {
  const { checkLogin } = useNostr()

  return (
    <SidebarItem onClick={() => checkLogin()} title="Login">
      <LogIn strokeWidth={1.3} />
    </SidebarItem>
  )
}
