# GIF Upload Feature

## Overview

The GIF picker now includes a tabbed interface with "All Gifs" and "My Gifs" tabs, allowing users to browse all available GIFs from the Nostr network or view and manage their own uploaded GIFs.

## Features

### Tabbed Interface

1. **All Gifs Tab** (Default)
   - Shows all GIFs from relay.gifbuddy.lol and other relays
   - Displays recently added GIFs by default
   - Search functionality to find specific GIFs
   - Load more button for pagination
   - Cache information displayed

2. **My Gifs Tab**
   - Shows only GIFs uploaded by the logged-in user
   - Requires user to be logged in with Nostr
   - Upload button always visible when in this tab
   - Search functionality filters only user's GIFs
   - Empty state with upload prompt when no GIFs exist

### GIF Upload

Users can upload their own GIFs to share with the Nostr community:

1. **Upload Dialog**
   - Triggered by clicking "Upload GIF" button in My Gifs tab
   - File selection with drag-and-drop support
   - File validation (must be GIF, max 10MB)
   - Preview of selected GIF
   - Required description field for searchability
   - Progress indicator during upload
   - Success/error feedback

2. **Media Upload**
   - Uses user's configured media upload service from preferences
   - Supports both Blossom and NIP-96 upload methods
   - Respects user's media host settings
   - Automatic WebP conversion for PNG/JPEG (preserves GIF format)

3. **NIP-94 Event Creation**
   - Creates kind 1063 events (File Metadata)
   - Includes required tags:
     - `url`: The uploaded GIF URL from media host
     - `m`: MIME type (image/gif)
     - `x`: SHA-256 hash of the file
     - `size`: File size in bytes
     - `alt`: User-provided description
   - Additional tags from upload service (if any)
   - Content field contains the description

4. **Publishing**
   - Events are published to:
     - `wss://relay.gifbuddy.lol` (primary GIF relay)
     - All configured big relays (relay.damus.io, nos.lol, etc.)
   - Ensures GIFs are discoverable across the network

5. **Local Caching**
   - Uploaded GIFs are immediately added to local cache
   - Available in "My Gifs" tab without page reload
   - Persisted in IndexedDB for future sessions
   - Also appears in "All Gifs" when cache refreshes

### Search Functionality

- **Cross-Tab Search**: Works across both tabs
- **Instant Results**: Debounced search with 300ms delay
- **Smart Filtering**:
  - In "All Gifs": Searches all cached GIFs
  - In "My Gifs": Searches only user's GIFs
- **Search Fields**: Matches against GIF description and URL

## Technical Implementation

### Components

1. **GifPicker (Updated)**
   - Added tab state management
   - Conditional rendering based on active tab
   - Integration with GifUploadDialog
   - Upload button placement logic

2. **GifUploadDialog (New)**
   - File selection and validation
   - Preview functionality
   - Upload progress tracking
   - Event creation and publishing
   - Error handling with user feedback

### Services

**gif.service.ts (Updated)**
- Added `pubkey` field to `GifData` interface
- New `fetchMyGifs()` method to filter by user
- Updated `searchGifs()` to support pubkey filtering
- New `addUserGif()` method for immediate cache updates

### Data Flow

1. User selects GIF file
2. File is validated (type, size)
3. File is uploaded to user's configured media host (Blossom or NIP-96)
4. SHA-256 hash is calculated from file contents
5. Kind 1063 event is created with tags (url, mime type, hash, size, description)
6. Event is signed using NostrProvider's signEvent method
7. Event is published to gifbuddy.lol relay + big relays
8. GIF is added to local cache immediately
9. UI updates to show new GIF in "My Gifs"

## User Experience

### For Non-Logged-In Users
- Can view and search "All Gifs"
- "My Gifs" tab shows login prompt
- Cannot upload GIFs

### For Logged-In Users
- Full access to both tabs
- Can upload GIFs with descriptions
- Can search across all GIFs or just their own
- Immediate feedback on upload success/failure

## Future Enhancements

Potential improvements:
- Edit/delete uploaded GIFs
- GIF collections/categories
- Preview before uploading
- Batch upload support
- Advanced search filters (tags, date range)
- GIF statistics (views, usage)
- Thumbnail generation for large GIFs
