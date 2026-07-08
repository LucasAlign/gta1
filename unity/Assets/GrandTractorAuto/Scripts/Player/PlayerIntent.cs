using GrandTractorAuto.Interaction;
using GrandTractorAuto.Vehicles;
using UnityEngine;

namespace GrandTractorAuto.Player
{
    [RequireComponent(typeof(Interactor))]
    public sealed class PlayerIntent : MonoBehaviour
    {
        [SerializeField] private float walkingSpeed = 4f;

        private Interactor interactor;
        private VehicleController vehicle;
        private Vector2 moveInput;

        private void Awake()
        {
            interactor = GetComponent<Interactor>();
        }

        private void Update()
        {
            if (vehicle != null)
            {
                vehicle.SetInput(moveInput.y, moveInput.x);
                return;
            }

            var direction = new Vector3(moveInput.x, 0f, moveInput.y).normalized;
            transform.position += direction * (walkingSpeed * Time.deltaTime);

            if (direction.sqrMagnitude > 0f)
            {
                transform.rotation = Quaternion.LookRotation(direction);
            }
        }

        public void SetMoveInput(Vector2 input)
        {
            moveInput = Vector2.ClampMagnitude(input, 1f);
        }

        public void RequestInteract()
        {
            if (vehicle != null)
            {
                vehicle.Dismount();
                vehicle = null;
                moveInput = Vector2.zero;
                return;
            }

            interactor.TryInteract();
            vehicle = transform.parent != null ? transform.parent.GetComponentInParent<VehicleController>() : null;
            moveInput = Vector2.zero;
        }
    }
}
