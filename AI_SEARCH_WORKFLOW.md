# AI Search Workflow

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  User opens AI   │
                    │  prompt on note  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  User types:     │
                    │  "Find my notes  │
                    │  about Bitcoin"  │
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI PROCESSING LAYER                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  AI Service detects       │
                │  search intent            │
                │  (keywords: "find")       │
                └───────────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  Injects search context:  │
                │  - User's npub            │
                │  - nostr.band syntax      │
                │  - Available filters      │
                └───────────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  Sends to OpenRouter AI   │
                │  with enhanced context    │
                └───────────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  AI analyzes request:     │
                │  - Query: "Bitcoin"       │
                │  - Filter: by:npub1...    │
                │  - Type: kind:1 (notes)   │
                └───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SEARCH URL CONSTRUCTION                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  NostrBandSearchService builds  │
            │  URL with parameters:           │
            │  - q=bitcoin                    │
            │  - by:npub1r0rs5q...            │
            └─────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │  Final URL:                     │
            │  nostr.band/?q=bitcoin+by:npub1 │
            └─────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI RESPONSE                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  AI responds to user:     │
                │  "Here's a search for     │
                │  your Bitcoin notes:      │
                │                           │
                │  nostr.band/?q=bitcoin+   │
                │  by:npub1r0rs5q...        │
                │                           │
                │  Click to see results!"   │
                └───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      USER ACTION                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  User clicks URL          │
                └───────────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  Opens nostr.band         │
                │  with search results      │
                └───────────────────────────┘
```

## Component Flow

```
┌────────────────────────────────────────────────────────────────┐
│                        JUMBLE UI                               │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              AI Prompt Widget                        │    │
│  │                                                       │    │
│  │  [User Input]                              [Send]    │    │
│  │  "Find my notes about Bitcoin"                       │    │
│  │                                                       │    │
│  │  [AI Response]                                       │    │
│  │  Here's your search: nostr.band/?q=bitcoin+by:npub1  │    │
│  │                                                       │    │
│  └──────────────────────────────────────────────────────┘    │
│                           │                                   │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                      AI Provider                               │
│                                                                │
│  • Gets user's pubkey from Nostr context                      │
│  • Passes to AI Service                                       │
│  • Returns formatted response                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                      AI Service                                │
│                                                                │
│  • Detects search intent                                      │
│  • Injects search context                                     │
│  • Calls OpenRouter API                                       │
│  • Formats response                                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│              NostrBandSearchService                            │
│                                                                │
│  • Constructs search URLs                                     │
│  • Validates parameters                                       │
│  • Formats queries                                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
User Input
    │
    │ "Find my notes about Bitcoin"
    │
    ▼
┌─────────────────┐
│ AIPromptWidget  │  ──┐
└─────────────────┘    │
                       │ Gets pubkey
┌─────────────────┐    │
│ NostrProvider   │  ◄─┘
└─────────────────┘
    │
    │ pubkey: "1f4c1ed244c84a2b..."
    │
    ▼
┌─────────────────┐
│  AIProvider     │
└─────────────────┘
    │
    │ chat(messages, pubkey)
    │
    ▼
┌─────────────────┐
│   AIService     │
└─────────────────┘
    │
    │ Enhances with:
    │ - Search context
    │ - User npub: npub1r0rs5q...
    │ - nostr.band syntax
    │
    ▼
┌─────────────────┐
│  OpenRouter AI  │
└─────────────────┘
    │
    │ Processes request
    │ Understands:
    │ - Query: "Bitcoin"
    │ - Author: user's npub
    │ - Intent: Find notes
    │
    ▼
┌─────────────────┐
│ AI Response     │
└─────────────────┘
    │
    │ "Here's your search:
    │  nostr.band/?q=bitcoin+by:npub1r0rs5q..."
    │
    ▼
