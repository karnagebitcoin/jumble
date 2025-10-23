# Open Graph Preview Solutions for Jumble

## Current Situation

The production Jumble (https://jumble.social) uses a **custom proxy server** called `jumble-proxy-server` to fetch Open Graph metadata. This is visible in the `docker-compose.yml`:

```yaml
proxy-server:
  image: ghcr.io/danvergara/jumble-proxy-server:latest
  environment:
    - ALLOW_ORIGIN=${JUMBLE_SOCIAL_URL:-http://localhost:8089}
    - JUMBLE_PROXY_GITHUB_TOKEN=${JUMBLE_PROXY_GITHUB_TOKEN}
    - ENABLE_PPROF=true
    - PORT=8080
  ports:
    - "8090:8080"
```

When running with Docker, this proxy server handles CORS issues by fetching the HTML server-side.

## Why CORS is a Problem

Browsers block direct fetch requests to external websites due to CORS (Cross-Origin Resource Sharing) security policies. Most websites don't include `Access-Control-Allow-Origin` headers, so browser JavaScript cannot fetch their HTML to extract Open Graph metadata.

## Free Alternatives

### 1. **Self-Hosted jumble-proxy-server** (Recommended)
- **Cost**: Free (if you run Docker locally)
- **Setup**: Run `docker compose up` in the Jumble directory
- **Pros**: Full control, privacy, no rate limits
- **Cons**: Requires Docker, only works locally

### 2. **LinkPreview.net**
- **URL**: https://www.linkpreview.net/
- **Free Tier**: 60 requests/hour
- **API**: `https://api.linkpreview.net/?key=YOUR_KEY&q=URL`
- **Pros**: Easy to use, returns JSON
- **Cons**: Low free tier limit
- **Code Example**:
```typescript
const response = await fetch(`https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`)
const data = await response.json()
return {
  title: data.title,
  description: data.description,
  image: data.image
}
```

### 3. **OpenGraph.io**
- **URL**: https://www.opengraph.io/
- **Free Tier**: Limited free trial, then paid
- **API**: `https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}`
- **Pros**: Good quality data, reliable
- **Cons**: Very limited free tier

### 4. **MicroLink.io**
- **URL**: https://microlink.io/
- **Free Tier**: 50 requests/day (free), 1000/day (hobby plan)
- **API**: `https://api.microlink.io/?url=${encodeURIComponent(url)}`
- **Pros**: Good free tier, rich metadata
- **Cons**: Rate limited
- **Code Example**:
```typescript
const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
const data = await response.json()
return {
  title: data.data.title,
  description: data.data.description,
  image: data.data.image?.url
}
```

### 5. **JSONLink.io** 
- **URL**: https://jsonlink.io/
- **Free Tier**: 100 requests/day
- **API**: `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`
- **Pros**: Simple, free tier available
- **Cons**: Limited free requests

### 6. **Cloudflare Workers** (DIY Free Proxy)
- **Cost**: Free tier (100k requests/day)
- **Setup**: Deploy a simple worker that fetches and parses HTML
- **Pros**: Very generous free tier, fast global network
- **Cons**: Requires setup and Cloudflare account
- **Code Example**:
```javascript
// Cloudflare Worker code
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  const response = await fetch(targetUrl)
  const html = await response.text()
  
  // Parse OG tags...
  
  return new Response(JSON.stringify(metadata), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
```

### 7. **Vercel Edge Functions** (DIY Free Proxy)
- **Cost**: Free tier (100GB bandwidth/month)
- **Setup**: Deploy a serverless function
- **Pros**: Easy deployment, generous free tier
- **Cons**: Requires Vercel account

## Recommended Approach

For **local development** in Shakespeare:
1. Run the Docker compose to get the proxy server
2. Or use a free service like MicroLink.io with rate limiting

For **production deployment**:
1. Deploy your own proxy using Cloudflare Workers (best free option)
2. Or use the Docker proxy server on a VPS
3. Or use a paid service for reliability

## Implementation in Jumble

Current code expects the proxy at `VITE_PROXY_SERVER` environment variable:

```typescript
// src/hooks/useFetchWebMetadata.tsx
const proxyServer = import.meta.env.VITE_PROXY_SERVER
if (proxyServer) {
  url = `${proxyServer}/sites/${encodeURIComponent(url)}` 
}
```

To enable it:
1. Start Docker compose: `docker compose up -d`
2. Set env var: `VITE_PROXY_SERVER=http://localhost:8090`
3. Rebuild: `npm run build`

Or modify `vite.config.ts` to set it by default for development.
