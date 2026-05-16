# Feature: Mina's World — Full Game

## Summary

Turn the static screens into a real playable game. Avatar walks around worlds, places objects, completes quests, collects rewards, and plays with approved friends in real-time. Add a parent dashboard for approvals and safety controls.

## User Story

As Mina (age 10)
I want to walk my cute avatar around my world, place objects, visit friends' worlds, collect quest rewards, and chat with stickers
So that I can play a real game with my friends that my parents trust

## Problem Statement

Current state is static mockups:
- `/worlds` shows a grid of colored tiles — no character, no movement, no interaction
- `/friends` shows demo data — no real friend system, no parent approval flow
- `/quests` shows a static progress bar — no actual completion tracking
- No inventory system — rewards don't exist
- No parent dashboard — approvals are faked
- No real-time multiplayer — friends can't see each other

## Solution Statement

### Phase 1: Playable World (Highest Impact)
1. **Avatar movement** — Add a controllable character to `/worlds` that walks with arrow keys / touch joystick
2. **Object placement** — Place objects from inventory by clicking tiles near the avatar
3. **Collision** — Avatar can't walk through placed objects or world edges
4. **Camera follow** — Camera follows the avatar in a larger world

### Phase 2: Real-Time Multiplayer
5. **Supabase Realtime channels** — Sync avatar positions across clients
6. **Friend visit system** — Tap "Visit" on a friend → join their world session
7. **Visitor avatars** — See friends' avatars walking around in your world
8. **Shared object placement** — See objects friends place in real-time

### Phase 3: Game Loop
9. **Quest completion tracking** — Quests complete when actions are performed (place 3 trees, invite friend, name world)
10. **Inventory system** — Rewards from quests go into inventory, can be equipped/used
11. **Catalog shop** — Spend in-game currency (stars) on new outfits, tiles, objects
12. **Daily login rewards** — Gentle reward loop

### Phase 4: Parent System
13. **Parent dashboard** (`/parent`) — Approve/reject friend requests, set play timers, review activity log
14. **Friend approval flow** — Kid sends request → parent approves on dashboard → friend is added
15. **Activity log** — Track world visits, objects placed, quests completed, time spent

### Phase 5: Polish
16. **Sound effects** — Kawaii pop sounds, footsteps, reward chimes, sticker send
17. **Particle effects** — Sparkles on quest complete, hearts on sticker send, stars on reward
18. **Animations** — Bouncy walk cycle, object placement puff, UI transitions
19. **iPad native feel** — Landscape support, PWA manifest, add-to-homescreen

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY |
| Complexity | HIGH |
| Systems Affected | Frontend (Canvas/game loop), Backend (Realtime), Database (new tables), Design |
| Dependencies | Existing Supabase schema + Realtime |
| Estimated Tasks | 19 |
| Confidence | 7/10 — this is a genuine game engine build, complex but doable |

---

## NOT Building (Scope Limits)

- 3D / WebGL — stays 2D CSS/SVG for simplicity and iPad performance
- Custom game engine — use HTML/CSS with requestAnimationFrame, not Phaser/Pixi
- Voice chat — preset stickers + phrases only
- Push notifications — out of scope for now
- Native app build — web PWA only
- Server-side physics — client-side prediction only

---

## Step-by-Step Tasks

### Task 1: CREATE `src/components/GameWorld.tsx` — Playable World with Avatar Movement

A canvas-like game area using div-based rendering:
- Grid of tiles (existing world grid, but larger)
- Avatar character positioned at a tile coordinate
- Arrow keys / WASD / touch joystick for movement
- Avatar animates (bouncy CSS) when walking
- Camera follows avatar (scrolls the grid)
- Click nearby tile to place selected object

**Avatar Movement:**
```tsx
const [avatarPos, setAvatarPos] = useState({ x: 2, y: 2 }); // tile coordinates
const [facing, setFacing] = useState<'up' | 'down' | 'left' | 'right'>('down');
const [isWalking, setIsWalking] = useState(false);

// Handle keydown
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (['ArrowUp', 'w', 'W'].includes(e.key)) move(0, -1, 'up');
    if (['ArrowDown', 's', 'S'].includes(e.key)) move(0, 1, 'down');
    if (['ArrowLeft', 'a', 'A'].includes(e.key)) move(-1, 0, 'left');
    if (['ArrowRight', 'd', 'D'].includes(e.key)) move(1, 0, 'right');
  };
  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, [avatarPos]);
```

**Collision:** Check if target tile has an object before moving.

**Camera:** Use CSS `transform: translate()` on a wrapper div to keep avatar centered.

**Touch Joystick:** Virtual D-pad at bottom of screen for iPad.

**Validate:** Open `/worlds`, walk around with arrow keys, place objects by clicking nearby tiles.

### Task 2: UPDATE `src/app/worlds/page.tsx` — Integrate GameWorld

Replace the static tile grid with the GameWorld component. Keep the top bar, piece picker, and BottomNav.

### Task 3: CREATE `src/store/gameStore.ts` — Game State Management

