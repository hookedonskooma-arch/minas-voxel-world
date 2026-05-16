# Feature: Onboarding Screen

## Summary

Build the `/onboarding` route as a phone-screen product page that matches the Open Design export (`screens/01-onboarding.html`). This is the in-app "home" screen for mobile users — a welcoming entry point with hero branding, feature preview cards, and a starter-world selector that links into the avatar studio and world builder.

## User Story

As a child user opening Mina's World
I want a colorful welcome screen that shows me what I can do and lets me pick a starter world
So that I feel excited and know where to start creating

## Problem Statement

The design export includes a dedicated onboarding product screen (`screens/01-onboarding.html`) that has not been implemented. The BottomNav links to `/` as "Home", but `/` is the desktop launcher, not the in-app mobile home screen. There is no welcoming first-run experience that introduces the avatar, friends, and world features before dropping the user into a specific tool.

Evidence:
- `screens/01-onboarding.html:9-60` — complete onboarding screen with hero card, mini-cards, preset row, and bottom nav
- `src/components/BottomNav.tsx:8` — Home tab links to `/` (launcher), not the in-app home
- `src/app/onboarding/page.tsx` — does not exist

## Solution Statement

1. Create `/onboarding` route (`src/app/onboarding/page.tsx`) with exact visual match to the design export.
2. Add an inline SVG logo component (`src/components/Logo.tsx`) so the puffy wordmark renders without external font dependencies.
3. Copy the logo asset to `public/assets/mina-world-logo.svg` for fallback/reference.
4. Wire the "Start creating" button to `/studio` and "Parent setup" to a simple parent-gate modal.
5. Wire the starter-world presets (Cloud Park, Moon Bakery, Bunny Town) to `worldBuilderStore.createNewWorld()` with mapped biomes, then navigate to `/worlds`.
6. Update `BottomNav` so the "Home" tab links to `/onboarding` and shows active state there.

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY |
| Complexity | LOW |
| Systems Affected | Next.js App Router, Zustand store, shared components |
| Dependencies | Existing `worldBuilderStore`, `design-system.css`, `BottomNav` |
| Estimated Tasks | 5 |
| Confidence | 9/10 — straightforward port of existing HTML/CSS into React using established patterns |

---

## UX Design

### Before State
```
User opens app on mobile
  → / (launcher page, desktop-optimized, feels wrong on phone)
  → Clicks "Create Avatar" → /studio
  → No intro, no context, no starter-world choice
```

### After State
```
User opens app on mobile
  → /onboarding (colorful phone-screen welcome)
  → Sees hero with logo, "Make your tiny world sparkle"
  → Taps "Start creating" → /studio
  → Or picks "Cloud Park" starter → world created → /worlds
  → Bottom nav Home tab is active
```

### Interaction Changes

| Location | Before | After | User Impact |
|----------|--------|-------|-------------|
| `/` root | Desktop launcher only | Still desktop launcher | No change for desktop |
| `/onboarding` | 404 | Welcoming phone-screen home | Mobile users get an app-like first screen |
| BottomNav Home | Links to `/` | Links to `/onboarding` | Tapping Home goes to the in-app dashboard |
| Starter worlds | N/A | 3 presets create a world + navigate | One-tap entry into world builder with a theme |

---

## NOT Building (Scope Limits)

- **Parent setup page**: The "Parent setup" button will open a simple modal with safety info, not a full parent dashboard. Full parent gate is out of scope.
- **Quests page**: BottomNav still links to `/quests` (404). That is a separate screen from the design export and out of this plan's scope.
- **Friend visit screen**: Out of scope — separate design export file.
- **Animation / micro-interactions beyond hover/active**: The CSS already includes transitions. No custom JS animations.

---

## Mandatory Reading

| Priority | File | Lines | Why Read This |
|----------|------|-------|---------------|
| P0 | `src/app/studio/page.tsx` | 1-205 | Pattern to MIRROR exactly — phone-screen wrapper, ios-status, app-shell, topbar, sections, BottomNav |
| P0 | `Designer/Mina's-World/screens/01-onboarding.html` | 9-60 | Source design to match pixel-for-pixel |
| P1 | `src/styles/design-system.css` | 29-250 | All CSS classes already exist (hero-card, mini-card, preset, panel, badge, etc.) |
| P1 | `src/store/worldBuilderStore.ts` | 48-77 | `createNewWorld(name, biome)` action to call for starter world presets |
| P2 | `src/components/BottomNav.tsx` | 1-34 | Pattern for nav items and active-state detection |

