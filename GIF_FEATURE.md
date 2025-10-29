# GIF Picker Feature

## Overview

The GIF picker feature allows users to easily search for and insert GIFs into their notes directly from the compose view. This feature integrates with the Nostr ecosystem by searching for NIP-94 file metadata events on the `relay.gifbuddy.lol` relay.

## Implementation Details

### Components

#### GifPicker (`src/components/GifPicker/index.tsx`)
- Main component providing the GIF selection interface
- Uses responsive design: Drawer on mobile, Popover on desktop
- Features:
  - Search input with 300ms debounce
  - Grid display of GIFs (2 columns on mobile, 3 on desktop)
  - Shows 6 GIFs on mobile, 12 on desktop
  - Displays recent GIFs by default
  - Inserts selected GIF URL into the note composer

### Services

#### GifService (`src/services/gif.service.ts`)
- Manages GIF fetching and caching
- Primary source: NIP-94 events (kind: 1063) from `wss://relay.gifbuddy.lol`
- Fallback: GIFBuddy API (`https://api.gifbuddy.lol`)
- API Key: `buddy_wxjVKLLfAfYhagUvi5C_9riphncgkGGGHXIkkNMZv0M`
- Features:
  - Fetches recent GIFs
  - Searches with client-side filtering (when relay search not available)
  - Caches recent GIFs for faster loading
  - Filters to only return GIF files (checks MIME type)

### Integration Points

#### PostContent Component
The GIF button is located in the composer toolbar, positioned between:
- Media upload button (ImageUp icon)
- GIF button (ImagePlay icon) ← NEW
- Emoji picker button (Smile icon)

### Data Flow

1. User clicks GIF button
2. Component opens (Drawer/Popover based on screen size)
3. Service fetches recent GIFs from relay.gifbuddy.lol
4. User can search for specific GIFs
5. Search triggers debounced query
6. Results filtered client-side by alt text and URL
7. If no results from relay, fallback to GIFBuddy API
8. User clicks GIF to insert URL into note composer
9. Picker closes automatically

### NIP-94 Event Structure

The service expects events with the following structure:
```json
{
  "kind": 1063,
  "tags": [
    ["url", "https://..."],
    ["m", "image/gif"],
    ["alt", "Description"],
    ["thumb", "https://..."],
    ["image", "https://..."],
    ["x", "sha256hash"]
  ],
  "content": "Caption"
}
```

### UI/UX Features

- **Responsive Design**: Adapts to mobile and desktop
- **Search Functionality**: Real-time search with debouncing
- **Loading States**: Spinner while fetching GIFs
- **Empty States**: Friendly messages when no GIFs found
- **Hover Effects**: Visual feedback on GIF preview hover
- **Keyboard Support**: Focus management and navigation
- **Accessibility**: Alt text for screen readers

### Translations

Added to `src/i18n/locales/en.ts`:
- "Add GIF"
- "Search GIFs..."
- "No GIFs found"
- "No recent GIFs"

## Future Enhancements

Potential improvements for future iterations:

1. **Trending GIFs**: Show trending/popular GIFs
2. **Categories**: Browse by GIF categories
3. **Favorites**: Save favorite GIFs for quick access
4. **Upload**: Allow users to upload custom GIFs
5. **Preview on Hover**: Show animated preview on hover
6. **Infinite Scroll**: Load more GIFs as user scrolls
7. **Better API Integration**: Improve GIFBuddy API implementation when spec is clearer
8. **Local Caching**: Cache GIFs in IndexedDB for offline use
9. **Multiple Languages**: Add translations for all supported languages

## Testing

To test the feature:

1. Click the "New Note" button
2. Look for the ImagePlay icon (GIF button) in the toolbar
3. Click to open the GIF picker
4. Search for GIFs or browse recent ones
5. Click a GIF to insert it into your note
6. The GIF URL should appear in the text area

## Technical Notes

- The service uses `SimplePool.querySync()` from nostr-tools for relay queries
- Client-side filtering is used as not all relays support the `search` filter
- The component follows the existing UI patterns (similar to EmojiPickerDialog)
- Error handling includes fallback to API if relay queries fail
