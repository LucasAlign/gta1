# Grand Tractor Auto Unity Scaffold

Unity 6 project root for the kid-safe vertical slice.

## Folder Contract

- `Scripts/Core` - app-level state, save/load, and shared utility types.
- `Scripts/Data` - ScriptableObject schemas. Add content here before adding behavior.
- `Scripts/Interaction` - one-button interaction discovery and dispatch.
- `Scripts/Vehicles` - data-driven vehicle controller and mounting logic.
- `Scripts/Player` - child avatar movement, camera anchors, and player intent.
- `Scripts/Progression` - Helping Stars, unlocks, and gentle reward state.
- `ScriptableObjects` - authored vehicle, crop, job, NPC, and reward assets.
- `Scenes` - gray-box Phase 0 scene and later vertical-slice scenes.
- `Prefabs` - reusable configured objects that bind data assets to scene objects.
- `Art` - imported stylized asset packs and generated placeholder meshes/materials.
- `Audio` - narration, UI feedback, vehicle loops, and interaction sounds.

Generated Unity folders such as `Library`, `Temp`, `Obj`, `Logs`, and `UserSettings`
are intentionally ignored by Git.
