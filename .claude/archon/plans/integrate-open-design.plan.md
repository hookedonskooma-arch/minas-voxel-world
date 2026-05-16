# Feature: Integrate Open Design Export into React App

## Summary

Port the professional Open Design system (CSS chibi renderer, OKLCH color tokens, screen layouts, bottom navigation) from `Designer/Mina's-World/` into the existing Next.js React app. Replace the current generic styling with the exported design's visual system.

## User Story

As Mina's dad
I want the game to look exactly like the professional design export
So that Mina sees a polished, consistent app with cute CSS chibi avatars and intuitive iOS-style screens

## Problem Statement

The current React app uses generic Tailwind gradients and a complex SVG avatar renderer. The exported Open Design system has:
- A simpler, cuter **CSS chibi** with OKLCH-colored hair/eyes/outfit variables (`styles/mina-world.css:264-424`)
- **Professional color tokens** in OKLCH (bubble pink, star yellow, sky blue, mint green)
- **iOS-style phone screen layouts** with status bar, app shell, panels, sheets
- **Bottom navigation** matching the 4-tab structure (Home, Avatar, Build, Quests)
- **World builder grid** with emoji tiles and preset piece picker

## Solution Statement

1. Create a global CSS file with the exported OKLCH design tokens and component styles
2. Port the CSS chibi renderer into a React component with dynamic CSS custom properties
3. Restyle the Avatar Studio page to match the `screens/02-avatar.html` layout
4. Restyle the World Builder page to match the `screens/03-world-builder.html` layout
5. Update the landing page to match the design's hero card + screen gallery pattern
6. Add bottom navigation component shared across pages

## Metadata

