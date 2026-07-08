# Phase 1 Cursor/Codex Prompts

Use these prompts after opening `unity/` in Unity 6 and creating the gray-box scene.

## Prompt 1: Crop Plot Loop

Build a `CropPlot` MonoBehaviour that uses `CropDefinition` and implements
`IInteractable`. It should cycle through empty, planted, watered, and harvest-ready
states. On harvest, it should award the crop's Helping Stars through `GameState`,
play configured audio if present, and reset to empty. Do not add timers or failure
states. Keep crop content in ScriptableObjects.

## Prompt 2: NPC Thanks Interaction

Build a simple `HelpfulNpc` MonoBehaviour that references a `JobDefinition`, exposes
an `IInteractable`, plays the job narration or placeholder text event, and calls
`GameState.CompleteJob(job)` when the linked crop loop finishes. Do not hardcode
job IDs.

## Prompt 3: Starter Tractor Prefab

Create a starter tractor prefab using primitive meshes and `VehicleController`.
Create a `VehicleDefinition` asset for it with slow kid-safe movement values. The
player should mount it with the same one-button interaction used everywhere else.

## Prompt 4: Gray-Box Scene Assembly

Assemble `Phase1_FunMinute.unity` with a player, camera, starter tractor, one crop
plot, one NPC, and one Helping Star UI counter. The entire loop should be playable
with movement plus one interaction button.