┌─────────────────┐
│ Display to User │
└─────────────────┘
```

## State Transitions

```
┌─────────────┐
│   IDLE      │  User viewing note
└─────────────┘
      │
      │ Click AI icon
      ▼
┌─────────────┐
│  AI OPENED  │  Prompt widget visible
└─────────────┘
      │
      │ Type search query
      ▼
┌─────────────┐
│  TYPING     │  Input active
└─────────────┘
      │
      │ Press Enter / Click Send
      ▼
┌─────────────┐
│  PROCESSING │  Shows loading spinner
└─────────────┘
      │
      │ AI generates response
      ▼
┌─────────────┐
│  RESPONDED  │  URL displayed
└─────────────┘
      │
      │ User clicks URL
      ▼
┌─────────────┐
│ NOSTR.BAND  │  External site opens
└─────────────┘
```

## Example Interaction Sequence

```
TIME    USER                    SYSTEM                      RESULT
────────────────────────────────────────────────────────────────────
0:00    Opens note             Renders AI button           [✨ Button]
0:01    Clicks AI icon         Opens prompt widget         [Dialog open]
0:02    Types "find my         Captures input              [Text input]
        notes about btc"
0:03    Presses Enter          Sends to AI Service         [Loading...]
0:04                           Detects search intent       [Context added]
0:05                           Gets user npub              [npub1r0rs5q...]
0:06                           Sends to OpenRouter         [API call]
0:07                           AI processes request        [Analyzing...]
0:08                           Constructs search URL       [Building URL]
0:09                           Returns response            [Response ready]
0:10    Sees AI response       Displays message & URL      [URL shown]
0:11    Clicks URL             Opens nostr.band            [New tab]
0:12    Views search results   Shows matching notes        [Results!]
```

## Search Parameter Flow

```
User: "Find articles about privacy from 2024"
                │
                ▼
    ┌───────────────────────┐
    │   Parse Intent        │
    └───────────────────────┘
                │
                ├─► Query: "privacy"
                ├─► Kind: 30023 (articles)
                └─► Since: 2024-01-01
                │
                ▼
    ┌───────────────────────┐
    │  Build URL Parts      │
    └───────────────────────┘
                │
                ├─► q=privacy
                ├─► kind:30023
                └─► since:2024-01-01
                │
                ▼
    ┌───────────────────────┐
    │  Construct URL        │
    └───────────────────────┘
                │
                ▼
    nostr.band/?q=privacy+kind:30023+since:2024-01-01
```

## Error Handling Flow

```
User Input
    │
    ▼
┌─────────────────┐
│ Validate Input  │
└─────────────────┘
    │
    ├─► Empty? ──► Show placeholder
    │
    ├─► No AI key? ──► Show config warning
    │
    └─► Valid ──► Continue
                    │
                    ▼
              ┌─────────────┐
              │ Send to AI  │
              └─────────────┘
                    │
                    ├─► Network error? ──► Show error message
                    │
                    ├─► API error? ──► Show error details
                    │
                    └─► Success ──► Display response
```

## Integration Points

```
┌────────────────────────────────────────────────────────┐
│                    Jumble App                          │
│                                                        │
│  ┌──────────────┐         ┌──────────────┐           │
│  │ Note Display │────────▶│  AI Widget   │           │
│  └──────────────┘         └──────────────┘           │
│                                  │                    │
│                                  │                    │
│  ┌──────────────┐         ┌──────────────┐           │
│  │NostrProvider │────────▶│ AIProvider   │           │
│  │(User Context)│         └──────────────┘           │
│  └──────────────┘                │                    │
│                                   │                    │
└────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
          ┌──────────────────┐         ┌──────────────────┐
          │   AI Service     │────────▶│ OpenRouter API   │
          └──────────────────┘         └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │NostrBandSearch   │
          │    Service       │
          └──────────────────┘
```

---

**This workflow enables seamless, intelligent search across Nostr using natural language! 🔍✨**
