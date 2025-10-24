import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useWidgets } from '@/providers/WidgetsProvider'

type TourScene = {
  title: string
  content: string
  imagePlaceholder: string
}

const TOUR_SCENES: TourScene[] = [
  // Act 1: The Old World — "Centralized Feeds"
  {
    title: 'The Feed Factory',
    content: 'Welcome to the Feed Factory.\nAlgorithms decide what you feel today.\nYou follow 100 people but only see 12. Congratulations, you\'re the product.',
    imagePlaceholder: 'Conveyor belt image placeholder'
  },
  {
    title: 'The Attention Harvesters',
    content: 'Your curiosity is their currency.\nEvery click funds the next outrage headline.\nWelcome to the dopamine mines.',
    imagePlaceholder: 'Robotic arms image placeholder'
  },
  {
    title: 'The Walled Garden',
    content: 'Every wall keeps you in.\nEvery scroll feeds the system.\nThe longer you stay, the more they win.',
    imagePlaceholder: 'Walled garden image placeholder'
  },
  // Act 2: The Great Escape — "Discovering Nostr"
  {
    title: 'The Breakout',
    content: 'You\'ve escaped the feed loop.\nWelcome to Nostr — not a platform, but a protocol.\nNo masters. No walls. Just open communication.',
    imagePlaceholder: 'Breaking wall image placeholder'
  },
  {
    title: 'The Relays',
    content: 'Relays are independent servers run by people.\nYou can read from any of them — or all of them.\nYour feed, your network, your choice.',
    imagePlaceholder: 'Satellite relays image placeholder'
  },
  {
    title: 'The Network Effect',
    content: 'Post once, and your followers rebroadcast your note through their relays.\nNo algorithms — just real people spreading real content.',
    imagePlaceholder: 'Network connections image placeholder'
  },
  // Act 3: The Algorithm Detox — "Freedom Restored"
  {
    title: 'The Algorithm\'s Funeral',
    content: 'No algorithm decides what you see.\nNo outrage loops. No manipulation.\nJust signal — no noise.',
    imagePlaceholder: 'Gravestone image placeholder'
  },
  {
    title: 'Attention Reclaimed',
    content: 'Your attention is yours again.\nNo ads. No infinite scroll.\nJust people you actually follow.',
    imagePlaceholder: 'Peaceful scrolling image placeholder'
  },
  // Act 4: Building the New Garden — "Proof of Work"
  {
    title: 'Proof of Work',
    content: 'You decide who to follow and what to read.\nCuration is proof of work.\nQuality grows when attention is earned.',
    imagePlaceholder: 'Digital garden image placeholder'
  },
  {
    title: 'The Honest Economy',
    content: 'No ads. No dark patterns.\nCreators earn trust, not clicks.\nThe best work rises — naturally.',
    imagePlaceholder: 'Open marketplace image placeholder'
  },
  // Act 5: The Launch — "You're a Nostronaut Now"
  {
    title: 'Launch Sequence',
    content: 'You control your identity.\nYour notes travel across relays — not platforms.\nYou\'re free to explore the open web of people.',
    imagePlaceholder: 'Rocket launch image placeholder'
  },
  {
    title: 'The First Steps',
    content: 'Welcome, Nostronaut.\nBrowse a few relays — each opens a unique window into the network.\nFollow some people who catch your eye and watch your feed come alive.\nPost your first note and see it ripple across the open web.',
    imagePlaceholder: 'Dashboard image placeholder'
  },
  {
    title: 'The Open Conversation',
    content: 'You\'ve joined a living network.\nNo algorithms. No walls. No ads.\nJust connection — on your terms.',
    imagePlaceholder: 'Constellation image placeholder'
  }
]

export default function TourWidget() {
  const { t } = useTranslation()
  const { toggleWidget } = useWidgets()
  const [currentScene, setCurrentScene] = useState(0)
  const [isOpen, setIsOpen] = useState(true)

  const handleNext = () => {
    if (currentScene < TOUR_SCENES.length - 1) {
      setCurrentScene(currentScene + 1)
    }
  }

  const handlePrevious = () => {
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Disable the widget when user closes the tour
    toggleWidget('tour')
  }

  const handleSkip = () => {
    handleClose()
  }

  const handleFinish = () => {
    handleClose()
  }

  const scene = TOUR_SCENES[currentScene]
  const isFirstScene = currentScene === 0
  const isLastScene = currentScene === TOUR_SCENES.length - 1

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col" withoutClose>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">{scene.title}</DialogTitle>
          <button
            onClick={handleClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        {/* Image Placeholder Area */}
        <div className="flex items-center justify-center bg-muted rounded-lg h-64 mb-4">
          <p className="text-sm text-muted-foreground italic">{scene.imagePlaceholder}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mb-4">
          <p className="text-base leading-relaxed whitespace-pre-line">{scene.content}</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {TOUR_SCENES.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentScene
                  ? 'w-8 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('Skip Tour')}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={isFirstScene}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {isLastScene ? (
              <Button onClick={handleFinish} className="min-w-[120px]">
                {t('Get Started')}
              </Button>
            ) : (
              <Button onClick={handleNext} className="min-w-[120px]">
                {t('Next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Scene Counter */}
        <div className="text-center text-sm text-muted-foreground mt-2">
          {currentScene + 1} / {TOUR_SCENES.length}
        </div>
      </DialogContent>
    </Dialog>
  )
}
