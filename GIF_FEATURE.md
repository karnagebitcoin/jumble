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
  - **Instant Loading**: Shows cached GIFs immediately, no waiting
  - **Progressive Background Fetching**: Continuously fetches GIFs in background (up to 20,000)
  - **Batch Loading**: Fetches 2,000 GIFs per batch with 1-second delays between batches
  - **Smart Pagination**: Load more GIFs with "Load More" button
  - **Search Caching**: Caches search results for 5 minutes to improve performance
  - **Client-side Filtering**: Fast search through all cached GIFs by alt text and URL
  - **Cache Expiry**: 24-hour cache with automatic refresh
  - **Mouse Wheel Scrolling**: Full scroll support for better UX
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
   - **Cached GIFs display IMMEDIATELY** (no waiting!)
   - Background fetching starts automatically to grow cache
   - Fetches up to 20,000 GIFs in batches of 2,000
   - 1-second delay between batches to avoid overwhelming relay

2. **User clicks GIF button**:
   - Component opens (Drawer/Popover based on screen size)
   - Displays first page of recent GIFs from cache (instant loading)
   - Shows cache size indicator
   - Background fetching continues while user browses

3. **Browsing**:
   - User scrolls through GIFs with mouse wheel or scrollbar
   - Can click "Load More" to fetch next page
   - Pagination tracks offset automatically
   - Smooth scrolling experience

4. **Searching**:
   - User types search query
   - Search triggers after 300ms debounce
   - Results filtered client-side from ALL cached GIFs by alt text and URL
   - Search results cached for 5 minutes for faster re-searches
   - Searches through entire cache (potentially thousands of GIFs)

5. **Background Updates**:
   - Continuously fetches more GIFs in background (non-blocking)
   - Stops when relay returns fewer GIFs than requested
   - All fetched GIFs are saved to IndexedDB for persistence
   - Cache grows over time without user intervention

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
- ✅ **Instant Display**: Cached GIFs show immediately, no loading delay
- ✅ **Pagination**: "Load More" button to fetch additional GIFs beyond initial 24
- ✅ **Massive Cache**: Fetches up to 20,000 GIFs from relay in background
- ✅ **Smart Background Fetching**: Continuously grows cache without blocking UI
- ✅ **Batch Loading**: Fetches 2,000 GIFs at a time with delays to not overwhelm relay
- ✅ **Search Caching**: Search results cached for 5 minutes for instant re-searches
- ✅ **Cache Indicator**: Shows total cached GIFs in UI
- ✅ **Mouse Wheel Scrolling**: Full scroll support for smooth browsing
- ✅ **Better Performance**: Instant loading from cache, background fetching

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
