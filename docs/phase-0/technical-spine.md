# Phase 0 Technical Spine

Grand Tractor Auto starts as a Unity 6 URP project under `unity/`. Phase 0 keeps
the game small and contractual: data first, thin runtime systems second, no bespoke
feature logic until the one-minute farm loop proves fun.

## Phase 0 Gate

- Vehicles, crops, and jobs are authored as ScriptableObjects.
- Interactions use one system: nearby objects expose `IInteractable`.
- Vehicle behavior reads a `VehicleDefinition` instead of subclassing per vehicle.
- Helping Stars and job completion persist through `SaveService`.
- The gray-box scene can host one player, one tractor, one crop plot, one NPC, and
  one reward loop without hardcoded content IDs in runtime code.

## Source Contracts

- Vehicle schema: `unity/Assets/GrandTractorAuto/Scripts/Data/VehicleDefinition.cs`
- Crop schema: `unity/Assets/GrandTractorAuto/Scripts/Data/CropDefinition.cs`
- Job schema: `unity/Assets/GrandTractorAuto/Scripts/Data/JobDefinition.cs`
- Interaction contract: `unity/Assets/GrandTractorAuto/Scripts/Interaction/IInteractable.cs`
- Save/progression: `unity/Assets/GrandTractorAuto/Scripts/Core`

## Unity Setup

1. Open the `unity/` folder in Unity 6.
2. Install/enable URP and the new Input System in Package Manager.
3. Create a Phase 0 scene at `Assets/GrandTractorAuto/Scenes/Phase0_Graybox.unity`.
4. Add an empty `GameState` object with the `GameState` component.
5. Add a player capsule with `Interactor` and `PlayerIntent`.
6. Create ScriptableObjects for the starter tractor, carrot crop, and first harvest job.
7. Bind those assets to prefabs instead of hardcoding their values.

## Content Rules

- New content starts as a data asset. If code is needed, update the shared system.
- No fail states, timers, damage, lives, or game-over branches.
- Audio/narration fields exist in schemas even if Phase 0 uses placeholders.
- Use placeholder primitives until the first loop is fun.

## Next Vertical Slice

Phase 1 should create exactly one polished loop:

`drive tractor -> plant seed -> water crop -> harvest -> NPC thanks player -> award Helping Star -> save/load`
