# Nostr.band AI Search Feature

## Overview

This feature enhances Jumble's AI capabilities by enabling intelligent search queries via nostr.band. Users can now ask the AI to search for specific Nostr content using natural language, and the AI will construct appropriate nostr.band search URLs.

## How It Works

### 1. Enhanced AI Context

When a user's message contains search-related keywords (like "search", "find", or "look for"), the AI system automatically adds contextual information about nostr.band search capabilities to the conversation.

### 2. Nostr.band Query Construction

The AI understands how to construct nostr.band search URLs with various parameters:

- **Text search**: Basic keyword search
- **Author filter**: Search by specific npub (e.g., `by:npub1...`)
- **Kind filter**: Filter by event kind (e.g., `kind:1` for notes, `kind:30023` for articles)
- **Date filters**: Time-based filtering with `since:YYYY-MM-DD` and `until:YYYY-MM-DD`

### 3. User Pubkey Integration

When available, the AI knows the current user's npub, making it easy to search for content by the user or related to them.

## Usage Examples

### Example 1: Search for Your Own Notes on a Topic

**User**: "Find my notes about nostr developers"

**AI Response**:
```
I'll help you search for your notes about nostr developers. Here's the search URL:

https://nostr.band/?q=nostr+developers+by:npub1r0rs5q2gk0e3dk3nlc7gnu378ec6cnlenqp8a3cjhyzu6f8k5sgs4sq9ac

This will show all notes mentioning "nostr developers" that you've posted. Click the link to see the results on nostr.band.
```

### Example 2: Search for Recent Articles

**User**: "Show me articles about Bitcoin from the last week"

**AI Response**:
```
Here's a search for recent Bitcoin articles:

https://nostr.band/?q=bitcoin+kind:30023+since:2024-10-22

This searches for:
- Articles (kind:30023) about Bitcoin
- Posted since October 22, 2024

Click the link to browse the results.
```

### Example 3: Search by Author

**User**: "Find notes by npub1abc... about lightning network"

**AI Response**:
```
I'll search for notes about the lightning network by that user:

https://nostr.band/?q=lightning+network+by:npub1abc...

This will show all notes from that author discussing the lightning network.
```

### Example 4: Complex Search

**User**: "Search for kind:1 notes about privacy since 2024-01-01"

**AI Response**:
```
Here's your privacy-focused note search:

https://nostr.band/?q=privacy+kind:1+since:2024-01-01

This searches for:
- Regular notes (kind:1)
- Containing "privacy"
- Posted since January 1, 2024

Click to see all matching notes.
```

## Technical Implementation

### Architecture

```
User Query
    ↓
AI Prompt Widget
    ↓
AI Provider (passes user pubkey)
    ↓
AI Service (enhances messages with search context)
    ↓
OpenRouter API (LLM processes request)
    ↓
Response with nostr.band URL
```

### Key Components

1. **nostr-band-search.service.ts**
   - Provides utilities for constructing nostr.band URLs
   - Parses search parameters
   - Formats queries according to nostr.band syntax

2. **ai.service.ts**
   - Enhanced with search context injection
   - Passes user pubkey to enable personalized searches
   - Provides system prompts explaining nostr.band capabilities

3. **AIPromptWidget**
   - Passes user pubkey from Nostr context to AI service
   - Displays AI responses including search URLs

### Search URL Format

The constructed URLs follow this pattern:

```
https://nostr.band/?q=<query>+<filters>
```

Where filters can include:
- `by:npub...` - Author filter
- `kind:NUMBER` - Event kind filter
- `since:YYYY-MM-DD` - Start date
- `until:YYYY-MM-DD` - End date

## Nostr Event Kinds Reference

Common event kinds for search:

