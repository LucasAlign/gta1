# Grand Tractor Auto — Project Handoff Summary

## What it is

A calm, wholesome open-world exploration game for kids ages 3–6. No violence, no timers, no fail states, no game over. Kids explore a connected small town, help people, and unlock vehicles. The vision spans a farm, town, forest, and beach with dozens of drivable vehicles and optional jobs (farmer, firefighter, mail carrier, construction, etc.), taught through gentle play. Think Farm Sim × Animal Crossing × Bluey, in a Pixar-meets-LEGO stylized 3D look. Built in Unity 6 (URP, new Input System), cross-platform.

**Name status:** "Grand Tractor Auto" is the working title and marketing wink (the anti-GTA angle). Store availability is clear, but the GTA echo carries real trademark risk with Take-Two — keep it as the codename/tagline, and get a trademark attorney to sign off before it's the actual store title. Have a clean public fallback ready (e.g. Sunnyside, Helper Town).

## The five decisions that shape everything

1. **Scope is the enemy.** The full design doc is a multi-year, studio-sized vision. Treat it as a backlog, not a checklist. Every milestone must be gated.
2. **Prove fun before breadth.** The whole game lives or dies on whether driving a tractor and planting a seed is delightful in the first 30 seconds. Validate this with a real 4-year-old before building more.
3. **Buy the art, don't build it.** Commit to one stylized asset pipeline (Synty POLYGON packs nail the look; Kenney is free). Custom modeling is a project-killing trap.
4. **Data-driven from day one.** Every vehicle, crop, job, animal, and quest is a ScriptableObject/JSON asset, not code. This is what lets the game grow — and it's what AI tools do best.
5. **"No fail states" is an architecture constraint.** You never build timers/game-over; progression is unlocks and positive reinforcement (Helping Stars) only.

## The roadmap

Build in this order. Don't skip gates.

| Phase | Deliverable | Gate to pass before moving on |
|-------|-------------|-------------------------------|
| **0 — Technical spine** | Architecture, data schemas, thin core systems (character, camera, interaction, vehicle framework) on a gray box | Systems talk cleanly; nothing hardcoded |
| **1 — The fun minute** | One tractor, one plant→water→harvest loop, one NPC, one Helping Star, save/load | A real 4-year-old smiles and replays |
| **2 — First world chunk** | Full farm, day/night, a few vehicles and jobs | 15–20 min holds a child's attention |
| **3 — Town and services** | Garbage, fire, police, mail job loops | A new job is added with zero new code |
| **4 — Breadth** | Forest, beach, construction, seasons, weather, larger fleet | Content scales without engineering work |
| **5 — Polish and ship** | Parent mode, accessibility, platform builds | Kid-tested, calm, no fail states leak in |

## Cross-cutting notes for whoever picks this up

- **The interaction system is the hidden hard part.** "One button always does the right thing; vehicles enter automatically" must be built as a system where any object registers itself as interactable. Get it right once in Phase 0 and every future feature is just a new registration.
- **The vehicle framework is the technical keystone.** A vehicle is a *config* (wheels, speed, sounds, lights, attachments), never a class you rewrite. If it's bespoke, adding the 12th vehicle is agony.
- **Audio/narration is core UI, not garnish.** For non-readers, sound *is* the interface. Narration and satisfying interaction sounds from Phase 1; placeholder TTS while prototyping.
- **AI-assisted workflow (Claude/Cursor/Codex/Replit):** the human owns the architecture and schemas as fixed contracts. Work in vertical slices (one full feature end-to-end). Always hand the AI the schema + a working example so new content matches the pattern instead of drifting.

## Immediate next step

Make Phase 0 concrete: draft the ScriptableObject schemas (vehicle, crop, job), a clean Unity 6 folder structure, and the first Cursor/Codex prompts to stand up the vertical slice.
