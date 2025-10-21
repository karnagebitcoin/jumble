# Private Notes - Usage Examples

## Visual Structure

```
┌─────────────────────────────────────────────────┐
│  👤 User Profile                                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 📝 Private Note (Sticky Yellow)           │ │
│  │───────────────────────────────────────────│ │
│  │ Your text notes here...                   │ │
│  │ Can be multiple lines                     │ │
│  │                                           │ │
│  │ ─────────────────────────────────────────│ │
│  │ 📌 Pinned note:                          │ │
│  │ ┌───────────────────────────────────────┐│ │
│  │ │ @alice                      2h ago    ││ │
│  │ │ This is the pinned note content...   ││ │
│  │ │ 💜 42  💬 12  🔁 5                    ││ │
│  │ └───────────────────────────────────────┘│ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Alice                                          │
│  @alice.nostr.com                              │
│  ...                                           │
└─────────────────────────────────────────────────┘
```

## Workflow Examples

### Example 1: Add Text Note Only

1. Go to user's profile
2. Click options menu (⋯) → "Add private note"
3. Type: "Met at Nashville conference, working on Nostr relay"
4. Click "Save note"
5. ✅ Sticky note appears with your text

### Example 2: Pin Note from Feed

1. See an interesting note from @bob in your feed
2. Click note options (⋯) → "Pin to profile"
3. Dialog opens with option to add text
4. Type: "Great explanation of NIP-05"
5. Click "Pin to profile"
6. ✅ Go to @bob's profile - sticky note shows your text + the pinned note

### Example 3: Add Text to Existing Pinned Note

1. User already has a pinned note on their profile
2. Click on the sticky note text area
3. Type additional context
4. Click outside to save
5. ✅ Text is added while pinned note remains

### Example 4: Pin Multiple Notes

Currently, only one note can be pinned per user. If you pin a new note:
- The old pinned note is replaced
- Your text notes are preserved
- The new note becomes the pinned reference

## Data Structure

```json
{
  "privateNotes": {
    "user_pubkey_hex_1": {
      "text": "Met at conference, working on relay",
      "noteEventId": "event_id_hex"
    },
    "user_pubkey_hex_2": {
      "text": "Great developer, speaks Japanese"
      // no noteEventId = text only
    },
    "user_pubkey_hex_3": {
      "text": "",
      "noteEventId": "event_id_hex"
      // pinned note only, no text
    }
  }
}
```

## Tips

✨ **Text + Note**: Add context to why you pinned a specific note  
📝 **Text Only**: Quick personal notes without pinning  
📌 **Note Only**: Pin important notes without additional commentary  
🗑️ **Delete**: Click the X to remove the entire private note  
✏️ **Edit**: Click the text area to edit (doesn't affect pinned note)  
🔒 **Private**: Everything stays in your browser, never published
