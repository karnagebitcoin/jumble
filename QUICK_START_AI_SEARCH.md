# Quick Start: AI Search Feature

## What's New?

You can now ask Jumble's AI to search nostr.band for you! Just use natural language, and the AI will create the perfect search URL.

## How to Use

1. **Open any note** in Jumble
2. **Click the AI icon** (✨ sparkle) to open the AI prompt
3. **Ask for a search**, for example:
   - "Find my notes about Bitcoin"
   - "Search for articles about privacy"
   - "Show me notes by npub1... about lightning"

4. **The AI will respond** with a nostr.band search URL
5. **Click the URL** to see the results

## What You Can Search

### By Topic
```
"Find notes about nostr"
"Search for Bitcoin articles"
```

### Your Own Content
```
"Find my notes about privacy"
"Show me what I've posted about lightning"
```

### By Specific User (need their npub)
```
"Find notes by npub1r0rs5q2gk0e3dk3nlc7gnu378ec6cnlenqp8a3cjhyzu6f8k5sgs4sq9ac about developers"
```

### By Type (kind)
```
"Find kind:1 notes about privacy"
"Search for articles (kind:30023) about Bitcoin"
```

### By Date
```
"Find notes from last week"
"Search for content since 2024-01-01"
"Show me notes until 2024-06-30"
```

### Combined Searches
```
"Find my articles about Bitcoin from 2024"
"Search for kind:1 notes about privacy since 2024-01-01"
```

## Example Conversation

**You**: "Can you help me find notes about nostr developers?"

**AI**: "I'll help you search for notes about nostr developers. Here's the search URL:

https://nostr.band/?q=nostr+developers

This will show all notes mentioning 'nostr developers'. Click the link to see the results on nostr.band."

---

**You**: "Actually, find MY notes about nostr developers"

**AI**: "Here's a search for your notes about nostr developers:

https://nostr.band/?q=nostr+developers+by:npub1r0rs5q2gk0e3dk3nlc7gnu378ec6cnlenqp8a3cjhyzu6f8k5sgs4sq9ac

This filters the results to only show notes you've posted. Click to see all your posts about nostr developers."

---

**You**: "Find articles about privacy from this year"

**AI**: "Here's a search for privacy articles from 2024:

https://nostr.band/?q=privacy+kind:30023+since:2024-01-01

This searches for:
- Articles (kind:30023) about privacy
- Posted since January 1, 2024

Click the link to browse the results."

## Common Use Cases

### Content Discovery
- Find discussions on trending topics
- Discover long-form articles about subjects you care about
- Track hashtag conversations

### Personal Archive
- Find your own past notes on specific topics
- Review what you've written over time
- Rediscover old conversations

### Research
- Find what specific people are saying about topics
- Track discussions over time periods
- Filter by content type (notes vs articles vs zaps)

## Pro Tips

1. **Be specific**: "Find kind:1 notes about Bitcoin privacy" works better than "find stuff about Bitcoin"

2. **Use NPUBs for authors**: You need the full npub format for searching by author (the AI will tell you if you just give a name)

3. **Combine filters**: "Find my articles about Bitcoin from 2024" uses author + kind + date + topic filters

4. **Standard dates**: Use YYYY-MM-DD format (e.g., 2024-01-15) for date filters

5. **Event kinds**: Common ones are:
   - `kind:1` - regular notes
   - `kind:30023` - articles
   - `kind:9735` - zaps
   - `kind:6` - reposts
   - `kind:7` - reactions

## Prerequisites

You must have AI configured:

1. Go to **Settings** → **AI Configuration**
2. Enter your **OpenRouter API Key** (get one at openrouter.ai)
3. Select a **Model** (e.g., "Meta Llama 3.3 8B (Free)" works great)
4. **Save**

## Technical Details

### What the AI Does
1. Analyzes your search request
2. Identifies filters (author, kind, dates, keywords)
3. Constructs a properly formatted nostr.band URL
4. Explains what the search will find

### What Happens When You Click
- Opens nostr.band with your search
- Results are fetched from Nostr relays
- You can browse and interact with found content

### Privacy
- Your queries go to OpenRouter (the AI service)
- Search URLs are public (they're just links)
- Your API key stays in your browser
- No personal data is shared beyond what's in the search

## Troubleshooting

**AI doesn't understand my search?**
- Try simpler phrasing: "Search for bitcoin"
- Be explicit: "Find kind:1 notes about privacy"
- Provide full npubs for author searches

**No results on nostr.band?**
- Try broader terms
- Remove some filters
- Check your date ranges
- Verify the npub is correct

**AI button not working?**
- Check Settings → AI Configuration
- Make sure you have an API key
- Select a model
- Try refreshing the page

## Examples Gallery

```
✨ "Find notes about Bitcoin"
→ https://nostr.band/?q=bitcoin

✨ "Find my articles about nostr"  
→ https://nostr.band/?q=nostr+kind:30023+by:npub1...

✨ "Search for privacy notes since 2024-01-01"
→ https://nostr.band/?q=privacy+kind:1+since:2024-01-01

✨ "Find kind:9735 (zaps) about lightning"
→ https://nostr.band/?q=lightning+kind:9735

✨ "Show me notes by npub1abc... about development"
→ https://nostr.band/?q=development+by:npub1abc...

✨ "Find articles from last month about privacy"
→ https://nostr.band/?q=privacy+kind:30023+since:2024-09-29
```

## Next Steps

Once you get comfortable with basic searches, try:
- Combining multiple filters for precise results
- Searching different event kinds
- Using date ranges for temporal analysis
- Building a library of useful searches

---

**Happy Searching! 🔍✨⚡**

*Part of Jumble - A user-friendly Nostr client*
