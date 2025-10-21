import Profile from '@/components/Profile'
import PinButton from '@/components/PinButton'
import { useFetchProfile } from '@/hooks'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { forwardRef } from 'react'

const ProfilePage = forwardRef(({ id, index }: { id?: string; index?: number }, ref) => {
  const { profile } = useFetchProfile(id)

  return (
    <SecondaryPageLayout
      index={index}
      title={profile?.username}
      displayScrollToTopButton
      ref={ref}
      controls={
        id ? <PinButton column={{ type: 'profile', props: { pubkey: id } }} /> : undefined
      }
    >
      <Profile id={id} />
    </SecondaryPageLayout>
  )
})
ProfilePage.displayName = 'ProfilePage'
export default ProfilePage
