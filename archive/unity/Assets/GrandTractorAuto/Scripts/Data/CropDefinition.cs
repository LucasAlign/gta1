using UnityEngine;

namespace GrandTractorAuto.Data
{
    [CreateAssetMenu(menuName = "Grand Tractor Auto/Crop Definition", fileName = "CropDefinition")]
    public sealed class CropDefinition : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string id = "crop.carrot";
        [SerializeField] private string displayName = "Carrot";

        [Header("Growth")]
        [SerializeField, Min(1)] private int wateringStepsToHarvest = 2;
        [SerializeField, Min(0)] private int helpingStarsOnHarvest = 1;

        [Header("Presentation")]
        [SerializeField] private GameObject seedlingPrefab;
        [SerializeField] private GameObject growingPrefab;
        [SerializeField] private GameObject harvestReadyPrefab;
        [SerializeField] private AudioClip plantSound;
        [SerializeField] private AudioClip waterSound;
        [SerializeField] private AudioClip harvestSound;

        public string Id => id;
        public string DisplayName => displayName;
        public int WateringStepsToHarvest => wateringStepsToHarvest;
        public int HelpingStarsOnHarvest => helpingStarsOnHarvest;
        public GameObject SeedlingPrefab => seedlingPrefab;
        public GameObject GrowingPrefab => growingPrefab;
        public GameObject HarvestReadyPrefab => harvestReadyPrefab;
        public AudioClip PlantSound => plantSound;
        public AudioClip WaterSound => waterSound;
        public AudioClip HarvestSound => harvestSound;
    }
}