**External Documentation:** None needed — all patterns are internal.

## Patterns to Mirror

**PHONE_SCREEN_LAYOUT:**
```tsx
// SOURCE: src/app/studio/page.tsx:55-69
<div className="phone-screen">
  <div className="ios-status"><span>9:41</span><span>5G 100%</span></div>
  <main className="app-shell">
    {/* sections */}
    <BottomNav />
  </main>
</div>
```

**TOPBAR_WITH_CHIP_AND_ICON:**
```tsx
// SOURCE: src/app/studio/page.tsx:64-68
<nav className="topbar">
  <span className="avatar-chip">Avatar Studio</span>
  <button className="icon-btn" onClick={handleSave} aria-label="Save avatar">
    {saving ? '...' : saved ? '✓' : '✓'}
  </button>
</nav>
```

**PRESET_ROW_ACTIVE_STATE:**
```tsx
// SOURCE: src/app/worlds/page.tsx:133-143
<div className="preset-row" style={{ marginTop: 12 }}>
  {PIECES.map((piece) => (
    <button
      key={piece.label}
      className={`preset ${selectedPiece.label === piece.label ? 'is-active' : ''}`}
      onClick={() => setSelectedPiece(piece)}
    >
      {piece.emoji} {piece.label}
    </button>
  ))}
</div>
```

## Files to Change

| File | Action | Justification |
|------|--------|---------------|
| `public/assets/mina-world-logo.svg` | CREATE | Logo asset needed for reference and potential direct use |
| `src/components/Logo.tsx` | CREATE | Inline SVG component so the Baloo wordmark renders without external font fetch |
| `src/app/onboarding/page.tsx` | CREATE | Main onboarding screen matching design export |
| `src/components/BottomNav.tsx` | UPDATE | Change Home href from `/` to `/onboarding` so mobile users land in the app shell |

---

## Step-by-Step Tasks

### Task 1: COPY `mina-world-logo.svg` to `public/assets/`

**Action**: CREATE
**Details**: Copy the SVG from `Designer/Mina's-World/assets/mina-world-logo.svg` to `public/assets/mina-world-logo.svg` so Next.js serves it statically.
**Validate**: `ls public/assets/mina-world-logo.svg` succeeds.

### Task 2: CREATE `src/components/Logo.tsx`

**Action**: CREATE
**Details**: Inline SVG React component embedding the full SVG markup from the design export. Remove the external `@import` font line — instead rely on system-ui fallback fonts already in the SVG's font stack (`Baloo 2`, `Quicksand`, `Varela Round`, `Arial Rounded MT Bold`, system-ui). The SVG is large; paste it verbatim inside the component. Export as `Logo` with optional `className` and `style` props.
**Mirror**: `Designer/Mina's-World/assets/mina-world-logo.svg` — exact SVG content
**Gotcha**: The SVG has `width="1200" height="880"`. In the hero card it should scale down. Wrap it in a `<div className="mw-logo app-logo">` or set CSS `max-width: 240px; height: auto; margin: 0 auto;`.
**Validate**: `npm run build` compiles without SVG syntax errors.

### Task 3: CREATE `src/app/onboarding/page.tsx`

**Action**: CREATE
**Details**: Build the onboarding page using the phone-screen layout pattern.

Sections to include (matching `01-onboarding.html`):
- `ios-status` bar
- `topbar` with `<span className="avatar-chip">Mina</span>` and an icon-btn with shield icon (aria-label "Parent safety")
- `hero-card` containing:
  - `<Logo />` centered
  - `<p className="kicker" style={{ textAlign: 'center' }}>Welcome home</p>`
  - `<h1>Make your tiny world sparkle.</h1>`
  - `<p style={{ marginTop: 12 }}>Pick a starter world, design your cutie, and invite only parent-approved friends.</p>`
  - `<div className="button-row" style={{ marginTop: 18 }}>` with:
    - `<Link href="/studio" className="primary-btn">Start creating</Link>`
    - `<button className="secondary-btn" onClick={openParentModal}>Parent setup</button>`
- `grid-2` with two `mini-card`s:
  - Avatar card: `style={{ background: 'color-mix(in oklch, var(--bubble), white 54%)' }}`, badge "Cute", strong "Avatar", p "Hair, eyes, outfit"
  - Friends card: `style={{ background: 'color-mix(in oklch, var(--mint), white 48%)' }}`, badge "Safe", strong "Friends", p "Approved visits only"
