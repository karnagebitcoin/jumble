# Nostr Tour Feature Documentation

## Overview

The Tour feature is an interactive modal-based onboarding experience that introduces new users to Nostr through a storytelling approach called "Escape the Feed Factory". It consists of 13 scenes organized into 5 acts that progressively explain Nostr's open, decentralized nature.

## Feature Components

### TourWidget Component

**Location:** `src/components/TourWidget/TourWidget.tsx`

The main component that renders an interactive modal dialog with:
- Navigation controls (Previous/Next buttons)
- Progress indicators (dots showing current scene)
- Skip functionality
- Image placeholders (ready for future image integration)
- Scene counter
- Responsive layout

### Tour Storyline

The tour is divided into 5 acts with 13 total scenes:

#### Act 1: The Old World — "Centralized Feeds" (Scenes 1-3)
- **Scene 1 - The Feed Factory:** Introduces the dystopian nature of algorithmic feeds
- **Scene 2 - The Attention Harvesters:** Explains attention economy
- **Scene 3 - The Walled Garden:** Illustrates platform lock-in

#### Act 2: The Great Escape — "Discovering Nostr" (Scenes 4-6)
- **Scene 4 - The Breakout:** Introduction to Nostr as a protocol
- **Scene 5 - The Relays:** Explains relay infrastructure
- **Scene 6 - The Network Effect:** Shows how notes propagate

#### Act 3: The Algorithm Detox — "Freedom Restored" (Scenes 7-8)
- **Scene 7 - The Algorithm's Funeral:** No algorithmic curation
- **Scene 8 - Attention Reclaimed:** User-controlled feed

#### Act 4: Building the New Garden — "Proof of Work" (Scenes 9-10)
- **Scene 9 - Proof of Work:** User curation responsibility
- **Scene 10 - The Honest Economy:** Direct creator-consumer relationship

#### Act 5: The Launch — "You're a Nostronaut Now" (Scenes 11-13)
- **Scene 11 - Launch Sequence:** User ownership of identity
- **Scene 12 - The First Steps:** Getting started guide
- **Scene 13 - The Open Conversation:** Welcome to the network

## Integration

### Widget System Integration

The Tour is integrated as a widget in the Jumble widget system:

1. **Widget Registration** (`src/providers/WidgetsProvider.tsx`):
   ```typescript
   {
     id: 'tour',
     name: 'Nostr Tour',
     description: 'Interactive onboarding experience explaining Nostr',
     defaultEnabled: true,
     icon: <Compass className="h-5 w-5" />
   }
   ```

2. **Portal Rendering** (`src/components/Widgets/index.tsx`):
   - The Tour widget renders as a modal via React Portal
   - Appears above all other content
   - Categorized as a "portal widget" (not rendered in sidebar)

3. **Default Behavior** (`src/services/local-storage.service.ts`):
   - Enabled by default for new users
   - Automatically added to `enabledWidgets` array on first visit
   - Can be re-enabled from Widget Settings if dismissed

### User Interaction Flow

1. **First Visit:**
   - Tour modal appears automatically
   - User can navigate through scenes or skip

2. **Navigation:**
   - **Next Button:** Advances to next scene
   - **Previous Button:** Goes back to previous scene (disabled on first scene)
   - **Skip Tour:** Closes tour and disables widget
   - **Close Button (X):** Same as skip
   - **Get Started:** Appears on final scene, closes tour

3. **Re-enabling:**
   - Users can re-enable from Settings > Widgets
   - Tour widget appears in the widgets list
   - Can be toggled on/off like other widgets

## Image Placeholders

Each scene has an `imagePlaceholder` field ready for future image integration:

- **Act 1:** Conveyor belt, Robotic arms, Walled garden
- **Act 2:** Breaking wall, Satellite relays, Network connections
- **Act 3:** Gravestone, Peaceful scrolling
- **Act 4:** Digital garden, Open marketplace
- **Act 5:** Rocket launch, Dashboard, Constellation

To add images:
1. Add image files to `public/` directory (e.g., `public/tour/scene-1.png`)
2. Update the `TOUR_SCENES` array in `TourWidget.tsx`
3. Replace the placeholder div with an `<img>` tag or use the `Image` component

Example:
```typescript
{
  title: 'The Feed Factory',
  content: '...',
  image: '/tour/scene-1.png'  // Add this field
}
```

## Styling