| Field | Value |
|-------|-------|
| Type | ENHANCEMENT |
| Complexity | MEDIUM |
| Systems Affected | src/app/*, src/components/*, src/styles/* |
| Dependencies | Existing avatar store, world builder store |
| Estimated Tasks | 6 |
| Confidence | 8/10 — design is exported, patterns are clear |

---

## UX Design

### Before State
```
Current App:
- Generic Tailwind gradient backgrounds (pink/blue pastels)
- Complex SVG avatar with 400+ lines of path math
- World builder is a raw tile grid with no visual polish
- No bottom navigation
- No consistent design tokens
```

### After State
```
Designed App:
- OKLCH color system: bubble, star, sky, mint, violet, coral
- CSS chibi avatar with simple shapes, dynamic CSS variables
- iOS-style phone screen layout with status bar
- Cards with 28px border-radius, soft shadows
- Bottom nav with 4 tabs: Home, Avatar, Build, Quests
- Consistent typography: Sohne display font, SF Pro body
```

### Interaction Changes

| Location | Before | After | User Impact |
|----------|--------|-------|-------------|
| Avatar page | Complex SVG picker | CSS chibi + swatch palette | Faster, cuter, simpler |
| World page | Raw colored tiles | Emoji grid + preset picker | More playful and intuitive |
| Navigation | None | Bottom 4-tab nav | Easy access to all features |
| Colors | Arbitrary hex codes | OKLCH design tokens | Consistent, harmonious palette |

---

## NOT Building (Scope Limits)

- The JS interactions file (`scripts/mina-world.js`) only has tab switching and swatch clicking — we already have that in React
- OS widgets (`widgets.html`) are out of scope for this web app
- The launcher/gallery view from `landing.html` will be adapted but not iframe-embedded

---

## Mandatory Reading

| Priority | File | Lines | Why Read This |
|----------|------|-------|---------------|
| P0 | `Designer/Mina's-World/styles/mina-world.css` | 1-624 | Design tokens + chibi CSS + components to port |
| P0 | `Designer/Mina's-World/screens/02-avatar.html` | Full | Target avatar screen layout |
| P0 | `Designer/Mina's-World/screens/03-world-builder.html` | Full | Target world builder layout |
| P1 | `src/app/studio/page.tsx` | Full | Current avatar page to restyle |
| P1 | `src/app/worlds/page.tsx` | Full | Current world page to restyle |
| P1 | `src/app/page.tsx` | Full | Current landing page to restyle |
| P1 | `src/store/avatarStore.ts` | Full | State structure for chibi variables |

---

## Patterns to Mirror

**CSS Custom Properties for Chibi:**
```css
/* SOURCE: Designer/Mina's-World/styles/mina-world.css:264-424 */
.chibi { width: 160px; height: 200px; position: relative; }
.chibi .hair-back { ... background: var(--hair, var(--violet)); }
.chibi .eye { ... background: var(--eyes, oklch(34% 0.11 246)); }
.chibi .body { ... background: var(--outfit, var(--mint)); }
```

**OKLCH Color Tokens:**
```css
/* SOURCE: Designer/Mina's-World/styles/mina-world.css:1-18 */
:root {
  --bg: oklch(98% 0.004 240);
  --surface: oklch(100% 0 0);
  --fg: oklch(20% 0.02 240);
  --accent: oklch(56% 0.12 170);
  --bubble: oklch(93% 0.06 350);
  --star: oklch(90% 0.12 92);
  --sky: oklch(90% 0.08 230);
  --violet: oklch(78% 0.12 298);
  --mint: oklch(86% 0.11 164);
  --coral: oklch(76% 0.13 24);
}
```

**Panel/Card Pattern:**
```css
/* SOURCE: Designer/Mina's-World/styles/mina-world.css:107-116 */
.hero-card, .panel, .sheet, .quest-card, .world-card {
  background: color-mix(in oklch, var(--surface), var(--sky) 6%);
  border: 1px solid color-mix(in oklch, var(--border), white 35%);
  border-radius: 28px;
  box-shadow: 0 16px 42px color-mix(in oklch, var(--sky), black 8%);
}
```

---

## Files to Change

| File | Action | Justification |
|------|--------|---------------|
| `src/styles/design-system.css` | CREATE | Global OKLCH tokens + chibi CSS + component utilities |
| `src/components/ChibiAvatar.tsx` | CREATE | CSS chibi renderer ported from design |
| `src/components/BottomNav.tsx` | CREATE | Shared 4-tab bottom navigation |
| `src/app/studio/page.tsx` | UPDATE | Restyle to match design's avatar screen |
| `src/app/worlds/page.tsx` | UPDATE | Restyle to match design's world builder screen |
| `src/app/page.tsx` | UPDATE | Restyle landing to match design's hero + gallery |

---

## Step-by-Step Tasks

### Task 1: CREATE `src/styles/design-system.css`

**Action**: CREATE
**Details**: Port the complete CSS from `styles/mina-world.css` into the Next.js app. Include:
- `:root` OKLCH tokens
- `.phone-screen`, `.app-shell`, `.ios-status` layout utilities
- `.panel`, `.hero-card`, `.sheet`, `.world-card`, `.mini-card` component styles
- `.pill-tabs`, `.preset-row`, `.palette-row` control styles
- `.bottom-nav` navigation styles
- `.chibi`, `.chibi .hair-back`, `.chibi .face`, `.chibi .eye`, etc. avatar styles
- `.world-grid`, `.tile` world builder styles
- `.friend-row`, `.quest-row`, `.safety-row` list styles
- `.primary-btn`, `.secondary-btn`, `.icon-btn` button styles
- `.progress`, `.badge` utility styles
- `@media (max-width: 860px)` responsive rule

**Mirror**: `Designer/Mina's-World/styles/mina-world.css`
**Imports**: Add to `src/app/layout.tsx` or `src/app/globals.css`
**Gotcha**: Tailwind may conflict with these class names — ensure specificity or use `!important` sparingly
**Validate**: `npm run build` passes

### Task 2: CREATE `src/components/ChibiAvatar.tsx`

**Action**: CREATE
**Details**: React component that renders the CSS chibi. Props:
- `hairColor?: string` — OKLCH value for `--hair`
- `eyeColor?: string` — OKLCH value for `--eyes`
- `outfitColor?: string` — OKLCH value for `--outfit`
- `streakColor?: string` — OKLCH value for `--streak`
- `showBow?: boolean`
- `showStreak?: boolean`
- `blushOpacity?: number`

Uses inline `style` with CSS custom properties to drive the chibi appearance. Port the exact HTML structure from `screens/02-avatar.html:24-37`.

