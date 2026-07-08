# ScriptableObject Schemas

These are the Phase 0 data contracts. Keep them stable unless a real vertical
slice proves a field is wrong.

## VehicleDefinition

- `id`: stable save/content key, for example `vehicle.tractor.starter`.
- `displayName`: kid-facing name.
- `category`: grouping for unlock menus and parent mode.
- `maxSpeed`, `acceleration`, `turnSpeed`, `canReverse`: shared movement tuning.
- `prefab`: configured vehicle prefab.
- `engineLoop`, `hornSound`: non-reader feedback.
- `interactionTags`: capability tags such as `drive`, `tow`, `water`.
- `attachmentSlots`: named slots such as `front`, `rear`, `bed`.

## CropDefinition

- `id`: stable save/content key, for example `crop.carrot`.
- `displayName`: kid-facing name.
- `wateringStepsToHarvest`: number of gentle interactions before harvest.
- `helpingStarsOnHarvest`: reward amount.
- `seedlingPrefab`, `growingPrefab`, `harvestReadyPrefab`: visual states.
- `plantSound`, `waterSound`, `harvestSound`: interaction feedback.

## JobDefinition

- `id`: stable save/content key, for example `job.farm.first_harvest`.
- `displayName`: parent/debug name.
- `type`: broad job category.
- `narrationPrompt`, `narrationClip`: spoken guidance.
- `helpingStarsReward`: completion reward.
- `requiredInteractionTags`: ordered interaction capabilities needed by the loop.
- `unlocksOnComplete`: content IDs unlocked by completion.
