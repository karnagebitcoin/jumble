# Profile Gallery Feature

## Overview
The profile gallery feature allows users to add a collection of images to their Nostr profile, stored in Kind 0 metadata events.

## How It Works

### Data Structure
Gallery images are stored in the Kind 0 profile event's `content` JSON field as an array:

```json
{
  "name": "Alice",
  "picture": "https://example.com/avatar.jpg",
  "gallery": [
    {
      "url": "https://example.com/photo1.jpg",
      "description": "Optional description",
      "link": "https://example.com/optional-link"
    }
  ]
}
```

### Components

1. **ProfileGallery** (`src/components/ProfileGallery/`)
   - Displays gallery in profile view (4×2 grid, max 8 images)
   - Shows image count badge
   - Opens lightbox on click with description overlay and link button

2. **ProfileGalleryManager** (`src/components/ProfileGalleryManager/`)
   - Upload interface for profile editor
   - Bulk upload support
   - Edit dialog for descriptions and links
   - Delete functionality

### Implementation Flow

1. **Reading**: Profile metadata is parsed in `getProfileFromEvent()` in `src/lib/event-metadata.ts`
2. **Displaying**: `ProfileGallery` component renders the gallery grid
3. **Editing**: `ProfileGalleryManager` in profile editor allows modifications
4. **Saving**: Gallery array is included in Kind 0 event content when saving profile

## For Developers

To implement gallery support in your Nostr client:

1. **Read gallery data**: Parse the `gallery` field from Kind 0 event content
2. **Display images**: Loop through array and render thumbnails
3. **Edit gallery**: Modify the array and re-publish the Kind 0 event
4. **Schema**: Each item has `url` (required), `description` and `link` (optional)

### Example Code

```typescript
// Reading
const profile = JSON.parse(kind0Event.content)
const gallery = profile.gallery || []

// Displaying
gallery.forEach(img => {
  console.log(img.url, img.description, img.link)
})

// Saving
const updatedProfile = {
  ...existingProfile,
  gallery: [
    { url: "https://example.com/img.jpg", description: "My photo" }
  ]
}
await publishKind0Event(JSON.stringify(updatedProfile))
```

## Notes

- Gallery is a custom field, not part of official NIPs
- Compatible with any Nostr client that respects custom Kind 0 fields
- Images stored at user-specified URLs (not embedded)
- No limit on gallery size, but UI shows first 8 images
