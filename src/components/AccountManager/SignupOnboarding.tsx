import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import SignupProfile from './SignupProfile'

type OnboardingStep = 'intro1' | 'intro2' | 'profile' | 'complete'

export default function SignupOnboarding({
  back,
  onComplete
}: {
  back: () => void
  onComplete: () => void
}) {
  const { t } = useTranslation()
  const [step, setStep] = useState<OnboardingStep>('intro1')
  const [generatedKeys, setGeneratedKeys] = useState<{ nsec: string; npub: string } | null>(null)

  if (step === 'intro1') {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300">
        <Button
          variant="ghost"
          onClick={back}
          className="w-fit text-muted-foreground -ml-2"
        >
          ← {t('Back')}
        </Button>
        
        <div className="flex flex-col gap-6 items-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-2">Protocols over apps</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              JumbleKat is part of the nostr protocol which can be accessed via many apps - JumbleKat is just one way to get started
            </p>
          </div>

          <Button
            onClick={() => setStep('intro2')}
            className="w-full max-w-xs mt-4"
            size="lg"
          >
            {t('Next')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'intro2') {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300">
        <Button
          variant="ghost"
          onClick={() => setStep('intro1')}
          className="w-fit text-muted-foreground -ml-2"
        >
          ← {t('Back')}
        </Button>
        
        <div className="flex flex-col gap-6 items-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-2">An identity you truly own</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              No accounts, no emails, no kingmakers. Just keys. "Sign" messages with your keys to prove it's you.
            </p>
          </div>

          <Button
            onClick={() => setStep('profile')}
            className="w-full max-w-xs mt-4"
            size="lg"
          >
            {t("Let's go!")}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'profile') {
    return (
      <SignupProfile
        back={() => setStep('intro2')}
        onProfileComplete={(keys) => {
          setGeneratedKeys(keys)
          setStep('complete')
        }}
      />
    )
  }

  // Complete step - show keys
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-6 items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-2">Your Keys</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            These are your Nostr keys. Save them somewhere safe - you'll need them to access your account.
          </p>
        </div>

        {generatedKeys && (
          <div className="w-full space-y-4 mt-4">
            <KeyDisplay
              label="Public Identity (npub)"
              value={generatedKeys.npub}
              description="Share this publicly - it's your Nostr address"
              isSecret={false}
            />
            
            <KeyDisplay
              label="Private Key (nsec)"
              value={generatedKeys.nsec}
              description="NEVER share this - it's your secret key"
              isSecret={true}
            />
          </div>
        )}

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-left max-w-md">
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
            ⚠️ Important: Download and save your private key (nsec) now. If you lose it, you'll lose access to your account forever.
          </p>
        </div>

        <Button
          onClick={onComplete}
          className="w-full max-w-xs mt-4"
          size="lg"
        >
          {t('Done')}
        </Button>
      </div>
    </div>
  )
}

function KeyDisplay({
  label,
  value,
  description,
  isSecret
}: {
  label: string
  value: string
  description: string
  isSecret: boolean
}) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayValue = isSecret && !revealed ? '•'.repeat(63) : value

  return (
    <div className="bg-muted/30 border rounded-lg p-4 text-left">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">{label}</label>
        {isSecret && (
          <button
            onClick={() => setRevealed(!revealed)}
            className="text-xs text-primary hover:underline"
          >
            {revealed ? 'Hide' : 'Reveal'}
          </button>
        )}
      </div>
      
      <div className="flex gap-2 items-center mb-2">
        <code className="flex-1 bg-background border rounded px-3 py-2 text-xs break-all">
          {displayValue}
        </code>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
