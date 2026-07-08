# Phase 1 Fun Minute

Phase 1 implements the first playable loop in code:

`walk -> mount tractor -> drive -> plant -> water -> harvest -> NPC thanks player -> Helping Stars save`

This repository cannot author Unity scene or prefab files through the editor, so the
Phase 1 deliverable here is the runtime code and exact scene assembly checklist.
Open `unity/` in Unity 6 to create the scene and assets.

## Runtime Pieces

- `Farming/CropPlot.cs` - one-button plant, water, harvest loop backed by `CropDefinition`.
- `Npcs/HelpfulNpc.cs` - NPC narration and job completion backed by `JobDefinition`.
- `UI/HelpingStarsCounter.cs` - event bridge from `GameState` to UI text.
- `UI/NarrationText.cs` - event bridge for kid-facing helper text or narration subtitles.
- `Vehicles/VehicleController.cs` - data-driven starter tractor with mount/dismount.
- `Player/PlayerIntent.cs` and `PlayerInputBridge.cs` - movement, interaction, driving input.

## Scene Assembly Checklist

1. Open `unity/` in Unity 6.
2. Create `Assets/GrandTractorAuto/Scenes/Phase1_FunMinute.unity`.
3. Add a ground plane and a few bright primitive landmarks.
4. Add an empty `GameState` object with the `GameState` component.
5. Create a player capsule with:
   - `Interactor`
   - `PlayerIntent`
   - `PlayerInputBridge`
   - `PlayerInput` configured with `Move` and `Interact` actions
6. Create `VehicleDefinition` asset `StarterTractor`.
7. Build a tractor from primitives, add Rigidbody, collider, `VehicleController`, seat anchor, and exit anchor.
8. Create `CropDefinition` asset `Carrot` and assign placeholder visual prefabs for seedling, growing, and ready states.
9. Add a crop plot object with collider, `CropPlot`, `AudioSource`, and references to `Carrot` and `GameState`.
10. Create `JobDefinition` asset `FirstHarvest`.
11. Add an NPC capsule with collider, `HelpfulNpc`, and references to `FirstHarvest`, the crop plot, and `GameState`.
12. Add simple UI text for Helping Stars and narration, then bind UnityEvents from `HelpingStarsCounter` and `NarrationText`.

## Acceptance Gate

- A child can move, mount the tractor, drive to the crop plot, and dismount.
- One interaction button plants, waters, and harvests the crop.
- Harvesting awards Helping Stars and persists through `SaveService`.
- The NPC thanks the player and completes the job without hardcoded job IDs.
- No timers, fail states, damage, lives, or game-over paths exist.
