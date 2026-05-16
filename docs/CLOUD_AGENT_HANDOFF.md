# Mina's World Cloud Agent Handoff

## Current State

Mina's World is now committed on `main` in the `minas-world` repo.

Recent commits:
- `17221f6` - Merge Mina's World foundation into main
- `61f5eff` - Build Mina's World foundation and landing prototype

## What Exists

### Foundation
- Next.js app scaffolded and building successfully
- Tailwind styling and app layout configured
- README updated for Mina's World
- Supabase schema drafted in `supabase/schema.sql`

### Landing Experience
- `src/app/page.tsx` wired to the latest pastel prototype direction
- iOS-style preview cards and live snapshot content implemented
- Links currently point toward `/studio` and future `/worlds`

### Avatar Studio
- `src/app/studio/page.tsx`
- `src/components/avatar/AvatarPreview.tsx`
- `src/components/avatar/OptionPicker.tsx`
- `src/store/avatarStore.ts`
- `src/types/avatar.ts`

Implemented capabilities:
- live chibi avatar preview
- body / face / hair / clothing / accessories options
- local state management via Zustand

### World Builder Foundations
- `src/types/world.ts`
- `src/store/worldBuilderStore.ts`

Implemented so far:
- world data types
- biome definitions
- default tile map and theme generators
- world builder state store

Not yet wired into a page:
- world builder UI route
- tile editor canvas
- building placement interactions
- interior design mode
- world API routes

## Known Environment Notes

### Git
- Repo has no remote configured right now.
- `main` exists locally and contains the Mina's World merge.

### Local Serving
- `npm run build` succeeds.
- `next dev` is failing due to a local Next.js/Turbopack root-detection issue in this environment.
- Built output has been previewed by serving `.next` statically as a workaround.

### Copilot / VS Code
- Network checks to GitHub and Copilot endpoints succeeded.
- Prior Copilot Chat failure looked session-related rather than firewall-related.

## Recommended Next Steps

1. Add and push a remote for this repo.
2. Build `src/app/worlds/page.tsx` using `world.ts` and `worldBuilderStore.ts`.
3. Implement a tile-map canvas editor with biome paint tools.
4. Add building placement and object selection.
5. Add save/load world API routes and Supabase persistence.
6. Resolve the local Next.js dev-server issue so `/worlds` can be iterated normally.

## Suggested First Task for Cloud Agent

Create the first playable world-builder screen at `src/app/worlds/page.tsx` with:
- biome picker
- tile palette
- paint/erase tools
- building palette
- simple canvas/grid rendering backed by `useWorldBuilderStore`
- save button stub wired for future API integration

## Important Files
- `src/app/page.tsx`
- `src/app/studio/page.tsx`
- `src/components/avatar/AvatarPreview.tsx`
- `src/components/avatar/OptionPicker.tsx`
- `src/store/avatarStore.ts`
- `src/store/worldBuilderStore.ts`
- `src/types/avatar.ts`
- `src/types/world.ts`
- `supabase/schema.sql`
- `docs/PLATFORM_DESIGN.md`
