# Private Notes Feature

## Overview
The private notes feature allows users to attach personal, local-only notes to any Nostr user profile. These notes are stored in the browser's localStorage and are never published to relays - they remain completely private to the user.

## Features

### 1. **Add Private Notes to Profiles**
- Navigate to any user's profile (not your own)
- Click the options menu (three dots) next to the Follow button
- Select "Add private note"
- Enter your note text in the dialog
- Click "Save note"

### 2. **Pin Notes from Feed**
- When viewing someone else's note in your feed
- Click the note options menu (three dots on the note)
- Select "Pin to profile"
- Add optional note text about the user
- The note will be pinned to their profile with a reference to the event

### 3. **Sticky Note Display**
- Private notes appear at the top of user profiles
- Styled as a manila yellow sticky note with handwriting font (Kalam)
- Shows up to 2 lines of text (truncated with "..." if longer)
- If a note event is pinned, it displays below the text in a compact view
- The pinned note is fully interactive (you can click through to the full note)

### 4. **Inline Editing**
- Click on the text area of the sticky note to edit it
- Type or modify your note text
- Click outside the note to auto-save
- Changes are instantly saved to localStorage
- Editing text preserves the pinned note event
- The pinned note section is not editable (only the text above it)

### 5. **Delete Notes**
- Click the X button on the sticky note to delete it
- Deleted notes are removed from localStorage

## Technical Details

### Storage
- Notes are stored in localStorage under the key `privateNotes`
- Data structure: `{ [pubkey: string]: { text: string, noteEventId?: string } }`
- Completely local - never synced or published

### Components
- **PrivateNote**: Displays the sticky note on profiles
- **PrivateNoteDialog**: Dialog for adding/editing notes
- **usePrivateNote**: React hook for managing note state

### Services
- **private-notes.service.ts**: Manages localStorage operations for notes

### Styling
- Yellow gradient background (#FEF3C7 to #FDE68A)
- Handwriting font (Kalam from Google Fonts)
- Subtle shadow and hover effects
- Responsive and touch-friendly

## Use Cases

1. **Remember Context**: "Met at Bitcoin conference 2024"
2. **Trust Markers**: "Friend of Alice, verified developer"
3. **Reminders**: "Ask about their nostr relay project"
4. **Reference Notes**: Pin a specific insightful note they wrote + add context
5. **Personal Tags**: "Photography enthusiast, speaks French"
6. **Evidence**: Pin a problematic note for reference + add why it matters
7. **Highlights**: Pin their best work + your thoughts on it

## Privacy

✅ **100% Private**: Notes never leave your browser
✅ **No Relay Publishing**: Nothing is sent to Nostr relays
✅ **Local Only**: Stored in browser localStorage
✅ **Not Synced**: Won't appear on other devices or browsers
