import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useNostr } from '@/providers/NostrProvider'
import { Loader, Upload, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { generateSecretKey } from 'nostr-tools'
import { nsecEncode, npubEncode } from 'nostr-tools/nip19'
import { getPublicKey } from 'nostr-tools'
import { createProfileDraftEvent } from '@/lib/draft-event'
import Uploader from '@/components/PostEditor/Uploader'
import { generateImageByPubkey } from '@/lib/pubkey'

export default function SignupProfile({
  back,
  onProfileComplete
}: {
  back: () => void
  onProfileComplete: (keys: { nsec: string; npub: string }) => void
}) {
  const { t } = useTranslation()
  const { nsecLogin, publish, updateProfileEvent } = useNostr()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [about, setAbout] = useState('')
  const [avatar, setAvatar] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [generatedKeys, setGeneratedKeys] = useState<{ sk: Uint8Array; nsec: string; npub: string } | null>(null)

  // Generate keys on mount
  useEffect(() => {
    const sk = generateSecretKey()
    const nsec = nsecEncode(sk)
    const pubkey = getPublicKey(sk)
    const npub = npubEncode(pubkey)
    setGeneratedKeys({ sk, nsec, npub })
    // Set default avatar
    setAvatar(generateImageByPubkey(pubkey))
  }, [])

  if (!generatedKeys) return null

  const handleContinue = async () => {
    setSaving(true)
    try {
      // Login with the generated nsec
      await nsecLogin(generatedKeys.nsec, '', true)

      // Create and publish profile if user entered any data
      if (displayName || username || about || avatar) {
        const profileContent = {
          display_name: displayName,
          displayName: displayName,
          name: username || displayName,
          about,
          picture: avatar
        }

        const profileDraftEvent = createProfileDraftEvent(JSON.stringify(profileContent))
        const newProfileEvent = await publish(profileDraftEvent)
        await updateProfileEvent(newProfileEvent)
      }

      // Move to keys display
      onProfileComplete({ nsec: generatedKeys.nsec, npub: generatedKeys.npub })
    } catch (error) {
      console.error('Failed to create profile:', error)
      setSaving(false)
    }
  }

  const onAvatarUploadSuccess = ({ url }: { url: string }) => {
    setAvatar(url)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <Button
        variant="ghost"
        onClick={back}
        className="w-fit text-muted-foreground -ml-2"
      >
        ← {t('Back')}
      </Button>

      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold mb-2">Your basic profile</h2>
        <p className="text-sm text-muted-foreground">
          Set up your profile (you can always change this later)
        </p>
      </div>

      <div className="flex flex-col items-center mb-4">
        <Uploader
          onUploadSuccess={onAvatarUploadSuccess}
          onUploadStart={() => setUploadingAvatar(true)}
          onUploadEnd={() => setUploadingAvatar(false)}
          className="w-24 h-24 relative cursor-pointer rounded-full border-4 border-muted hover:border-primary transition-colors"
        >
          <Avatar className="w-full h-full">
            <AvatarImage src={avatar} className="object-cover object-center" />
            <AvatarFallback>
              <User className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute top-0 bg-muted/80 w-full h-full rounded-full flex flex-col justify-center items-center">
            {uploadingAvatar ? <Loader className="animate-spin" /> : <Upload />}
          </div>
        </Uploader>
        <p className="text-xs text-muted-foreground mt-2">Click to upload avatar</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="signup-displayname-input">{t('Display Name')}</Label>
          <Input
            id="signup-displayname-input"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Nostr is nym-friendly, you don't need to use your real name.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="signup-username-input">{t('Username')}</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">@</span>
            <Input
              id="signup-username-input"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Usernames are not unique in nostr. Two people can have the same username.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="signup-about-textarea">{t('Short Bio')}</Label>
          <Textarea
            id="signup-about-textarea"
            placeholder="Tell us about yourself..."
            className="h-20 resize-none"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={saving}
        className="w-full mt-4"
        size="lg"
      >
        {saving ? (
          <>
            <Loader className="animate-spin mr-2 h-4 w-4" />
            {t('Creating your account...')}
          </>
        ) : (
          t('Save')
        )}
      </Button>
    </div>
  )
}
