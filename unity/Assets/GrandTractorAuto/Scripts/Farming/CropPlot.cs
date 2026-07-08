using System;
using GrandTractorAuto.Core;
using GrandTractorAuto.Data;
using GrandTractorAuto.Interaction;
using UnityEngine;

namespace GrandTractorAuto.Farming
{
    public enum CropPlotState
    {
        Empty,
        Planted,
        Growing,
        HarvestReady
    }

    [RequireComponent(typeof(Collider))]
    public sealed class CropPlot : MonoBehaviour, IInteractable
    {
        [SerializeField] private CropDefinition crop;
        [SerializeField] private GameState gameState;
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private Transform visualRoot;

        private GameObject currentVisual;
        private int wateringProgress;

        public event Action<CropDefinition> Harvested;

        public CropPlotState State { get; private set; } = CropPlotState.Empty;
        public string InteractionLabel => GetInteractionLabel();
        public Transform InteractionTransform => transform;

        private void Awake()
        {
            if (visualRoot == null)
            {
                visualRoot = transform;
            }

            RefreshVisual();
        }

        public bool CanInteract(Interactor interactor)
        {
            return crop != null && isActiveAndEnabled;
        }

        public void Interact(Interactor interactor)
        {
            switch (State)
            {
                case CropPlotState.Empty:
                    Plant();
                    break;
                case CropPlotState.Planted:
                case CropPlotState.Growing:
                    Water();
                    break;
                case CropPlotState.HarvestReady:
                    Harvest();
                    break;
            }
        }

        public void Plant()
        {
            if (crop == null || State != CropPlotState.Empty)
            {
                return;
            }

            wateringProgress = 0;
            State = CropPlotState.Planted;
            Play(crop.PlantSound);
            RefreshVisual();
        }

        public void Water()
        {
            if (crop == null || State == CropPlotState.Empty || State == CropPlotState.HarvestReady)
            {
                return;
            }

            wateringProgress += 1;
            State = wateringProgress >= crop.WateringStepsToHarvest ? CropPlotState.HarvestReady : CropPlotState.Growing;
            Play(crop.WaterSound);
            RefreshVisual();
        }

        public void Harvest()
        {
            if (crop == null || State != CropPlotState.HarvestReady)
            {
                return;
            }

            Play(crop.HarvestSound);
            gameState?.AwardHelpingStars(crop.HelpingStarsOnHarvest);
            Harvested?.Invoke(crop);

            wateringProgress = 0;
            State = CropPlotState.Empty;
            RefreshVisual();
        }

        private string GetInteractionLabel()
        {
            if (crop == null)
            {
                return "Garden";
            }

            return State switch
            {
                CropPlotState.Empty => $"Plant {crop.DisplayName}",
                CropPlotState.Planted => $"Water {crop.DisplayName}",
                CropPlotState.Growing => $"Water {crop.DisplayName}",
                CropPlotState.HarvestReady => $"Pick {crop.DisplayName}",
                _ => "Garden"
            };
        }

        private void RefreshVisual()
        {
            if (currentVisual != null)
            {
                Destroy(currentVisual);
            }

            var prefab = GetVisualPrefab();
            if (prefab == null || visualRoot == null)
            {
                currentVisual = null;
                return;
            }

            currentVisual = Instantiate(prefab, visualRoot);
            currentVisual.transform.localPosition = Vector3.zero;
            currentVisual.transform.localRotation = Quaternion.identity;
        }

        private GameObject GetVisualPrefab()
        {
            if (crop == null)
            {
                return null;
            }

            return State switch
            {
                CropPlotState.Planted => crop.SeedlingPrefab,
                CropPlotState.Growing => crop.GrowingPrefab,
                CropPlotState.HarvestReady => crop.HarvestReadyPrefab,
                _ => null
            };
        }

        private void Play(AudioClip clip)
        {
            if (audioSource != null && clip != null)
            {
                audioSource.PlayOneShot(clip);
            }
        }
    }
}
