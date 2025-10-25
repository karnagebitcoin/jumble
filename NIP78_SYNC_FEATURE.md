# NIP-78 Preferences Sync Feature

## Overview

Jumble now supports **NIP-78 (Arbitrary custom app data)** to sync user preferences across devices using Nostr relays. This allows users to maintain consistent settings whether they access Jumble from their laptop, phone, or any other device.

## What is NIP-78?

[NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md) is a Nostr protocol specification that enables applications to store arbitrary custom data on relays. It uses **kind 30078** (addressable event) with a `d` tag to identify the application.

## Security & Privacy

### ✅ What Gets Synced

The following preferences are **safe to sync** and are stored on relays:

#### Appearance Settings
- Theme (light/dark/system)
- Font size and family
- Primary color
- Button radius
- Page theme
- Compact sidebar toggle

#### Layout & View Settings
- Note list mode (posts/posts & replies/pictures)
- Notification list style (compact/detailed)
- Distraction-free mode

#### Content Policy
- Autoplay settings
- Hide untrusted content options
- NSFW content display
- Media auto-load policy
- Supported kinds filter
- Muted user content handling

#### Relay Configuration
- Relay sets (custom relay groups)

#### Zap Settings
- Default zap amount
- Default zap comment
- Quick zap toggle
- Zap sound preference
- Charge zap settings
- Zap on reactions
- Only zaps mode

#### Widgets & UI
- Enabled widgets
- Trending notes height
- Bitcoin ticker preferences

#### Custom Feeds
- User-created custom feeds

#### Miscellaneous
- Dismissed alerts/tours

### ❌ What Does NOT Get Synced

For **security and privacy**, the following are **never synced** to relays:

- **Private keys** (nsec, ncryptsec)
- **API keys** (translation services, AI services, media upload services with API keys)
- **Account credentials**
- **Private notes** (NIP-04 encrypted notes)
- **Sensitive session data**

## Usage

### Accessing Settings

1. Log in to Jumble with your Nostr account
2. Navigate to **Settings** → **General**
3. Find the "Sync Settings Across Devices" card at the top

### Syncing Options

#### Auto-sync on Login
- **Toggle**: ON by default
- When enabled, preferences are automatically pulled from relays when you log in
- Useful for seamless cross-device experience

#### Manual Push (Upload to Relays)
- Click **"Push to Relays"** button
- Saves your current settings to Nostr relays
- Use this when you've configured settings on one device and want to sync them

#### Manual Pull (Download from Relays)
- Click **"Pull from Relays"** button
- Loads settings from relays and applies them locally
- **Note**: This will reload the page to apply all changes
- Use this when switching to a new device

### Typical Workflow

#### First Device Setup
1. Configure your preferred settings on Jumble
2. Click **"Push to Relays"** to save them

#### New Device
1. Log in with your Nostr account
2. Settings will auto-sync on login (if auto-sync is enabled)
3. Or manually click **"Pull from Relays"**

#### Updating Settings
1. Change any settings in Jumble
2. Click **"Push to Relays"** to sync the changes
3. Other devices will pick up changes on next login or manual pull

## Technical Implementation

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                         │
│  (Nip78PreferencesSettings Component)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Nip78PreferencesProvider                       │
│  - Manages sync state                                       │
│  - Handles push/pull operations                             │
│  - Auto-sync on login                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│          Nip78PreferencesService                            │
│  - Extracts syncable preferences                            │
│  - Creates NIP-78 events (kind 30078)                       │
│  - Parses and validates events                              │
│  - Applies preferences to local storage                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              LocalStorageService                            │
│  - Manages browser local storage                            │
│  - Getters/setters for all preferences                      │
└─────────────────────────────────────────────────────────────┘
```

### NIP-78 Event Structure

```json
{
  "kind": 30078,
  "content": "{\"themeSetting\":\"dark\",\"fontSize\":14,...}",
  "tags": [
    ["d", "social.jumble.preferences"]
  ],
  "created_at": 1234567890,
  "pubkey": "...",
  "sig": "..."
}
```

- **kind**: 30078 (NIP-78 application data)
- **d tag**: "social.jumble.preferences" (unique identifier for Jumble)
- **content**: JSON-serialized preferences object
- **addressable**: Only the latest event per user is relevant

### Files Added

1. **`src/services/nip78-preferences.service.ts`**
   - Core service for NIP-78 operations
   - Preference extraction and application logic
   - Event creation and parsing

2. **`src/providers/Nip78PreferencesProvider.tsx`**
   - React context provider for sync state management
   - Push/pull operations
   - Auto-sync logic

3. **`src/components/Nip78PreferencesSettings/index.tsx`**
   - User interface for manual sync controls
   - Status display
   - Auto-sync toggle

4. **`src/components/ui/alert.tsx`**
   - UI component for displaying alerts

### Integration Points

- Integrated into `App.tsx` provider tree
- Added to General Settings page
- Connected to `NostrProvider` for relay communication
- Uses `LocalStorageService` for preference management

## Sync Frequency

- **Manual sync**: Immediate when user clicks push/pull
- **Auto-sync**: On login only (not continuous polling)
- **Rate limiting**: Minimum 1 minute between syncs
- **Prevents spam**: Single sync operation at a time

## Troubleshooting

### Preferences Not Syncing

1. **Check login status**: Ensure you're logged in with a Nostr account that can sign events
2. **Check relay connection**: Verify your relays are online in Settings → Relays
3. **Check auto-sync toggle**: Ensure it's enabled if expecting automatic sync
4. **Try manual sync**: Use "Push to Relays" then "Pull from Relays" on another device

### Settings Reset After Pull

This is expected behavior. Pull overwrites local settings with relay data. To fix:
1. Configure your preferred settings
2. Click "Push to Relays" to save them
3. Pull will now restore your saved preferences

### Partial Sync

If some settings sync but not others:
1. Check the "What gets synced" list above
2. API keys and private data are intentionally excluded
3. Some settings may require page reload to take effect

## Future Enhancements

Potential improvements for consideration:

- [ ] Conflict resolution for concurrent edits
- [ ] Sync profiles (work, personal, etc.)
- [ ] Selective sync (choose which categories to sync)
- [ ] Sync history and rollback
- [ ] Merge strategies instead of overwrite
- [ ] Background sync with conflict detection
- [ ] Export/import preferences as JSON

## Developer Notes

### Adding New Syncable Preferences

To add a new preference to sync:

1. Add to `TSyncablePreferences` type in `nip78-preferences.service.ts`
2. Add getter call in `getSyncablePreferences()`
3. Add setter call in `applySyncedPreferences()`
4. Ensure the preference exists in `LocalStorageService`

### Testing

```typescript
// Get current preferences
const prefs = nip78Service.getSyncablePreferences()
console.log(prefs)

// Create event
const draft = nip78Service.createPreferencesDraftEvent(prefs)
console.log(draft)

// Parse event (after fetching from relay)
const parsed = nip78Service.parsePreferencesEvent(event)
console.log(parsed)

// Apply
nip78Service.applySyncedPreferences(parsed)
```

## Credits

- **NIP-78 Specification**: [nostr-protocol/nips#78](https://github.com/nostr-protocol/nips/blob/master/78.md)
- **Implementation**: Jumble development team
- **Inspired by**: remoteStorage and cross-device sync patterns

## License

This feature is part of Jumble and follows the same MIT license.