| Kind | Type | Description |
|------|------|-------------|
| 0 | Metadata | User profile information |
| 1 | Short Text Note | Regular notes/posts |
| 3 | Contacts | Following list |
| 4 | Encrypted Direct Message | Private messages |
| 5 | Event Deletion | Delete request |
| 6 | Repost | Repost/boost |
| 7 | Reaction | Like/emoji reaction |
| 9735 | Zap | Lightning payment |
| 30023 | Long-form Content | Articles/blog posts |
| 30024 | Draft Long-form | Draft articles |
| 31990 | Handler Information | App metadata |

## Benefits

1. **Natural Language Interface**: Users don't need to learn nostr.band syntax
2. **Contextual Awareness**: AI knows the user's npub for personalized searches
3. **Flexible Queries**: Supports complex multi-parameter searches
4. **Educational**: AI explains what each search parameter does
5. **Direct Integration**: Users can immediately click through to nostr.band results

## Limitations

1. **Name Resolution**: The AI cannot automatically resolve human names to npubs - users must provide npubs for author searches
2. **No Direct Results**: Currently provides search URLs rather than fetching and displaying results inline
3. **Requires AI Configuration**: Users must have configured their AI settings with an API key

## Future Enhancements

Potential improvements for this feature:

1. **Profile Search Integration**: Allow searching by display name with automatic npub lookup
2. **Inline Results**: Fetch and display search results directly in Jumble
3. **Search History**: Track and suggest previous successful searches
4. **Advanced Filters**: Support for more nostr.band search parameters
5. **Multi-Relay Search**: Combine nostr.band results with direct relay searches
6. **Result Caching**: Cache search results for faster repeat queries
7. **Search Templates**: Pre-built search templates for common use cases

## Use Cases

### Content Discovery
- Find all notes about a specific topic
- Discover long-form articles on subjects of interest
- Track conversations with specific hashtags

### User Research
- Find all content from a specific user
- Search for your own past notes on a topic
- Discover what others are saying about you

### Temporal Analysis
- Find notes from a specific time period
- Track how conversations evolved over time
- Discover trending topics from past dates

### Content Type Filtering
- Filter for only articles (kind:30023)
- Find just reactions or zaps
- Separate regular notes from replies

## Implementation Notes

### NostrBandSearchService

The service provides a clean API for constructing search URLs:

```typescript
import nostrBandSearchService from '@/services/nostr-band-search.service'

// Build a search URL
const url = nostrBandSearchService.buildSearchUrl({
  query: 'nostr developers',
  author: 'npub1...',
  kind: 1,
  since: Math.floor(Date.now() / 1000) - 86400 * 7 // Last 7 days
})
```

### AI Context Enhancement

The AI service automatically enhances messages when search intent is detected:

```typescript
// Automatically adds system context when search keywords are present
const enhancedMessages = this.enhanceMessagesWithSearchContext(messages, userPubkey)
```

### User Pubkey Availability

The AI always knows the current user's npub (when logged in), enabling:
- Quick self-searches ("find my notes about X")
- Contextual references ("what have I said about Y?")
- Personalized search suggestions

## Testing the Feature

To test this feature:

1. **Configure AI Settings**
   - Go to Settings → AI Configuration
   - Add your OpenRouter API key
   - Select a model

2. **Open AI Prompt on a Note**
   - Click on any note
   - Click the AI icon to open the AI prompt widget

3. **Try Search Queries**
   - "Find notes about bitcoin"
   - "Search for my notes about nostr"
   - "Show me articles about privacy since 2024-01-01"
   - "Find kind:1 notes by npub1... about lightning"

4. **Click Generated URLs**
   - The AI will provide nostr.band URLs
   - Click them to see results

## Security Considerations

- API keys are stored locally in the browser
- Search queries are sent to OpenRouter AI service
- No sensitive data is included in search URLs
- User pubkeys are public information on Nostr

## Credits

This feature leverages:
- **nostr.band**: Excellent Nostr search and analytics platform
- **OpenRouter**: AI model access and routing
- **Nostr Protocol**: Decentralized social network
