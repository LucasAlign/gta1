using UnityEngine;

namespace GrandTractorAuto.Data
{
    public enum VehicleCategory
    {
        Farm,
        TownService,
        Construction,
        Beach,
        Forest
    }

    [CreateAssetMenu(menuName = "Grand Tractor Auto/Vehicle Definition", fileName = "VehicleDefinition")]
    public sealed class VehicleDefinition : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string id = "vehicle.tractor.starter";
        [SerializeField] private string displayName = "Starter Tractor";
        [SerializeField] private VehicleCategory category = VehicleCategory.Farm;

        [Header("Movement")]
        [SerializeField, Min(0f)] private float maxSpeed = 6f;
        [SerializeField, Min(0f)] private float acceleration = 8f;
        [SerializeField, Min(0f)] private float turnSpeed = 90f;
        [SerializeField] private bool canReverse = true;

        [Header("Presentation")]
        [SerializeField] private GameObject prefab;
        [SerializeField] private AudioClip engineLoop;
        [SerializeField] private AudioClip hornSound;

        [Header("Capabilities")]
        [SerializeField] private string[] interactionTags = { "drive" };
        [SerializeField] private string[] attachmentSlots = { "rear" };

        public string Id => id;
        public string DisplayName => displayName;
        public VehicleCategory Category => category;
        public float MaxSpeed => maxSpeed;
        public float Acceleration => acceleration;
        public float TurnSpeed => turnSpeed;
        public bool CanReverse => canReverse;
        public GameObject Prefab => prefab;
        public AudioClip EngineLoop => engineLoop;
        public AudioClip HornSound => hornSound;
        public string[] InteractionTags => interactionTags;
        public string[] AttachmentSlots => attachmentSlots;
    }
}
