# Phase 1 Input Actions

Create a Unity Input System action asset with these actions and wire it to `PlayerInput`.

## Move

- Action type: Value
- Control type: Vector2
- Suggested bindings: WASD, left stick, arrow keys
- Send Messages callback: `OnMove`

## Interact

- Action type: Button
- Suggested bindings: Space, south gamepad button
- Send Messages callback: `OnInteract`

The `PlayerInputBridge` receives these callbacks and forwards them into `PlayerIntent`.
