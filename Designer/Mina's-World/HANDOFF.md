# Mina's World — Handoff Package 🌟

Creative sandbox for kids 8–12. iOS prototype + landing + widgets, plus a live (refreshable) artifact.

## Brand mark
- `assets/mina-world-logo.svg` — primary logo. Puffy cloud wordmark ("Mina's / World", Baloo 2 ExtraBold, white fill + lavender outline) with a forward-facing cute anime Mina perched on top: black bob, pink bow, magenta top — drawn from the reference painting `mp7t005u-Mina.jpeg`.
- `logo.html` — logo showcase: primary lockup, on-white version, app icon, color tokens, usage rules.
- Vector, infinitely scalable. For print/production, convert the wordmark text to outlines so Baloo 2 isn't required.

### Logo tokens
| Role | Value |
|---|---|
| Lavender outline | `#b596ec` |
| Bow pink | `#ff8fc4` |
| Mina magenta | `#d12878` |
| Hair | `#1f1611` |
| Skin | `#f2c9a8` |
| Sparkle | `#ffd64a` |

Clear space: one bow-width on all sides. Minimum width 96px. The character never shows a face — keeps it friendly and identity-safe.

## Screens (iOS app surfaces)
- `screens/01-onboarding.html`
- `screens/02-avatar.html` — avatar creator
- `screens/03-world-builder.html` — world builder
- `screens/04-friend-visit.html` — friend visit / multiplayer
- `screens/05-quest-map.html` — quest map

## Companion surfaces
- `landing.html` — marketing page (now uses the logo in the nav)
- `widgets.html` — iOS widgets: Home Screen quest, Lock Screen friend invite, parent safety glance

## Live artifact
- Sources: `template.html`, `data.json`, `artifact.json`, `provenance.json`
- Registered ID: `la-minas-world-live-prototype-d61013914abc`
- `index.html` is daemon-derived from `template.html` + `data.json`; refreshable later without redesign.

## Shared assets
- `styles/mina-world.css`, `scripts/mina-world.js`

## Next steps (suggested)
- Add a parent safety dashboard screen (dropped from the original 5-screen pick).
- Outline the wordmark text and export PNG icon sizes (1024 / 180 / 120) for the App Store.
