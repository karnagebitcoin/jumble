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
  - Shows 12 GIFs on mobile, 24 on desktop per page
  - "Load More" button to fetch additional GIFs
  - Displays recent GIFs by default (sorted by creation date)
  - Shows cache size and current GIF count
  - Inserts selected GIF URL into the note composer

### Services

#### GifService (`src/services/gif.service.ts`)
- Manages GIF fetching, caching, and search functionality
- Primary source: NIP-94 events (kind: 1063) from `wss://relay.gifbuddy.lol`
- Features:
  - **Persistent Caching**: Stores GIFs in IndexedDB for fast offline access
  - **Progressive Loading**: Fetches up to 1000 GIFs initially, then loads more on demand
  - **Smart Pagination**: Load more GIFs with "Load More" button
  - **Search Caching**: Caches search results for 5 minutes to improve performance
  - **Background Refresh**: Automatically fetches more GIFs when cache is low
  - **Client-side Filtering**: Fast search through cached GIFs by alt text and URL
  - **Cache Expiry**: 24-hour cache with automatic refresh
  - **Filters**: Only returns GIF files (checks MIME type)

### Integration Points

#### PostContent Component
The GIF button is located in the composer toolbar, positioned between:
- Media upload button (ImageUp icon)
- GIF button (ImagePlay icon) ← NEW
- Emoji picker button (Smile icon)

### Data Flow

1. **First Load**:
   - Service initializes by loading GIF cache from IndexedDB
   - If cache is empty or has less than 100 GIFs, fetches initial batch from relay
   - If cache exists and is fresh (< 24 hours), uses cached data immediately

2. **User clicks GIF button**:
   - Component opens (Drawer/Popover based on screen size)
   - Displays first page of recent GIFs from cache (instant loading)
   - Shows cache size indicator

3. **Browsing**:
   - User scrolls through GIFs
   - Can click "Load More" to fetch next page
   - Pagination tracks offset automatically

4. **Searching**:
   - User types search query
   - Search triggers after 300ms debounce
   - Results filtered client-side from cached GIFs by alt text and URL
   - Search results cached for 5 minutes for faster re-searches
   - If few matches found, service fetches more GIFs in background

5. **Background Updates**:
   - When cache is running low (< 500 GIFs), automatically fetches more
   - When user is near end of cached GIFs, fetches additional batch
   - All fetched GIFs are saved to IndexedDB for persistence

6. **Selection**:
   - User clicks GIF to insert URL into note composer
   - Picker closes automatically

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
- "Load More"
- "Loading..."
- "Showing {{count}} GIFs"
- "More available"
- "Cache: {{count}}"

## Recent Improvements (v2.0)

- ✅ **Persistent Caching**: GIFs now cached in IndexedDB, surviving page refreshes
- ✅ **Pagination**: "Load More" button to fetch additional GIFs beyond initial 24
- ✅ **Progressive Loading**: Fetches up to 1000+ GIFs from relay instead of just 24
- ✅ **Smart Background Fetching**: Automatically loads more when cache is low
- ✅ **Search Caching**: Search results cached for 5 minutes for instant re-searches
- ✅ **Cache Indicator**: Shows total cached GIFs in UI
- ✅ **Better Performance**: Instant loading from cache, no waiting for relay

## Future Enhancements

Potential improvements for future iterations:

1. **Trending GIFs**: Show trending/popular GIFs based on usage
2. **Categories**: Browse by GIF categories/tags
3. **Favorites**: Save favorite GIFs for quick access
4. **Upload**: Allow users to upload custom GIFs as NIP-94 events
5. **Preview on Hover**: Show animated preview on hover
6. **Infinite Scroll**: Auto-load more GIFs as user scrolls (instead of button)
7. **Relay Selection**: Allow users to choose which GIF relay to use
8. **Multiple Languages**: Add translations for all supported languages
9. **GIF Details**: Show file size, dimensions, and other metadata

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