- `panel` with:
  - `<h3>Choose a starter world</h3>`
  - `preset-row` with three buttons: "Cloud Park" (active by default), "Moon Bakery", "Bunny Town"
- `BottomNav`

State:
- `selectedWorld` — tracks active preset
- `showParentModal` — tracks parent-setup modal visibility

Starter world behavior:
```
Cloud Park  → createNewWorld('Cloud Park', 'meadow')
Moon Bakery → createNewWorld('Moon Bakery', 'candy')
Bunny Town  → createNewWorld('Bunny Town', 'forest')
```
Then `router.push('/worlds')`.

Parent modal:
- Simple centered modal using the same overlay style as `worlds/page.tsx` (fixed inset-0, dark translucent backdrop, panel container)
- Content: "Parent Setup", bullet points about safety rules, close button.

**Mirror**: `src/app/studio/page.tsx:55-203` — phone-screen wrapper and section structure
**Imports**: `useState` from React, `Link` from Next.js, `useRouter` from Next.js, `Logo` from `@/components/Logo`, `BottomNav` from `@/components/BottomNav`, `useWorldBuilderStore` from `@/store/worldBuilderStore`, `Shield` from `lucide-react`
**Gotcha**: The `h1` in the design has `max-width: 9ch` and large font size. It will look fine inside the hero card. The hero card `::after` pseudo-element (gradient blob) is already in CSS.
**Validate**: `npm run build` passes. Navigate to `/onboarding` in browser and verify visual match.

### Task 4: UPDATE `src/components/BottomNav.tsx`

**Action**: UPDATE
**Details**: Change the Home href from `/` to `/onboarding` so the in-app bottom nav takes users to the mobile home screen.

```tsx
const NAV_ITEMS = [
  { href: '/onboarding', label: 'Home', icon: Home },
  { href: '/studio', label: 'Avatar', icon: Sparkles },
  { href: '/worlds', label: 'Build', icon: Globe },
  { href: '/quests', label: 'Quests', icon: Map },
];
```

**Gotcha**: The landing page at `/` is still accessible directly. Desktop users or shared links still work. Only the BottomNav entry point changes.
**Validate**: `npm run build` passes. Click Home in BottomNav on `/studio` → navigates to `/onboarding`.

### Task 5: VISUAL VERIFICATION

**Action**: MANUAL
**Details**: Open `/onboarding` in browser. Compare against `Designer/Mina's-World/screens/01-onboarding.html` opened side-by-side. Verify:
- Hero card gradient blob visible top-right
- Logo centered and scaled appropriately
- Kicker centered, h1 large and narrow
- Button row with primary + secondary buttons
- Two mini-cards in grid-2 with colored backgrounds
- Panel with preset row and active state
- Bottom nav Home tab active
- No horizontal overflow on 390×844 viewport

---

## Testing Strategy

No new unit tests needed — this is a pure UI page with no business logic beyond store navigation.

### Edge Cases Checklist

- [ ] Clicking a starter world when no world exists yet → creates and navigates
- [ ] Clicking a starter world when a world already exists → overwrites with new starter world (store behavior) and navigates
- [ ] Parent modal opens and closes cleanly
- [ ] Mobile viewport (390×844) has no horizontal scroll
- [ ] BottomNav active state shows Home as active on `/onboarding`

---

## Validation Commands

1. **Type check / build**: `npm run build`
2. **Manual verification**: Open `http://localhost:3000/onboarding` and compare to `Designer/Mina's-World/screens/01-onboarding.html`

---

## Acceptance Criteria

- [ ] `/onboarding` renders without errors and matches the design export visually
- [ ] Logo component renders inline SVG with no broken font fallbacks
- [ ] "Start creating" navigates to `/studio`
- [ ] Each starter-world preset creates a world via `worldBuilderStore` and navigates to `/worlds`
- [ ] Parent setup button opens a modal with safety info
- [ ] BottomNav Home tab links to `/onboarding` and shows active state
- [ ] `npm run build` passes with no new type/lint errors
- [ ] No regressions in existing `/studio`, `/worlds`, or `/` pages

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Logo SVG too large for inline component | Low | Low | SVG is ~8KB gzipped; acceptable. Can lazy-load if needed. |
| `createNewWorld` overwriting existing world surprises user | Low | Low | This matches design intent — starter worlds are for first launch. |
| Changing BottomNav Home href breaks desktop flow | Low | Med | `/` landing page is still accessible directly; only BottomNav changed. |
