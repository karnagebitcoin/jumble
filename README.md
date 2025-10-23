<div align="center">
  <picture>
    <img src="./resources/logo-light.svg" alt="Jumble Logo" width="400" />
  </picture>
  <p>logo designed by <a href="http://wolfertdan.com/">Daniel David</a></p>
</div>

# Jumble

A user-friendly Nostr client for exploring relay feeds

Experience Jumble at [https://jumble.social](https://jumble.social)

## Run Locally

### Option 1: With URL Preview Cards (Recommended)

```bash
# Clone this repository
git clone https://github.com/CodyTseng/jumble.git

# Go into the repository
cd jumble

# Run with Docker (includes proxy server for URL previews)
docker compose up -d

# Access at http://localhost:8089
```

### Option 2: Without Docker (No URL previews)

```bash
# Clone this repository
git clone https://github.com/CodyTseng/jumble.git

# Go into the repository
cd jumble

# Install dependencies
npm install

# Run the app
npm run dev

# Note: URL preview cards won't work without the proxy server
```

## Run Docker

```bash
# Clone this repository
git clone https://github.com/CodyTseng/jumble.git

# Go into the repository
cd jumble

# Run the docker compose
docker compose up --build -d
```

After finishing, access: http://localhost:8089

## Sponsors

<a target="_blank" href="https://opensats.org/">
  <img alt="open-sats-logo" src="./resources/open-sats-logo.svg" height="44">
</a>

## Donate

If you like this project, you can buy me a coffee :)

- **Lightning:** ⚡️ codytseng@getalby.com ⚡️
- **Bitcoin:** bc1qwp2uqjd2dy32qfe39kehnlgx3hyey0h502fvht
- **Geyser:** https://geyser.fund/project/jumble

## License

MIT
