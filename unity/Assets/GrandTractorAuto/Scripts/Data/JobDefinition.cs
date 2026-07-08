using UnityEngine;

namespace GrandTractorAuto.Data
{
    public enum JobType
    {
        Farming,
        Delivery,
        Cleanup,
        Rescue,
        Construction
    }

    [CreateAssetMenu(menuName = "Grand Tractor Auto/Job Definition", fileName = "JobDefinition")]
    public sealed class JobDefinition : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string id = "job.farm.first_harvest";
        [SerializeField] private string displayName = "First Harvest";
        [SerializeField] private JobType type = JobType.Farming;

        [Header("Kid-Facing Guidance")]
        [TextArea]
        [SerializeField] private string narrationPrompt = "Let's help the garden grow.";
        [SerializeField] private AudioClip narrationClip;

        [Header("Progression")]
        [SerializeField, Min(0)] private int helpingStarsReward = 1;
        [SerializeField] private string[] requiredInteractionTags = { "plant", "water", "harvest" };
        [SerializeField] private string[] unlocksOnComplete;

        public string Id => id;
        public string DisplayName => displayName;
        public JobType Type => type;
        public string NarrationPrompt => narrationPrompt;
        public AudioClip NarrationClip => narrationClip;
        public int HelpingStarsReward => helpingStarsReward;
        public string[] RequiredInteractionTags => requiredInteractionTags;
        public string[] UnlocksOnComplete => unlocksOnComplete;
    }
}