**Mirror**: `Designer/Mina's-World/styles/mina-world.css:264-424` + `screens/02-avatar.html:24-37`
**Imports**: None — pure CSS + HTML
**Gotcha**: The chibi uses absolute positioning with percentages — verify it scales correctly
**Validate**: Render in browser, confirm it looks like the design export

### Task 3: CREATE `src/components/BottomNav.tsx`

**Action**: CREATE
**Details**: Shared bottom navigation with 4 tabs: Home, Avatar, Build, Quests. Active tab highlighted. Uses Next.js `Link` for navigation. Style matches `.bottom-nav` from design.

**Mirror**: `Designer/Mina's-World/styles/mina-world.css:485-510`
**Imports**: `next/link`
**Gotcha**: Must work across all pages
**Validate**: Click each tab, verify navigation works

### Task 4: UPDATE `src/app/studio/page.tsx`

**Action**: UPDATE
**Details**: Replace current complex layout with design's avatar screen:
- Top bar with "Avatar Studio" chip and save button
- Pill tabs for Hair / Eyes / Outfit / Extras
- Chibi stage with `<ChibiAvatar />`
- Color swatch palette (4 swatches matching design)
- Safety style rules panel
- BottomNav component

Keep the Zustand store integration — map store values to chibi CSS variables.

**Mirror**: `Designer/Mina's-World/screens/02-avatar.html`
**Imports**: `ChibiAvatar`, `BottomNav`
**Gotcha**: Must still save to Supabase API
**Validate**: `npm run build` passes; click swatches, chibi updates

### Task 5: UPDATE `src/app/worlds/page.tsx`

**Action**: UPDATE
**Details**: Replace current raw grid with design's world builder:
- Top bar with world name chip and undo button
- World card with kicker "Builder" + title + progress badge
- 5×5 emoji tile grid with colored backgrounds
- "Place a piece" panel with preset buttons (Tree, House, Flower, Cafe)
- Parent note mini-card
- BottomNav component

Keep the store integration for tile painting and building placement.

**Mirror**: `Designer/Mina's-World/screens/03-world-builder.html`
**Imports**: `BottomNav`
**Gotcha**: Must still save to `/api/worlds`
**Validate**: `npm run build` passes; click tiles, click presets, tiles update

### Task 6: UPDATE `src/app/page.tsx`

**Action**: UPDATE
**Details**: Replace current generic landing with design-inspired layout:
- Hero card with "Mina's World" title, tagline, gradient blob decoration
- Screen gallery grid showing 5 phone-frame cards linking to screens
- Snapshot grid with 4 mini-cards (friends, safety, build, quests)
- Keep links to `/studio` and `/worlds`

**Mirror**: `Designer/Mina's-World/landing.html` (adapted, not iframe)
**Imports**: `Link` from next/link
**Gotcha**: Make it responsive — the design has a `@media (max-width: 860px)` rule
**Validate**: `npm run build` passes; layout looks good at 390×844 and 1440×900

---

## Testing Strategy

### Edge Cases Checklist

- [ ] Chibi renders correctly with all 4 color swatches
- [ ] Swatch click updates chibi immediately
- [ ] World builder grid clickable at all zoom levels
- [ ] Bottom nav active state matches current route
- [ ] Responsive layout works on mobile (360px) and desktop (1440px)
- [ ] Save buttons still work with Supabase API

---

## Validation Commands

**Runner**: npm

1. **Type check**: `npm run build` (Next.js includes TypeScript check)
2. **Lint**: `npm run lint`
3. **Manual verification**: Open `http://localhost:3000`, verify all 3 pages match design

## Acceptance Criteria

- [ ] All 3 pages (landing, studio, worlds) use the OKLCH design tokens
- [ ] CSS chibi avatar renders and updates with swatch clicks
- [ ] Bottom navigation appears on all pages with correct active state
- [ ] World builder has the 5×5 emoji grid with colored tiles
- [ ] Layout matches the design export at mobile and desktop viewports
- [ ] `npm run build` passes with no errors
- [ ] Save functionality still works with Supabase API

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tailwind conflicts with design CSS | Medium | Medium | Use specific class names, load design CSS after Tailwind |
| OKLCH colors don't render in old browsers | Low | Low | Browsers that support Next.js 16 support OKLCH |
| Chibi CSS doesn't scale well in React | Low | Medium | Use inline styles with CSS variables, test at multiple sizes |