Zustand store for:
- `avatarPosition: { x, y }`
- `placedObjects: Array<{ x, y, type, emoji, placedBy }>`
- `inventory: Array<{ id, type, name, emoji, quantity }>`
- `coins: number`
- `questsCompleted: string[]`
- `actions: { moveAvatar, placeObject, addToInventory, spendCoins, completeQuest }`

### Task 4: CREATE `src/components/VirtualDpad.tsx` — Touch Controls for iPad

Four directional buttons arranged in a cross, plus an action button. Large touch targets (60px). Positioned at bottom-left of game area so thumbs can reach.

### Task 5: CREATE `src/app/api/sessions/route.ts` — Enhanced with Position Sync

Update the existing sessions API to accept avatar position updates via POST, and broadcast via Supabase Realtime channel.

### Task 6: UPDATE `src/hooks/useRealtimePresence.ts` — Sync Positions and Objects

Track:
- Player positions (broadcast own, receive others')
- Object placements (broadcast when placing, receive when others place)
- Session state (who's online)

### Task 7: CREATE `src/app/inventory/page.tsx` — Inventory Screen

Show all collected items in a grid. Categories: outfits, objects, stickers, badges. Tap to equip/use. Show coin balance at top. Link from BottomNav or avatar chip.

### Task 8: CREATE `src/store/questStore.ts` — Quest Progress

Track active quest state:
- `activeQuest: Quest`
- `progress: { treesPlaced: 0, friendsInvited: 0, worldNamed: false }`
- Auto-complete quest when all conditions met
- Trigger reward on complete

### Task 9: UPDATE `src/app/quests/page.tsx` — Real Quest Completion

Wire the quest steps to actual game actions:
- Step 1 "Add soft trees" → completes when `treesPlaced >= 3`
- Step 2 "Invite one approved friend" → completes when `friendsInvited >= 1`
- Step 3 "Choose a garden name" → completes when world is named

### Task 10: CREATE `src/app/parent/page.tsx` — Parent Dashboard

Desktop-optimized page (not phone-screen):
- Friend requests table (approve/reject)
- Activity log (world visits, time spent, objects placed)
- Safety settings (chat mode, play timer, sharing level)
- Play timer control (15/20/30/60 min)

### Task 11: UPDATE `src/app/friends/page.tsx` — Real Friend Requests

- "Add friend" flow: enter friend's code → send request → parent approves → friend added
- Show pending requests
- Show approved friends with online status
- Visit button only for approved friends

### Task 12: CREATE `src/components/ParticleEffects.tsx` — Sparkles and Hearts

CSS-based particle system:
- Sparkle burst on quest complete
- Floating hearts on sticker send
- Puff of smoke on object placement
- Star trail on coin collection

### Task 13: ADD sound effects

Use Web Audio API or simple HTMLAudioElement:
- `pop.mp3` — object placed
- `step.mp3` — footstep (quiet)
- `chime.mp3` — quest complete
- `sticker.mp3` — sticker sent
- `coin.mp3` — coin earned
- Simple synthesized sounds as fallback

### Task 14: CREATE `public/manifest.json` — PWA Support

So Mina can "Add to Home Screen" on her iPad and it feels like a native app.

### Task 15: CREATE `public/sw.js` — Service Worker

Basic offline support: cache static assets, show offline page if no connection.

### Task 16: UPDATE `src/styles/design-system.css` — Animation Keyframes

Add:
- `@keyframes bounce` — for walking avatar
- `@keyframes sparkle` — for particles
- `@keyframes popIn` — for object placement
- `@keyframes slideUp` — for modal entry
- `@keyframes pulse` — for quest completion

### Task 17: UPDATE `src/app/onboarding/page.tsx` — First-Time Flow

If no avatar created, redirect to `/studio`. If no world created, suggest starter world.

### Task 18: UPDATE `src/components/BottomNav.tsx` — Add Inventory Link

Change to 6 tabs or add inventory as a modal. Probably add a bag icon to the topbar instead.

### Task 19: VISUAL VERIFICATION

Play through the full loop:
1. Create avatar → save
2. Pick starter world → walk around → place 3 trees
3. Go to quests → quest completes → earn moon bow
4. Check inventory → moon bow is there
5. Visit friend's world → see their avatar
6. Send sticker → hearts animation
7. Parent dashboard → approve a friend request

---

## Acceptance Criteria

- [ ] Avatar walks around the world with arrow keys and touch D-pad
- [ ] Objects can be placed by clicking nearby tiles
- [ ] Collision prevents walking through objects and world edges
- [ ] Camera follows the avatar smoothly
- [ ] Friends' avatars appear in real-time when visiting
- [ ] Quests complete automatically when conditions are met
- [ ] Rewards go to inventory and can be viewed
- [ ] Parent dashboard shows friend requests and activity log
- [ ] Friend approval requires parent confirmation
- [ ] Sound effects play on key actions
- [ ] Particle effects on quest complete, sticker send, object placement
- [ ] App works as PWA on iPad (add to homescreen, offline support)
- [ ] `npm run build` passes
- [ ] No horizontal scroll on any mobile viewport
- [ ] All touch targets >= 44px
