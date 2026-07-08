# Architecture Map

## Data Resources

- `scripts/data/vehicle_definition.gd` -> `resources/starter_tractor.tres`
- `scripts/data/crop_definition.gd` -> `resources/carrot.tres`
- `scripts/data/job_definition.gd` -> `resources/first_harvest.tres`

## Runtime Systems

- `scripts/core/game_state.gd`: save/load, Helping Stars, completed jobs, narration signal.
- `scripts/interaction/interactor.gd`: one-button nearest-interactable scanner.
- `scripts/player/player_controller.gd`: walking, interaction, vehicle handoff.
- `scripts/vehicles/vehicle_controller.gd`: slow kid-safe tractor movement.
- `scripts/farming/crop_plot.gd`: plant, water, harvest loop.
- `scripts/npcs/helpful_npc.gd`: job prompt and completion after harvest.
- `scripts/ui/hud.gd`: stars, narration, and interaction prompt display.

## Content Rule

Add new vehicles, crops, and jobs as `.tres` resources first. Only add code when
shared behavior is missing.