The Tour uses Jumble's design system:
- **Dialog Components:** Shadcn UI Dialog primitives
- **Buttons:** Shadcn UI Button components
- **Colors:** CSS variables from theme system
- **Responsive:** Mobile-friendly with max-width constraints
- **Animations:** Smooth transitions for scene changes

### Custom Styling

Key classes:
- `.sm:max-w-[600px]`: Desktop max width
- `.max-h-[90vh]`: Maximum height constraint
- `.h-64`: Image placeholder height
- Progress dots use dynamic widths based on active state

## Localization

Translation keys added to `src/i18n/locales/en.ts`:
- `'Hide widget'`: For widget management
- `'Skip Tour'`: Skip button text
- `'Get Started'`: Final scene button text
- `'Next'`: (Already existed) Next button text

To add more languages:
1. Add translations to respective locale files in `src/i18n/locales/`
2. Follow the existing pattern in each file

## Storage & State Management

### LocalStorage Keys

- `ENABLED_WIDGETS`: Array of enabled widget IDs, includes 'tour' by default for new users
- Tour state is managed through the widget system (no separate storage needed)

### Widget Provider

The Tour integrates with the existing `WidgetsProvider`:
- `toggleWidget('tour')`: Enable/disable the tour
- `isWidgetEnabled('tour')`: Check if tour is enabled
- Automatically managed through the widget system

## Testing Scenarios

1. **New User Experience:**
   - Clear localStorage
   - Reload page
   - Tour should appear automatically

2. **Skipping Tour:**
   - Click "Skip Tour" or X button
   - Tour should close and widget should be disabled
   - Tour should not reappear on next visit

3. **Completing Tour:**
   - Navigate through all 13 scenes
   - Click "Get Started" on final scene
   - Tour should close and widget should be disabled

4. **Re-enabling Tour:**
   - Go to Settings > Widgets
   - Find "Nostr Tour" in the list
   - Toggle it on
   - Tour should reappear

5. **Navigation:**
   - Test Previous/Next buttons
   - Verify first scene has Previous disabled
   - Verify last scene shows "Get Started" instead of "Next"

6. **Progress Indicators:**
   - Verify dots highlight correctly for each scene
   - Check scene counter shows correct numbers

## Future Enhancements

### Planned Improvements

1. **Images:**
   - Add custom illustrations for each scene
   - Consider animated SVGs or Lottie animations
   - Optimize for dark/light theme compatibility

2. **Interactive Elements:**
   - Add "Try it now" buttons that link to relevant features
   - Include embedded demos (e.g., posting a note)
   - Interactive relay selection

3. **Personalization:**
   - Track completion progress
   - Allow resuming from last viewed scene
   - Show different content for logged-in vs. logged-out users

4. **Analytics:**
   - Track completion rates
   - Identify drop-off points
   - A/B test different content variations

5. **Accessibility:**
   - Add keyboard navigation shortcuts
   - Improve screen reader support
   - Add captions for images

6. **Content Variations:**
   - Create shorter "quick tour" version
   - Advanced tour for experienced users
   - Topic-specific tours (e.g., "Zaps 101", "Relay Management")

### Technical Improvements

1. **Performance:**
   - Lazy load images
   - Preload next scene image
   - Optimize modal animations

2. **State Persistence:**
   - Save current scene on navigation
   - Resume from last position
   - Track scenes viewed

3. **Mobile Optimization:**
   - Swipe gestures for navigation
   - Optimize for small screens
   - Adjust content density

## Code Structure

```
src/
├── components/
│   ├── TourWidget/
│   │   ├── index.tsx              # Export
│   │   └── TourWidget.tsx         # Main component
│   └── Widgets/
│       └── index.tsx              # Widget orchestrator (updated)
├── providers/
│   └── WidgetsProvider.tsx        # Widget management (updated)
├── services/
│   └── local-storage.service.ts   # Storage handling (updated)
└── i18n/
    └── locales/
        └── en.ts                  # Translations (updated)
```

## Migration Notes

For existing users upgrading to this version:
- Tour will NOT appear automatically (only for new users)
- Existing `ENABLED_WIDGETS` array won't be modified
- Users can manually enable from Widget Settings
- No breaking changes to existing functionality

## Support

For questions or issues:
- Check console for errors
- Verify widget is enabled in Settings > Widgets
- Clear localStorage to test new user experience
- Report issues on the Jumble repository
