# List Zap Feature

This document describes the implementation of zapping functionality for lists (starter packs) in Jumble.

## Overview

Users can now zap the authors of lists, see the total zap amounts on list cards, and sort lists by the number of zaps they've received. The implementation mirrors the existing note zap functionality while adapting it for addressable events (NIP-51 lists / NIP-33 addressable events).

## Features

### 1. Zap Button on List Cards
- Each list card displays a zap button next to the favorite/star button
- Shows the total amount of sats zapped to the list
- Quick zap (if configured) or long-press for custom amount
- Prevents zapping your own lists

### 2. Zap Button in List Detail View
- Prominent zap button in the header when viewing a list's details
- Same quick zap and long-press functionality as cards
- Shows total zapped amount

### 3. Sort by Zaps
- Dropdown menu to sort lists by:
  - **Recent**: Sort by creation time (default)
  - **Zaps**: Sort by total zap amount (highest first)
- Applies to all list sections: Favorites, My Lists, and Discover

### 4. Zap Tracking
- Zaps are fetched from Nostr relays (not stored locally)
- Real-time updates when new zaps are received
- Persists across sessions via the list-stats service

## Technical Implementation

### New Files Created

#### 1. `src/services/list-stats.service.ts`
A service for tracking and managing list statistics, specifically zaps:

**Key Methods:**
- `fetchListStats(authorPubkey, dTag, pubkey?)` - Fetches zap events from relays
- `subscribeListStats(authorPubkey, dTag, callback)` - Subscribe to stats updates
- `getListStats(authorPubkey, dTag)` - Get current stats for a list
- `addZap(...)` - Add a zap to the stats
- `getTotalZapAmount(authorPubkey, dTag)` - Get total sats zapped
- `hasUserZapped(authorPubkey, dTag, userPubkey)` - Check if user has zapped

**How it Works:**
- Uses NIP-57 zap events (kind 9735)
- Filters zaps by the `#a` tag containing the list coordinate: `38383:pubkey:d-tag`
- Fetches from author's read relays + big relays
- Stores stats in memory with subscription pattern for reactivity

#### 2. `src/hooks/useListStatsById.tsx`
React hook for accessing list stats reactively:

```typescript
const listStats = useListStatsById(authorPubkey, dTag)
// Returns: { zaps: [...], zapPrSet: Set<string> }
```

#### 3. `src/components/ListZapButton/index.tsx`
Zap button component for lists:

**Props:**
- `authorPubkey` - The list author's pubkey
- `dTag` - The list's d-tag identifier
- `className` - Optional CSS classes
- `showAmount` - Whether to display zap total (default: true)
- `variant` - 'default' or 'compact' styling

**Features:**
- Quick zap on click (if enabled in settings)
- Long-press (500ms) opens zap dialog for custom amount
- Disabled if author has no lightning address
- Shows yellow color when user has zapped
- Displays formatted zap amount (21, 1k, 2.1M, etc.)
- Plays zap sound on successful zap

### Modified Files

#### 1. `src/services/lightning.service.ts`
Enhanced to support zapping addressable events:

**Changes:**
- Accept coordinate strings (format: `kind:pubkey:d-tag`)
- Parse coordinates to extract recipient pubkey
- Add `a` tag to zap requests for addressable events
- Filter zap receipts by `#a` tag when checking payment

**Example Usage:**
```typescript
// Zap a list
const coordinate = `38383:${authorPubkey}:${dTag}`
await lightning.zap(senderPubkey, coordinate, 21, 'Great list!')
```

#### 2. `src/pages/primary/ListsPage/index.tsx`
Integrated zap functionality into the lists UI:

**Changes:**
- Import `ListZapButton` and `listStatsService`
- Fetch list stats when lists are loaded
- Add zap button to each list card
- Add zap button to list detail view header
- Implement sorting by zaps vs recent
- Add dropdown menu for sort selection
- Apply sorting to all list sections

## User Experience

### Zapping a List

1. **Quick Zap** (if enabled):
   - Click the zap button
   - Default amount is sent immediately
   - Zap sound plays
   - Amount updates on the card

2. **Custom Amount**:
   - Long-press the zap button (500ms)
   - Zap dialog opens
   - Select preset amount or enter custom
   - Add optional comment
   - Confirm zap
   - Zap sound plays

### Visual Feedback

- **Un-zapped**: Gray zap icon
- **Zapped**: Yellow filled zap icon
- **Amount Display**: "21", "1k", "2.1M" format
- **Disabled**: Grayed out if author has no lightning address

### Sorting Lists

1. Click the sort dropdown (button with arrow icon)
2. Select "Recent" or "Zaps"
3. All list sections re-sort automatically
4. Selection persists during session

## NIP-57 Integration

The implementation follows NIP-57 (Lightning Zaps) specifications:

### Zap Request
```json
{
  "kind": 9734,
  "content": "comment",
  "tags": [
    ["p", "author_pubkey"],
    ["a", "38383:author_pubkey:list-d-tag"],
    ["relays", "wss://relay1.com", "wss://relay2.com"],
    ["amount", "21000"],
    ["lnurl", "lnurl..."]
  ]
}
```

### Zap Receipt Validation
- Verifies `pubkey` matches author's lnurl provider
- Checks `bolt11` invoice amount
- Validates receipt is signed by lnurl provider
- Extracts zap info from `description` tag

## Future Enhancements

Potential improvements to consider:

1. **Zap Leaderboard**: Show top zappers on list detail view
2. **Zap Comments**: Display zap comments with amounts
3. **Split Zaps**: Zap multiple list members proportionally
4. **Zap Goals**: Set fundraising goals for lists
5. **Zap Analytics**: Charts showing zap activity over time
6. **Trending Lists**: Global view of most-zapped lists

## Testing

To test the feature:

1. **Setup**:
   - Connect a lightning wallet (Alby, etc.)
   - Configure default zap amount in settings
   - Enable/disable quick zap as desired

2. **Create a Test List**:
   - Go to Lists page
   - Create a new list with members
   - Add title and description

3. **Zap Someone's List**:
   - Browse public lists
   - Click zap button on any list card
   - Verify amount displays after payment

4. **Sort by Zaps**:
   - Click sort dropdown
   - Select "Zaps"
   - Verify lists reorder by zap amount

5. **View in Detail**:
   - Click on a list
   - Verify zap button in header
   - Verify zap amount displays

## Notes

- Zaps are sent to the **list author**, not to list members
- Lists must have a valid lightning address to be zappable
- Zap receipts are published to author's read relays + big relays
- Stats are cached in memory for performance
- Sorting is done client-side on demand
- No local storage is used for zap data (all from Nostr events)
