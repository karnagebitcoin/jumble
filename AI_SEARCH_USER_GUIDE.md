# AI Search User Guide

## Quick Start

The AI in Jumble can now help you search for Nostr content! Just ask it in natural language, and it will create search links for you.

## Simple Examples

### Search for a Topic

**You say**: "Find notes about Bitcoin"

**AI gives you**: A nostr.band link that searches for Bitcoin-related notes

### Search Your Own Notes

**You say**: "Find my notes about nostr"

**AI gives you**: A search link filtered to only your notes about nostr

### Search by Date

**You say**: "Show me notes from last week about privacy"

**AI gives you**: A time-filtered search for privacy topics

## Search Syntax Guide

When talking to the AI, you can be specific about what you want:

### By Topic
- "Find notes about [topic]"
- "Search for [keyword]"
- "Show me content about [subject]"

### By Author
- "Find notes by npub1..." (you need to provide the npub)
- "Search my notes about [topic]"
- "Show what [npub] said about [topic]"

### By Type
- "Find articles about [topic]" (searches kind:30023)
- "Show me regular notes about [topic]" (searches kind:1)
- "Find zaps for [topic]" (searches kind:9735)

### By Date
- "Find notes from [date]"
- "Show me notes since [date]"
- "Search for content until [date]"
- "Find notes from last week"

### Combined Searches
- "Find my articles about Bitcoin from 2024"
- "Search for kind:1 notes about privacy since 2024-01-01"
- "Show me notes by npub1... about lightning network"

## Common Event Kinds

When you want to search for specific types of content:

- `kind:0` - User profiles
- `kind:1` - Regular notes/posts
- `kind:6` - Reposts
- `kind:7` - Reactions (likes)
- `kind:9735` - Zaps (tips)
- `kind:30023` - Articles/long-form content

Example: "Find kind:30023 about privacy" searches for articles about privacy.

## Tips

1. **Be Specific**: The more detail you provide, the better the search
2. **Use NPUBs**: For author searches, use npub format (not hex pubkeys)
3. **Date Format**: Use YYYY-MM-DD for dates (e.g., 2024-01-15)
4. **Combine Filters**: You can mix topic, author, kind, and date filters
5. **Click the Links**: The AI gives you clickable nostr.band URLs

## Limitations

- The AI can't search by display name - you need to know the npub
- Results open on nostr.band, not directly in Jumble
- You must have AI configured in settings

## Examples in Action

### Example 1: Finding Your Content

**You**: "Find all my notes about nostr developers"

**AI**: "Here's a search for your notes about nostr developers:
https://nostr.band/?q=nostr+developers+by:npub1r0rs5q2gk0e3dk3nlc7gnu378ec6cnlenqp8a3cjhyzu6f8k5sgs4sq9ac"

### Example 2: Topic Research

**You**: "Show me articles about Bitcoin privacy from 2024"

**AI**: "I'll search for Bitcoin privacy articles from 2024:
https://nostr.band/?q=bitcoin+privacy+kind:30023+since:2024-01-01"

### Example 3: Following Someone's Posts

**You**: "Find recent notes by npub1a2b3c4d... about lightning"

**AI**: "Here's a search for their lightning-related notes:
https://nostr.band/?q=lightning+by:npub1a2b3c4d..."

## Advanced Usage

### Multiple Keywords
"Find notes about bitcoin AND lightning" - searches for both terms

### Time Ranges
"Show notes between 2024-01-01 and 2024-06-30" - uses both since and until

### Specific Kinds
"Find kind:1 OR kind:6 about nostr" - searches notes and reposts

## Getting Help

If the AI doesn't understand your search:

1. Try rewording more simply: "Search for bitcoin"
2. Be explicit about filters: "Find kind:1 notes about privacy"
3. Provide complete npubs for author searches
4. Use standard date format: YYYY-MM-DD

## Configuration Required

To use this feature:

1. Go to **Settings** (gear icon)
2. Click **AI Configuration**
3. Enter your **OpenRouter API Key**
4. Select an **AI Model**
5. Save settings

Once configured, the AI prompt button (sparkle icon) will work on any note.

## Privacy Note

When you use AI search:
- Your query is sent to the AI service (OpenRouter)
- Search URLs are public (they're just nostr.band links)
- Your npub is included when searching your own content
- API keys are stored only in your browser

## Feedback

If you find useful search patterns or have suggestions for improvement, please share them with the Jumble community!

---

**Happy Searching! 🔍⚡**
