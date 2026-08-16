using GrandTractorAuto.Data;
using GrandTractorAuto.Interaction;
using UnityEngine;

namespace GrandTractorAuto.Vehicles
{
    [RequireComponent(typeof(Rigidbody))]
    public sealed class VehicleController : MonoBehaviour, IInteractable
    {
        [SerializeField] private VehicleDefinition definition;
        [SerializeField] private Transform seatAnchor;
        [SerializeField] private Transform exitAnchor;

        private Rigidbody body;
        private float throttle;
        private float steering;

        public VehicleDefinition Definition => definition;
        public bool HasDriver { get; private set; }
        public Transform Driver { get; private set; }
        public string InteractionLabel => HasDriver || definition == null ? "Ride" : $"Drive {definition.DisplayName}";
        public Transform InteractionTransform => seatAnchor != null ? seatAnchor : transform;

        private void Awake()
        {
            body = GetComponent<Rigidbody>();
        }

        private void FixedUpdate()
        {
            if (definition == null || !HasDriver)
            {
                return;
            }

            var targetVelocity = transform.forward * (throttle * definition.MaxSpeed);
            var velocityChange = targetVelocity - body.linearVelocity;
            body.AddForce(Vector3.ClampMagnitude(velocityChange, definition.Acceleration), ForceMode.Acceleration);

            var yaw = steering * definition.TurnSpeed * Time.fixedDeltaTime;
            body.MoveRotation(body.rotation * Quaternion.Euler(0f, yaw, 0f));
        }

        public void SetInput(float drive, float turn)
        {
            throttle = definition != null && !definition.CanReverse ? Mathf.Clamp01(drive) : Mathf.Clamp(drive, -1f, 1f);
            steering = Mathf.Clamp(turn, -1f, 1f);
        }

        public bool CanInteract(Interactor interactor)
        {
            return definition != null && !HasDriver;
        }

        public void Interact(Interactor interactor)
        {
            Mount(interactor.transform);
        }

        public void Mount(Transform rider)
        {
            if (rider == null)
            {
                return;
            }

            HasDriver = true;
            Driver = rider;
            SetInput(0f, 0f);

            if (seatAnchor != null)
            {
                rider.SetPositionAndRotation(seatAnchor.position, seatAnchor.rotation);
                rider.SetParent(seatAnchor);
            }
        }

        public void Dismount()
        {
            if (Driver == null)
            {
                HasDriver = false;
                SetInput(0f, 0f);
                return;
            }

            var exitPosition = exitAnchor != null ? exitAnchor.position : transform.position + transform.right * 1.5f;
            Driver.SetParent(null);
            Driver.position = exitPosition;
            Driver = null;
            HasDriver = false;
            SetInput(0f, 0f);
        }
    }
}
