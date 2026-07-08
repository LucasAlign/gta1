# Godot Pivot

The project has pivoted from Unity 6 to Godot 4 because the target development
machine cannot comfortably run Unity 6. Godot 4 should be opened with the
Compatibility renderer, which is already configured in `godot/project.godot`.

## What Changed

- Unity `ScriptableObject` schemas are now Godot `Resource` scripts.
- Unity `GameState` is now a Godot autoload singleton at `scripts/core/game_state.gd`.
- Unity `IInteractable` is now a duck-typed contract: nodes implement
  `can_interact(interactor)`, `interact(interactor)`, and optionally
  `get_interaction_label()`.
- Unity scenes/prefabs are replaced by Godot `.tscn` scenes and `.tres` resources.
- The Unity folder remains in the repo as reference until the Godot version is proven.

## Open The Project

1. Install Godot 4.x.
2. Open the `godot/` folder as an existing project.
3. Confirm the renderer is `gl_compatibility` in Project Settings if Godot prompts.
4. Run the main scene: `res://scenes/phase1_fun_minute.tscn`.

## Controls

- WASD: move/walk/drive
- Space: interact, mount tractor, dismount tractor

## Phase 1 Loop

The main scene supports:

`walk -> mount tractor -> drive -> dismount -> plant -> water -> harvest -> NPC thanks player -> Helping Stars save`
