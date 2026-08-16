#if ENABLE_INPUT_SYSTEM
using UnityEngine;
using UnityEngine.InputSystem;

namespace GrandTractorAuto.Player
{
    [RequireComponent(typeof(PlayerIntent))]
    public sealed class PlayerInputBridge : MonoBehaviour
    {
        private PlayerIntent intent;

        private void Awake()
        {
            intent = GetComponent<PlayerIntent>();
        }

        public void OnMove(InputValue value)
        {
            intent.SetMoveInput(value.Get<Vector2>());
        }

        public void OnInteract(InputValue value)
        {
            if (value.isPressed)
            {
                intent.RequestInteract();
            }
        }
    }
}
#endif
